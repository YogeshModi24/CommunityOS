'use client';

import { formatDistanceToNow } from 'date-fns';
import { Activity, Radio, RefreshCw, ShieldAlert } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { InfrastructureRibbon } from '@/components/dashboard/InfrastructureRibbon';
import { LeaderboardPreview } from '@/components/dashboard/LeaderboardPreview';
import { MunicipalityCopilot } from '@/components/dashboard/MunicipalityCopilot';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { TelemetryPanel } from '@/components/dashboard/TelemetryPanel';
import { OSStateView } from '@/components/layout/OSStateView';
import { useSocket } from '@/hooks/useSocket';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const fetchDashboard = () => {
    setLoading(true);
    setError(false);
    api
      .get('/api/users/dashboard')
      .then((res) => {
        setDashboardData(res.data.data);
        setLastSync(new Date());
        setLoading(false);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to load dashboard', err);
        setError(true);
        setLoading(false);
      });
  };

  useSocket({
    'issue.created.v1': (payload: any) => {
      setDashboardData((prev: any) => {
        if (!prev) return prev;
        const newIssue = {
          id: payload.issueId,
          title: payload.title,
          status: 'pending',
          category: payload.category,
          severity: 0, // AI hasn't analyzed yet
          address: payload.location?.coordinates?.join(', ') || 'Unknown Location',
          votes: 1,
          createdAt: payload.createdAt || new Date().toISOString(),
        };

        return {
          ...prev,
          totalReports: prev.totalReports + 1,
          pendingReports: prev.pendingReports + 1,
          recentActivity: [newIssue, ...prev.recentActivity].slice(0, 5),
        };
      });
      setLastSync(new Date());
    },
    'issue.updated.v1': (payload: any) => {
      setDashboardData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          recentActivity: prev.recentActivity.map((issue: any) =>
            issue.id === payload.issueId
              ? {
                  ...issue,
                  category: payload.category || issue.category,
                  severity: payload.severity || issue.severity,
                }
              : issue
          ),
        };
      });
      setLastSync(new Date());
    },
    'issue.resolved.v1': (payload: any) => {
      setDashboardData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          resolvedReports: prev.resolvedReports + 1,
          pendingReports: Math.max(0, prev.pendingReports - 1),
          recentActivity: prev.recentActivity.map((issue: any) =>
            issue.id === payload.issueId ? { ...issue, status: 'resolved' } : issue
          ),
        };
      });
      setLastSync(new Date());
    },
    'vote.added.v1': (payload: any) => {
      setDashboardData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          recentActivity: prev.recentActivity.map((issue: any) =>
            issue.id === payload.issueId ? { ...issue, votes: payload.newVoteCount } : issue
          ),
        };
      });
      setLastSync(new Date());
    },
    'vote.removed.v1': (payload: any) => {
      setDashboardData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          recentActivity: prev.recentActivity.map((issue: any) =>
            issue.id === payload.issueId ? { ...issue, votes: payload.newVoteCount } : issue
          ),
        };
      });
      setLastSync(new Date());
    },
  });

  const [systemStats, setSystemStats] = useState<any>(null);

  const fetchStats = () => {
    if (session?.user?.role === 'admin') {
      api
        .get('/api/stats')
        .then((res) => {
          setSystemStats(res.data);
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load stats', err);
        });
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchDashboard();
    fetchStats();

    const handleResync = () => {
      fetchDashboard();
      fetchStats();
    };
    window.addEventListener('socket:resync', handleResync);
    return () => window.removeEventListener('socket:resync', handleResync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.role]);

  if (!mounted) return null;

  const user = session?.user;
  const xp = dashboardData?.points ?? user?.points ?? 0;
  const level = Math.floor(xp / 1000) + 1;

  if (error) {
    return (
      <div className="pt-20 px-4">
        <OSStateView
          type="error"
          title="Telemetry Feed Disconnected"
          description="Mission Control is unable to synchronize with the regional infrastructure database."
          action={{ label: 'Retry Connection', onClick: fetchDashboard }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pt-4 font-body selection:bg-primary/30">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 px-4">
        {/* Main Content Column */}
        <div
          className={
            user?.role === 'admin' || user?.role === 'municipality'
              ? 'xl:col-span-3 space-y-8 pb-20 lg:pb-12'
              : 'xl:col-span-4 space-y-8 pb-20 lg:pb-12'
          }
        >
          {/* 1. Mission Control Hero */}
          <DashboardHero user={user} xp={xp} level={level} systemStats={systemStats} />

          {/* Ward Matching Warning Banner */}
          {dashboardData?.noIssuesForWard && (
            <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm flex items-start gap-4 shadow-xl">
              <span className="material-symbols-outlined shrink-0 text-[24px]">info</span>
              <div>
                <div className="font-bold text-white text-base">
                  No issues reported for your ward ({user?.ward})
                </div>
                <div className="mt-1 text-text-secondary">
                  Showing a city-wide overview fallback so you can monitor other sectors.
                </div>
              </div>
            </div>
          )}

          {/* Sync Status Header */}
          <div className="flex justify-between items-end border-b border-white/5 pb-2 px-1 mt-8 mb-4">
            <h2 className="text-xl font-display font-bold text-white tracking-wide uppercase">
              System Overview
            </h2>
            {lastSync && (
              <div className="flex items-center gap-2 text-xs font-mono text-text-tertiary">
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-citizen' : ''}`} />
                Last synchronized {formatDistanceToNow(lastSync, { addSuffix: true })}
              </div>
            )}
          </div>

          {/* 2. Quick Stats Row (for Admin) vs Infrastructure Status Ribbon (for Others) */}
          {user?.role === 'admin' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                <span className="text-text-muted text-xs font-mono uppercase tracking-wider">
                  Total Issues
                </span>
                <span className="text-3xl font-display font-bold text-white mt-2 font-mono">
                  {loading ? '...' : (systemStats?.total ?? 0)}
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                <span className="text-text-muted text-xs font-mono uppercase tracking-wider">
                  Resolved
                </span>
                <span className="text-3xl font-display font-bold text-success mt-2 font-mono">
                  {loading ? '...' : (systemStats?.resolved ?? 0)}
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                <span className="text-text-muted text-xs font-mono uppercase tracking-wider">
                  Active Citizens
                </span>
                <span className="text-3xl font-display font-bold text-primary mt-2 font-mono">
                  {loading ? '...' : (systemStats?.users ?? 0)}
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                <span className="text-text-muted text-xs font-mono uppercase tracking-wider">
                  Pending Approvals
                </span>
                <span className="text-3xl font-display font-bold text-accent mt-2 font-mono">
                  {loading ? '...' : (systemStats?.pendingApprovals ?? 0)}
                </span>
              </div>
            </div>
          ) : (
            <InfrastructureRibbon
              totalReports={dashboardData?.totalReports || 0}
              resolvedReports={dashboardData?.resolvedReports || 0}
              pendingReports={dashboardData?.pendingReports || 0}
              points={dashboardData?.points || 0}
              isLoading={loading}
            />
          )}

          {/* 3. Priority Workspace (Activity + Telemetry Overview) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ActivityTimeline
                activities={dashboardData?.recentActivity || []}
                isLoading={loading}
              />
            </div>
            <div className="lg:col-span-2">
              <TelemetryPanel data={dashboardData} isLoading={loading} />
            </div>
          </div>

          {/* 4. Leaderboard & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {user?.role === 'admin' ||
            user?.role === 'municipality' ||
            user?.role === 'authority' ? (
              <div className="lg:col-span-3">
                <h2 className="text-2xl font-display font-bold text-white mb-6">
                  Operational Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {user?.role === 'admin' ? (
                    <QuickActionCard
                      title="Clearance Control"
                      description="Manage and approve access requests."
                      icon={<ShieldAlert className="w-6 h-6" aria-hidden="true" />}
                      href="/admin/municipality-requests"
                      colorClass="text-accent border-accent/20 bg-accent/10"
                      delay={0.1}
                    />
                  ) : (
                    <QuickActionCard
                      title="Operations Dispatch"
                      description="Browse and assign issues."
                      icon={<ShieldAlert className="w-6 h-6" aria-hidden="true" />}
                      href="/feed"
                      colorClass="text-accent border-accent/20 bg-accent/10"
                      delay={0.1}
                    />
                  )}
                  <QuickActionCard
                    title="Incident Feed"
                    description="Browse and vote on issues."
                    icon={<Radio className="w-6 h-6" aria-hidden="true" />}
                    href="/feed"
                    colorClass="text-primary border-primary/20 bg-primary/10"
                    delay={0.2}
                  />
                  <QuickActionCard
                    title="Live Telemetry"
                    description="View real-time clustering analytics."
                    icon={<Activity className="w-6 h-6" aria-hidden="true" />}
                    href="/map"
                    colorClass="text-success border-success/20 bg-success/10"
                    delay={0.3}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="lg:col-span-1">
                  <h2 className="text-2xl font-display font-bold text-white mb-6">Rankings</h2>
                  <LeaderboardPreview
                    leaderboard={dashboardData?.leaderboard || []}
                    isLoading={loading}
                  />
                </div>
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-display font-bold text-white mb-6">Quick Actions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <QuickActionCard
                      title="Report Issue"
                      description="Log a new infrastructure failure."
                      icon={<ShieldAlert className="w-6 h-6" aria-hidden="true" />}
                      href="/report"
                      colorClass="text-accent border-accent/20 bg-accent/10"
                      delay={0.1}
                    />
                    <QuickActionCard
                      title="Community Feed"
                      description="Browse and vote on issues."
                      icon={<Radio className="w-6 h-6" aria-hidden="true" />}
                      href="/feed"
                      colorClass="text-primary border-primary/20 bg-primary/10"
                      delay={0.2}
                    />
                    <QuickActionCard
                      title="Live Telemetry"
                      description="View real-time clustering analytics."
                      icon={<Activity className="w-6 h-6" aria-hidden="true" />}
                      href="/map"
                      colorClass="text-success border-success/20 bg-success/10"
                      delay={0.3}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Persistent Right Panel for Copilot */}
        {(user?.role === 'admin' || user?.role === 'municipality') && (
          <div className="xl:col-span-1">
            <div className="sticky top-24">
              <MunicipalityCopilot />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
