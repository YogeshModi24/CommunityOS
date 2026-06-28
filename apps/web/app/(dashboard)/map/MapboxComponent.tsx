'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';

const CATEGORY_COLORS: Record<string, string> = {
  pothole: '#f97316',
  water_leak: '#3b82f6',
  streetlight: '#eab308',
  garbage: '#22c55e',
  encroachment: '#ef4444',
  sewage: '#a855f7',
  other: '#94a3b8',
};

interface Feature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: {
    id: string;
    title: string;
    category: string;
    severity: number;
    status: string;
    votes: number;
    address: string;
    imageUrl: string | null;
  };
}

interface MapboxComponentProps {
  features: Feature[];
  centerLat: number;
  centerLng: number;
  onSelectFeature: (f: Feature) => void;
}

export default function MapboxComponent({
  features,
  centerLat,
  centerLng,
  onSelectFeature,
}: MapboxComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapboxMapRef = useRef<mapboxgl.Map | null>(null);
  const [leafletMap, setLeafletMap] = useState<L.Map | null>(null);
  const leafletMarkersRef = useRef<L.Marker[]>([]);
  const [isMockMode, setIsMockMode] = useState(false);

  // Use a ref to prevent stale closures and avoid unnecessary marker recreation
  const onSelectFeatureRef = useRef(onSelectFeature);
  useEffect(() => {
    onSelectFeatureRef.current = onSelectFeature;
  }, [onSelectFeature]);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || token === 'mock' || token.startsWith('change_me') || !containerRef.current) {
      setIsMockMode(true);
      return;
    }

    mapboxgl.accessToken = token;

    try {
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [centerLng, centerLat],
        zoom: 13,
      });

      mapboxMapRef.current = map;

      map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        })
      );
      map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

      map.on('load', () => {
        map.addSource('issues', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'issues',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#14b8a6',
              5,
              '#0d9488',
              10,
              '#0f766e',
            ],
            'circle-radius': ['step', ['get', 'point_count'], 20, 5, 30, 10, 40],
            'circle-opacity': 0.9,
          },
        });

        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'issues',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
          },
          paint: { 'text-color': '#ffffff' },
        });

        map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'issues',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': [
              'match',
              ['get', 'category'],
              'pothole',
              '#f97316',
              'water_leak',
              '#3b82f6',
              'streetlight',
              '#eab308',
              'garbage',
              '#22c55e',
              'encroachment',
              '#ef4444',
              'sewage',
              '#a855f7',
              '#94a3b8',
            ],
            'circle-radius': 10,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        });

        map.on('click', 'clusters', (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
          const clusterId = (features[0].properties as any).cluster_id;
          (map.getSource('issues') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
              if (err) return;
              map.easeTo({ center: (features[0].geometry as any).coordinates, zoom: zoom ?? 14 });
            }
          );
        });

        map.on('click', 'unclustered-point', (e) => {
          if (!e.features?.[0]) return;
          onSelectFeatureRef.current(e.features[0] as unknown as Feature);
        });

        map.on('mouseenter', 'clusters', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters', () => {
          map.getCanvas().style.cursor = '';
        });
        map.on('mouseenter', 'unclustered-point', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'unclustered-point', () => {
          map.getCanvas().style.cursor = '';
        });
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to init Mapbox. Falling back to Leaflet Map.', e);
      setIsMockMode(true);
    }

    return () => {
      if (mapboxMapRef.current) {
        mapboxMapRef.current.remove();
        mapboxMapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- features updates handled in separate effect
  }, [centerLat, centerLng]);

  // Leaflet initialization (when in Mock Mode)
  useEffect(() => {
    if (!isMockMode || !containerRef.current) return;

    // Initialize Leaflet map centered at coordinates
    const map = L.map(containerRef.current, { zoomControl: false }).setView(
      [centerLat, centerLng],
      13
    );
    setLeafletMap(map);

    // Add zoom control at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add CartoDB Positron light tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    // Custom pulsing user center location marker
    const userIndicator = L.divIcon({
      html: `<div class="relative w-5 h-5 flex items-center justify-center">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-teal-500 border-2 border-white shadow-sm"></span>
      </div>`,
      className: 'user-center-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    L.marker([centerLat, centerLng], { icon: userIndicator }).addTo(map);

    return () => {
      map.remove();
      setLeafletMap(null);
    };
  }, [isMockMode, centerLat, centerLng]);

  // Update Leaflet Markers when features list changes or map changes
  useEffect(() => {
    if (!isMockMode || !leafletMap) return;

    // Clear previous markers
    leafletMarkersRef.current.forEach((m) => m.remove());
    leafletMarkersRef.current = [];

    // Add new markers for each issue feature
    features.forEach((f) => {
      const [lng, lat] = f.geometry.coordinates;
      const { category, title, severity, votes, address } = f.properties;
      const color = CATEGORY_COLORS[category] || '#14b8a6';

      const isHazardous =
        severity >= 4 &&
        (category === 'sewage' || category === 'pothole' || category === 'water_leak');
      const markerClass = isHazardous ? 'pulsing-hazardous-marker' : '';

      // Custom glowing marker dot scaling with severity
      const customIcon = L.divIcon({
        html: `<div class="${markerClass}" style="background-color: ${color}; width: ${12 + severity * 2}px; height: ${12 + severity * 2}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 12px ${color}bf; cursor: pointer; transition: transform 0.15s ease;"></div>`,
        className: 'custom-issue-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(leafletMap);

      // Custom interactive popups matching premium styling
      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; min-width: 200px; padding: 4px;">
          <span style="background: ${color}; color: white; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase;">
            ${category.replace('_', ' ').toUpperCase()}
          </span>
          <h3 style="margin: 10px 0 6px; font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.4;">
            ${title}
          </h3>
          <p style="margin: 0; color: #64748b; font-size: 11px; display: flex; align-items: center; gap: 4px;">
            📍 ${address}
          </p>
          <p style="margin: 6px 0 0; color: #0f172a; font-size: 11px; font-weight: 600;">
            👍 ${votes} votes · Severity ${severity}/5 ${isHazardous ? '⚠️' : ''}
          </p>
        </div>
      `);

      marker.on('click', () => {
        onSelectFeatureRef.current(f);
      });

      leafletMarkersRef.current.push(marker);
    });
  }, [isMockMode, leafletMap, features]);

  // Update Mapbox source data when features change
  useEffect(() => {
    const map = mapboxMapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const source = map.getSource('issues') as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      source.setData({ type: 'FeatureCollection', features });
    }
  }, [features]);

  const fitBounds = () => {
    if (!leafletMap || leafletMarkersRef.current.length === 0) return;
    const group = L.featureGroup(leafletMarkersRef.current);
    leafletMap.fitBounds(group.getBounds().pad(0.1));
  };

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full rounded-b-2xl overflow-hidden" />
      {isMockMode && leafletMap && features.length > 0 && (
        <button
          onClick={fitBounds}
          className="absolute bottom-16 right-4 z-[1000] bg-white text-slate-800 hover:bg-slate-50 font-bold px-3 py-2 rounded-lg shadow-md border border-slate-200 text-xs transition flex items-center gap-1.5 active:scale-95 duration-150"
        >
          🔍 Zoom to Fit All
        </button>
      )}
    </div>
  );
}
