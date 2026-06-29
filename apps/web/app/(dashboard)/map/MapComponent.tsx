/* eslint-disable no-console */
'use client';

import 'mapbox-gl/dist/mapbox-gl.css';

import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { OSStateView } from '@/components/layout/OSStateView';
import { Avatar, CategoryBadge, StatusBadge } from '@/components/ui/primitives';
import { useSocket } from '@/hooks/useSocket';
import { api } from '@/lib/api';

// Use public token or placeholder
mapboxgl.accessToken =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  'pk.eyJ1IjoiY29tbXVuaXR5b3MiLCJhIjoiY2x6d3EwMzN6MDk0cDJqcHhhNnp3bXp3aiJ9.abc';

const CATEGORIES = [
  'all',
  'pothole',
  'water_leak',
  'streetlight',
  'garbage',
  'encroachment',
  'sewage',
  'other',
];

// Helper to calculate distance for flyTo
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getFlyDuration(distance: number) {
  if (distance < 2) return 350;
  if (distance < 10) return 700;
  if (distance < 50) return 1000;
  return 1400;
}

export default function MapPage() {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [activeCat, setActiveCat] = useState('all');
  const [loadingMap, setLoadingMap] = useState(true);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [apiError, setApiError] = useState(false);

  // Fetch issues
  useEffect(() => {
    const fetchIssues = () => {
      setLoadingIssues(true);
      setApiError(false);
      const params = new URLSearchParams();
      if (activeCat !== 'all') params.append('category', activeCat);
      params.append('limit', '100');

      api
        .get(`/api/issues?${params.toString()}`)
        .then((res) => {
          setIssues(res.data.data.issues || []);
          setLoadingIssues(false);
        })
        .catch((err) => {
          console.error('Failed to load map issues:', err);
          setApiError(true);
          setLoadingIssues(false);
        });
    };

    const timeout = setTimeout(fetchIssues, 200);

    const handleResync = () => fetchIssues();
    window.addEventListener('socket:resync', handleResync);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('socket:resync', handleResync);
    };
  }, [activeCat]);

  // Memoize GeoJSON
  const geojson = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: issues
        .filter((i) => i.location && i.location.coordinates)
        .map((i) => ({
          type: 'Feature',
          id: i.id || i._id,
          geometry: { type: 'Point', coordinates: i.location.coordinates },
          properties: {
            id: i.id || i._id,
            title: i.title,
            category: i.category,
            status: i.status,
            votes: i.votes,
            confidence: i.ai_confidence || 85,
          },
        })),
    };
  }, [issues]);

  useSocket({
    'issue.created.v1': (payload: any) => {
      if (activeCat !== 'all' && payload.category !== activeCat) return;
      setIssues((prev) => {
        const newIssue = {
          _id: payload.issueId,
          id: payload.issueId,
          title: payload.title,
          status: 'pending',
          category: payload.category,
          severity: 0,
          ai_confidence: 0,
          location: payload.location,
          votes: 1,
          createdAt: payload.createdAt || new Date().toISOString(),
        };
        return [newIssue, ...prev];
      });

      // Trigger pulse effect
      if (map.current && map.current.isStyleLoaded()) {
        setTimeout(() => {
          map.current?.setFeatureState(
            { source: 'issues', id: payload.issueId },
            { highlight: true }
          );
          setTimeout(() => {
            map.current?.setFeatureState(
              { source: 'issues', id: payload.issueId },
              { highlight: false }
            );
          }, 3000);
        }, 500); // give time for geojson to update
      }
    },
    'issue.updated.v1': (payload: any) => {
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === payload.issueId || issue._id === payload.issueId
            ? { ...issue, category: payload.category || issue.category, severity: payload.severity || issue.severity }
            : issue
        )
      );
    },
    'issue.resolved.v1': (payload: any) => {
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === payload.issueId || issue._id === payload.issueId
            ? { ...issue, status: 'resolved' }
            : issue
        )
      );
    },
    'vote.added.v1': (payload: any) => {
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === payload.issueId || issue._id === payload.issueId
            ? { ...issue, votes: payload.newVoteCount }
            : issue
        )
      );
    },
    'vote.removed.v1': (payload: any) => {
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === payload.issueId || issue._id === payload.issueId
            ? { ...issue, votes: payload.newVoteCount }
            : issue
        )
      );
    },
  });

  // Map Initialization
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-74.006, 40.7128], // NY default
      zoom: 12.5,
      pitch: 60,
      bearing: -17.6,
      antialias: true,
      promoteId: 'id', // Use 'id' property as feature id if top-level id is missing
    } as any);

    map.current.on('load', () => {
      setLoadingMap(false);

      const m = map.current!;

      // Add 3D buildings
      const layers = m.getStyle().layers;
      const labelLayerId = layers?.find(
        (layer) => layer.type === 'symbol' && layer.layout && layer.layout['text-field']
      )?.id;

      m.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 14,
          paint: {
            'fill-extrusion-color': '#0C1017',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.8,
          },
        },
        labelLayerId
      );

      // Add Issues Source (clustered)
      m.addSource('issues', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] } as any,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Clusters Layer
      m.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'issues',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#1E293B',
          'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 50, 40],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#3B82F6',
        },
      });

      // Cluster Count
      m.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'issues',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 14,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      // Unclustered Points
      m.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'issues',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'status'],
            'resolved',
            '#10B981',
            'in_progress',
            '#F59E0B',
            '#3B82F6', // default blue (open)
          ],
          'circle-radius': [
            'case',
            ['boolean', ['feature-state', 'highlight'], false],
            16,
            8
          ],
          'circle-opacity': [
            'case',
            ['boolean', ['feature-state', 'highlight'], false],
            0.8,
            1
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Selected Point glow
      m.addSource('selected-issue', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] } as any,
      });

      m.addLayer({
        id: 'selected-issue-glow',
        type: 'circle',
        source: 'selected-issue',
        paint: {
          'circle-color': '#ffffff',
          'circle-radius': 16,
          'circle-opacity': 0.4,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 1,
        },
      });

      // Events
      m.on('click', 'clusters', (e) => {
        const features = m.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        if (!features.length) return;
        const clusterId = features[0].properties?.cluster_id;
        if (!clusterId) return;

        const source = m.getSource('issues') as mapboxgl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          const coords = (features[0].geometry as any).coordinates;
          const center = m.getCenter();
          const dist = calculateDistance(center.lat, center.lng, coords[1], coords[0]);

          m.flyTo({
            center: coords,
            zoom: zoom || 14,
            duration: getFlyDuration(dist),
          });
        });
      });

      m.on('click', 'unclustered-point', (e) => {
        const features = e.features;
        if (!features || !features[0]) return;

        const props = features[0].properties;
        const coords = (features[0].geometry as any).coordinates;

        window.dispatchEvent(new CustomEvent('map-issue-click', { detail: props?.id }));

        const center = m.getCenter();
        const dist = calculateDistance(center.lat, center.lng, coords[1], coords[0]);

        m.flyTo({
          center: coords,
          zoom: 16,
          pitch: 70,
          duration: getFlyDuration(dist),
        });
      });

      m.on('mouseenter', 'clusters', () => {
        m.getCanvas().style.cursor = 'pointer';
      });
      m.on('mouseleave', 'clusters', () => {
        m.getCanvas().style.cursor = '';
      });
      m.on('mouseenter', 'unclustered-point', () => {
        m.getCanvas().style.cursor = 'pointer';
      });
      m.on('mouseleave', 'unclustered-point', () => {
        m.getCanvas().style.cursor = '';
      });
    });
  }, []);

  // Handle custom click event to access fresh React state
  useEffect(() => {
    const handleIssueClick = (e: any) => {
      const issueId = e.detail;
      const found = issues.find((i) => (i.id || i._id) === issueId);
      if (found) setSelectedIssue(found);
    };
    window.addEventListener('map-issue-click', handleIssueClick);
    return () => window.removeEventListener('map-issue-click', handleIssueClick);
  }, [issues]);

  // Update GeoJSON source
  useEffect(() => {
    if (!map.current || loadingMap) return;
    const source = map.current.getSource('issues') as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      source.setData(geojson as any);
    }
  }, [geojson, loadingMap]);

  // Update Selected Layer
  useEffect(() => {
    if (!map.current || loadingMap) return;
    const source = map.current.getSource('selected-issue') as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      if (selectedIssue && selectedIssue.location?.coordinates) {
        source.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: selectedIssue.location.coordinates },
              properties: {},
            },
          ],
        } as any);
      } else {
        source.setData({ type: 'FeatureCollection', features: [] } as any);
      }
    }
  }, [selectedIssue, loadingMap]);

  // Zoom controls
  const handleZoomIn = () => map.current?.zoomIn({ duration: 500 });
  const handleZoomOut = () => map.current?.zoomOut({ duration: 500 });
  const handleResetPitch = () => {
    map.current?.easeTo({ pitch: map.current.getPitch() === 0 ? 60 : 0, duration: 1500 });
  };

  return (
    <div className="w-full h-full relative bg-bg overflow-hidden rounded-t-[40px] lg:rounded-none font-body">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0 z-0" aria-hidden="true" />

      {/* Fallback pattern if Mapbox fails/loading */}
      <div className="absolute inset-0 bg-bg -z-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />

      {/* Fullscreen Loading Skeleton (Stage A) */}
      <AnimatePresence>
        {loadingMap && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50 bg-bg flex items-center justify-center pointer-events-none"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-citizen/30 border-t-citizen animate-spin" />
              <span className="text-white/50 font-bold uppercase tracking-widest text-sm">
                Loading Map Engine...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visually Hidden Accessibility List for Map Markers (Phase 6) */}
      <div className="sr-only" role="list" aria-label="Map issues list">
        {issues.map((issue) => (
          <button
            key={issue.id || issue._id}
            role="listitem"
            onClick={() => {
              setSelectedIssue(issue);
              if (issue.location?.coordinates) {
                const [lng, lat] = issue.location.coordinates;
                const center = map.current?.getCenter();
                if (center) {
                  const dist = calculateDistance(center.lat, center.lng, lat, lng);
                  map.current?.flyTo({
                    center: [lng, lat],
                    zoom: 16,
                    pitch: 70,
                    duration: getFlyDuration(dist),
                  });
                }
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSelectedIssue(null);
            }}
          >
            {issue.title}, Status {issue.status}
          </button>
        ))}
      </div>

      {/* Floating Controls Overlay */}
      <div className="absolute inset-x-0 top-0 p-6 lg:p-8 pointer-events-none flex flex-col items-center z-10">
        {/* Search Bar */}
        <div className="w-full max-w-xl pointer-events-auto bg-layer1/80 backdrop-blur-2xl border border-border rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center p-3 gap-4 mb-8 transition-all hover:bg-layer1 hover:border-white/20 focus-within:ring-2 focus-within:ring-citizen/50">
          <span
            className="material-symbols-outlined text-text-tertiary px-3 text-[24px]"
            aria-hidden="true"
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search for locations, issues..."
            aria-label="Search map"
            className="flex-1 bg-transparent border-none outline-none text-base text-white placeholder:text-text-tertiary font-medium font-body"
          />
          <button
            type="button"
            aria-label="Find my location"
            className="w-10 h-10 rounded-full bg-layer2 border border-border flex items-center justify-center cursor-pointer hover:bg-citizen hover:text-white text-text-secondary transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              my_location
            </span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-3 max-w-full overflow-x-auto hide-scrollbar pointer-events-auto pb-4 px-4 w-full justify-start md:justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 shadow-lg tracking-wide uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
                activeCat === cat
                  ? 'bg-white text-bg shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105'
                  : 'bg-layer1/90 backdrop-blur-xl border border-border text-text-secondary hover:bg-layer2 hover:text-white hover:border-white/20'
              }`}
            >
              {cat === 'all'
                ? 'All'
                : cat.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Stage B Loading (Issues loading non-blocking) */}
        {loadingIssues && !loadingMap && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 pointer-events-auto bg-citizen/20 text-citizen px-5 py-2 rounded-full border border-citizen/30 text-xs font-bold uppercase tracking-widest flex items-center gap-3 backdrop-blur-xl shadow-lg"
          >
            <span className="material-symbols-outlined text-[16px] animate-spin" aria-hidden="true">
              sync
            </span>
            Synchronizing Data...
          </motion.div>
        )}
      </div>

      {/* Empty / Error States (Phase 5) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 px-4">
        {apiError && !loadingIssues && (
          <div className="pointer-events-auto w-full max-w-md shadow-2xl">
            <OSStateView
              type="error"
              title="Map Data Unavailable"
              description="Failed to retrieve latest community issues."
              action={{ label: 'Retry Connection', onClick: () => setActiveCat((c) => c) }}
            />
          </div>
        )}
        {!apiError && issues.length === 0 && !loadingIssues && (
          <div className="pointer-events-auto w-full max-w-md shadow-2xl">
            <OSStateView
              type="empty"
              title="No Reports Found"
              description="There are no issues matching your current filters in this area."
              action={{ label: 'Clear Filters', onClick: () => setActiveCat('all') }}
            />
          </div>
        )}
      </div>

      {/* Selected Issue Panel (Bottom Sheet - Phase 3) */}
      <AnimatePresence>
        {selectedIssue && (
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.4}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                setSelectedIssue(null);
              }
            }}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 inset-x-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 w-full md:w-[600px] h-[60vh] md:h-[50vh] bg-layer1/95 backdrop-blur-3xl border border-border shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-20 flex flex-col rounded-t-[40px] overflow-hidden focus:outline-none"
            tabIndex={-1}
            autoFocus
            onKeyDown={(e) => e.key === 'Escape' && setSelectedIssue(null)}
          >
            {/* Grab Handle */}
            <div className="w-full pt-4 pb-2 flex justify-center bg-layer2/50 backdrop-blur-md cursor-grab active:cursor-grabbing hover:bg-layer2/70 transition-colors">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>

            <div className="px-6 pb-4 flex items-center justify-between border-b border-border bg-layer2/50 backdrop-blur-md">
              <h2
                className="font-bold text-sm tracking-widest uppercase font-display text-text-tertiary"
                id="sheet-title"
              >
                Incident Node Details
              </h2>
              <button
                onClick={() => setSelectedIssue(null)}
                aria-label="Close panel"
                className="w-8 h-8 rounded-full bg-layer1 border border-border flex items-center justify-center hover:bg-white/10 text-white transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span
                  className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform"
                  aria-hidden="true"
                >
                  close
                </span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="rounded-[24px] overflow-hidden mb-8 relative aspect-[4/3] border border-border bg-layer2 shadow-inner">
                {selectedIssue.media && selectedIssue.media.length > 0 ? (
                  <Image
                    src={selectedIssue.media[0].optimizedUrl || selectedIssue.media[0].url}
                    alt={selectedIssue.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-[64px] text-border"
                      aria-hidden="true"
                    >
                      image
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-80" />
                <div className="absolute top-4 left-4">
                  <StatusBadge status={selectedIssue.status} />
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <CategoryBadge category={selectedIssue.category} />
                  <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest bg-layer1/80 px-3 py-1.5 rounded-lg backdrop-blur-md border border-border shadow-sm">
                    #{selectedIssue.id.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="mb-8 space-y-4">
                <h1 className="text-3xl font-bold font-display text-white leading-tight">
                  {selectedIssue.title}
                </h1>
                <p className="text-text-secondary text-base leading-relaxed font-light">
                  {selectedIssue.description}
                </p>
              </div>

              <div className="p-5 rounded-[24px] bg-layer2 border border-border mb-8 flex items-center gap-5 shadow-sm">
                <Avatar
                  name={
                    typeof selectedIssue.reporter_id === 'object'
                      ? selectedIssue.reporter_id.name
                      : 'Citizen'
                  }
                  size={50}
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-1">
                    Origin Node
                  </div>
                  <div className="text-base font-bold text-white">
                    {typeof selectedIssue.reporter_id === 'object'
                      ? selectedIssue.reporter_id.name
                      : 'Citizen'}
                  </div>
                  <div className="text-xs text-text-tertiary flex items-center gap-1.5 mt-1 font-mono">
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                      schedule
                    </span>
                    {formatDistanceToNow(new Date(selectedIssue.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>

              <div className="pb-8">
                <button
                  onClick={() => router.push(`/issue/${selectedIssue.id}`)}
                  className="w-full bg-white text-bg hover:bg-gray-200 py-4 rounded-[20px] font-bold text-base flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-citizen"
                >
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                    explore
                  </span>
                  Enter Incident Node
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Actions Bottom Right */}
      <div className="absolute bottom-28 lg:bottom-10 right-6 flex flex-col gap-4 z-10 pointer-events-auto">
        <button
          onClick={handleResetPitch}
          aria-label="Toggle 3D map view"
          className="w-14 h-14 rounded-full bg-layer1/90 backdrop-blur-xl border border-border flex items-center justify-center text-text-secondary hover:text-white hover:border-white/30 shadow-xl transition-all hover:scale-110 active:scale-95 group focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span
            className="material-symbols-outlined text-[24px] group-hover:rotate-12 transition-transform"
            aria-hidden="true"
          >
            3d_rotation
          </span>
        </button>
        <div className="flex flex-col rounded-full overflow-hidden shadow-xl border border-border bg-layer1/90 backdrop-blur-xl">
          <button
            onClick={handleZoomIn}
            aria-label="Zoom in"
            className="w-14 h-14 flex items-center justify-center text-text-secondary hover:text-white hover:bg-layer2 border-b border-border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:z-10 relative"
          >
            <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
              add
            </span>
          </button>
          <button
            onClick={handleZoomOut}
            aria-label="Zoom out"
            className="w-14 h-14 flex items-center justify-center text-text-secondary hover:text-white hover:bg-layer2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white relative"
          >
            <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
              remove
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
