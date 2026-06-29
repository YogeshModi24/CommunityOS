/* eslint-disable no-console */
'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { CompactIssueCard } from '@/components/feed/CompactIssueCard';
import { OSStateView } from '@/components/layout/OSStateView';
import { SpotlightCard } from '@/components/layout/SpotlightCard';
import { useSocket } from '@/hooks/useSocket';
import { api } from '@/lib/api';

const CATEGORIES = [
  'all',
  'pothole',
  'water_leak',
  'streetlight',
  'garbage',
  'sewage',
  'encroachment',
  'other',
];

export default function FeedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Read category from URL, default to 'all'
  const filterCat = searchParams.get('category') || 'all';

  useSocket({
    'issue.created.v1': (payload: any) => {
      if (filterCat !== 'all' && payload.category !== filterCat) return;
      setIssues((prev) => {
        const newIssue = {
          _id: payload.issueId,
          id: payload.issueId,
          title: payload.title,
          status: 'pending',
          category: payload.category,
          severity: 0,
          ai_confidence: 0,
          address: payload.location?.coordinates?.join(', ') || 'Unknown Location',
          votes: 1,
          createdAt: payload.createdAt || new Date().toISOString(),
        };
        return [newIssue, ...prev];
      });
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

  useEffect(() => {
    const fetchFeed = () => {
      setLoading(true);
      setError(false);
      const params = new URLSearchParams();
      if (filterCat !== 'all') params.append('category', filterCat);
      params.append('limit', '50');

      api
        .get(`/api/issues?${params.toString()}`)
        .then((res) => {
          setIssues(res.data.data.issues || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load issues', err);
          setError(true);
          setLoading(false);
        });
    };

    fetchFeed();

    const handleResync = () => fetchFeed();
    window.addEventListener('socket:resync', handleResync);
    return () => window.removeEventListener('socket:resync', handleResync);
  }, [filterCat]);

  const handleCategoryChange = (cat: string) => {
    if (cat === 'all') {
      router.push('/feed');
    } else {
      router.push(`/feed?category=${cat}`);
    }
  };

  // Performance: Memoize filtering logic
  const { featured, critical, recent } = useMemo(() => {
    if (!issues.length) return { featured: null, critical: [], recent: [] };

    // 1. Featured: Highest AI confidence > 85, not resolved
    const featuredIssue =
      issues.find((i) => i.ai_confidence > 85 && i.status !== 'resolved') || issues[0];
    const remaining = issues.filter(
      (i) => i._id !== featuredIssue?._id && i.id !== featuredIssue?.id
    );

    // 2. Critical: High severity (confidence > 80 or high votes), up to 3 items
    const criticalIssues = remaining
      .filter((i) => (i.ai_confidence > 80 || i.severity >= 4) && i.status !== 'resolved')
      .slice(0, 3);
    const criticalIds = new Set(criticalIssues.map((c) => c.id || c._id));

    // 3. Recent: Remaining issues, sorted by recency (assuming array is already sorted descending by date, which it should be from backend)
    const recentIssues = remaining.filter((i) => !criticalIds.has(i.id || i._id));

    return {
      featured: featuredIssue,
      critical: criticalIssues,
      recent: recentIssues,
    };
  }, [issues]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-24 animate-pulse">
          <div className="w-48 h-12 bg-layer1 rounded-xl mb-4" />
          <div className="w-96 h-6 bg-layer1 rounded-xl mb-12" />
          <div className="w-full h-[500px] bg-layer1 rounded-[32px] mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-full h-72 bg-layer1 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <OSStateView
          type="error"
          title="Sync Failed"
          description="Could not retrieve feed data. Please try again."
          action={{ label: 'Retry', onClick: () => window.location.reload() }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-body bg-bg pb-32">
      {/* Editorial Header & Filters Overlay */}
      <div className="relative pt-12 pb-8 px-4 lg:px-8 max-w-container-max mx-auto z-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h1 className="font-display text-5xl lg:text-7xl font-bold tracking-tight text-white mb-4">
              The Feed
            </h1>
            <p className="text-text-secondary text-xl font-light max-w-xl">
              Live intelligence from the community. A real-time editorial view of city
              infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2 w-full md:w-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                aria-label={`Filter by ${cat.replace('_', ' ')}`}
                aria-pressed={filterCat === cat}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
                  filterCat === cat
                    ? 'bg-white text-bg shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                    : 'bg-layer1 border border-border text-text-secondary hover:bg-layer2 hover:text-white'
                }`}
              >
                {cat === 'all'
                  ? 'All Stories'
                  : cat.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Story */}
        {featured && (
          <div className="mb-12">
            <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-widest mb-4 ml-1">
              Featured Report
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 group">
              <div className="lg:col-span-3 transition-transform duration-500 motion-safe:group-hover:-translate-y-1">
                <SpotlightCard
                  issue={featured}
                  featured={true}
                  href={`/issue/${featured.id || featured._id}`}
                />
              </div>

              {/* Contextual Side Panel */}
              <div className="hidden lg:flex flex-col gap-4 col-span-1 transition-transform duration-500 motion-safe:group-hover:-translate-y-1">
                <div className="flex-1 bg-layer1 rounded-[32px] p-8 border border-white/5 flex flex-col justify-center">
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6">
                    <span aria-hidden="true" className="material-symbols-outlined text-[24px]">
                      warning
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-2xl text-white mb-2">High Priority</h3>
                  <p className="text-text-secondary text-sm">
                    This issue has been detected as severe and is currently gathering community
                    support.
                  </p>
                </div>
                <Link
                  href={`/issue/${featured.id || featured._id}`}
                  aria-label={`Live Map View for ${featured.title}`}
                  className="h-1/3 block bg-layer2 rounded-[32px] border border-white/5 p-6 flex flex-col justify-end relative overflow-hidden transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen focus-visible:ring-offset-2 focus-visible:ring-offset-bg group/maplink"
                >
                  <div className="absolute inset-0 bg-citizen/5 transition-colors group-hover/maplink:bg-citizen/10" />
                  <span className="text-white font-bold mb-1 relative z-10">Live Map View</span>
                  <span className="text-text-tertiary text-xs relative z-10">
                    See in context &rarr;
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Critical Issues (Horizontal) */}
        {critical.length > 0 && (
          <div className="mb-12">
            <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-widest mb-4 ml-1">
              Critical & Escalated
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {critical.map((issue) => (
                <CompactIssueCard
                  key={issue.id || issue._id}
                  issue={issue}
                  layout="horizontal"
                  href={`/issue/${issue.id || issue._id}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Issues (Dense Vertical Grid) */}
        {recent.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-widest mb-4 ml-1">
              Recent Dispatches
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recent.map((issue) => (
                <CompactIssueCard
                  key={issue.id || issue._id}
                  issue={issue}
                  layout="vertical"
                  href={`/issue/${issue.id || issue._id}`}
                />
              ))}
            </div>
          </div>
        )}

        {issues.length === 0 && !loading && (
          <OSStateView
            type="empty"
            title="No Active Stories"
            description="Try adjusting your filters or search criteria."
            action={{ label: 'Clear Filters', onClick: () => handleCategoryChange('all') }}
          />
        )}
      </div>
    </div>
  );
}
