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

  useEffect(() => {
    setMounted(true);
    fetchDashboard();
  }, []);

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
        <div className={user?.role === 'admin' || user?.role === 'municipality' ? "xl:col-span-3 space-y-8 pb-20 lg:pb-12" : "xl:col-span-4 space-y-8 pb-20 lg:pb-12"}>
          {/* 1. Mission Control Hero */}
          <DashboardHero user={user} xp={xp} level={level} />

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

          {/* 2. Infrastructure Status Ribbon */}
          <InfrastructureRibbon
            totalReports={dashboardData?.totalReports || 0}
            resolvedReports={dashboardData?.resolvedReports || 0}
            pendingReports={dashboardData?.pendingReports || 0}
            points={dashboardData?.points || 0}
            isLoading={loading}
          />

          {/* 3. Priority Workspace (Activity + Telemetry Overview) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ActivityTimeline activities={dashboardData?.recentActivity || []} isLoading={loading} />
            </div>
            <div className="lg:col-span-2">
              <TelemetryPanel data={dashboardData} isLoading={loading} />
            </div>
          </div>

          {/* 4. Leaderboard & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-display font-bold text-white mb-6">Rankings</h2>
              <LeaderboardPreview leaderboard={dashboardData?.leaderboard || []} isLoading={loading} />
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
