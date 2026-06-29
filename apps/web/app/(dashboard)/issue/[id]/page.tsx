/* eslint-disable no-console */
'use client';

import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { StatusTimeline } from '@/components/StatusTimeline';
import { Avatar, CategoryBadge, Skeleton, StatusBadge } from '@/components/ui/primitives';
import { api } from '@/lib/api';

export default function IssueDetailPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [issue, setIssue] = useState<any>(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/api/issues/${params.id}`)
      .then((res) => {
        setIssue(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to load issue', err);
        setLoading(false);
      });
  }, [params.id]);

  const toggleVote = async () => {
    if (!issue || voting) return;
    setVoting(true);
    try {
      const res = await api.post(`/api/issues/${issue.id}/vote`);
      setIssue((prev: any) => ({
        ...prev,
        votes: res.data.data.votes,
        hasVoted: res.data.data.hasVoted,
      })); // hasVoted might not be returned, but wait, usually user.id is checked against voter_ids.
    } catch (err) {
      console.warn('Failed to vote', err);
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse flex flex-col h-full bg-bg font-body">
        <Skeleton className="w-full h-80 lg:h-[60vh] min-h-[400px] bg-layer1" />
        <div className="max-w-[1200px] mx-auto w-full px-6 lg:px-12 relative z-10 -mt-40">
          <Skeleton className="w-full h-48 rounded-[32px] mb-10 bg-layer2 border border-border shadow-2xl" />
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="w-full h-8 rounded-lg bg-layer2" />
              <Skeleton className="w-full h-40 rounded-2xl bg-layer2" />
            </div>
            <Skeleton className="w-full h-96 rounded-[32px] bg-layer2" />
          </div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] font-body">
        <span className="material-symbols-outlined text-[80px] mb-6 text-border">error</span>
        <h2 className="text-3xl font-display font-bold mb-4 text-white">Record Not Found</h2>
        <Link
          href="/dashboard"
          className="text-citizen font-bold hover:text-white transition-colors"
        >
          Return to Command Center
        </Link>
      </div>
    );
  }

  const reporter =
    typeof issue.reporter_id === 'object'
      ? issue.reporter_id
      : { name: 'Citizen', xp: 0, role: 'Citizen' };
  const reporterLevel = Math.floor((reporter.points || 0) / 1000) + 1;
  const hasImage = issue.media && issue.media.length > 0;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] pb-32 font-body">
      {/* Immersive Back button */}
      <Link
        href="/feed"
        className="fixed top-8 left-8 z-50 w-14 h-14 rounded-full bg-layer1/80 backdrop-blur-xl border border-border flex items-center justify-center text-white hover:bg-citizen hover:border-citizen hover:scale-105 transition-all shadow-xl group"
      >
        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">
          arrow_back
        </span>
      </Link>

      {/* Cinematic Hero Image */}
      <div className="relative w-full h-[50vh] lg:h-[65vh] min-h-[400px] bg-layer1 flex items-center justify-center overflow-hidden">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            src={issue.media[0].optimizedUrl || issue.media[0].url}
            alt={issue.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-layer1 to-layer2 flex items-center justify-center">
            <span className="material-symbols-outlined text-[120px] text-border opacity-50">
              landscape
            </span>
          </div>
        )}

        {/* Advanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 relative z-10 -mt-48">
        {/* Master Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-layer1/90 backdrop-blur-2xl border border-border p-8 lg:p-12 rounded-[40px] shadow-2xl mb-12 relative overflow-hidden"
        >
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-citizen/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 relative z-10">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <StatusBadge status={issue.status} />
                <CategoryBadge category={issue.category} />
                <span className="text-xs font-mono font-bold px-3 py-1.5 bg-layer2 rounded-lg text-text-tertiary border border-border tracking-widest uppercase shadow-inner">
                  ID: #{issue.id.slice(-6).toUpperCase()}
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-white leading-tight drop-shadow-md">
                {issue.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary font-medium">
                <div className="flex items-center gap-2 bg-layer2 px-4 py-2 rounded-xl border border-border shadow-sm">
                  <span className="material-symbols-outlined text-[18px] text-text-tertiary">
                    schedule
                  </span>
                  Reported {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                </div>
                {issue.ward && (
                  <div className="flex items-center gap-2 bg-layer2 px-4 py-2 rounded-xl border border-border shadow-sm">
                    <span className="material-symbols-outlined text-[18px] text-text-tertiary">
                      location_on
                    </span>
                    {issue.ward}
                  </div>
                )}
              </div>
            </div>

            {/* Action Center */}
            <div className="flex flex-col items-center p-8 bg-layer2 rounded-[32px] border border-border shrink-0 min-w-[180px] shadow-xl group">
              <div className="text-sm font-bold text-text-tertiary uppercase tracking-widest mb-2">
                Support
              </div>
              <div className="text-6xl font-display font-bold text-citizen mb-6 drop-shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                {issue.votes}
              </div>
              <button
                onClick={toggleVote}
                disabled={voting}
                className={`w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-3 transition-all ${
                  voting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
                } bg-white text-bg hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]`}
              >
                <span className="material-symbols-outlined text-[20px]">thumb_up</span>
                Upvote
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-layer1 p-8 lg:p-10 rounded-[32px] border border-border shadow-lg">
              <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-widest mb-6 flex items-center gap-3">
                <span className="w-8 h-px bg-border"></span>
                Incident Description
              </h2>
              <p className="text-text-secondary leading-relaxed whitespace-pre-wrap text-lg font-light">
                {issue.description}
              </p>
            </section>

            {/* Timeline */}
            {issue.status_history && issue.status_history.length > 0 && (
              <section className="bg-layer1 p-8 lg:p-10 rounded-[32px] border border-border shadow-lg">
                <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-widest mb-10 flex items-center gap-3">
                  <span className="w-8 h-px bg-border"></span>
                  Activity Log
                </h2>
                <StatusTimeline history={issue.status_history} />
              </section>
            )}
          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-8">
            {/* Telemetry AI Card */}
            {issue.ai_analysis && (
              <div className="bg-layer1 p-8 rounded-[32px] border border-ai/30 shadow-[0_0_40px_rgba(139,92,246,0.1)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-ai/10 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8 text-ai">
                    <span className="material-symbols-outlined text-[24px]">troubleshoot</span>
                    <h3 className="font-bold text-sm tracking-widest uppercase">
                      Vision AI Telemetry
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-xs mb-3 font-bold uppercase tracking-widest">
                        <span className="text-text-tertiary">Estimated Severity</span>
                        <span className="text-white">Level {issue.ai_analysis.severity}/5</span>
                      </div>
                      <div className="h-2 rounded-full bg-layer2 overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-rose-500"
                          style={{ width: `${(issue.ai_analysis.severity / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-3 font-bold uppercase tracking-widest">
                        <span className="text-text-tertiary">Analysis Confidence</span>
                        <span className="text-resolved font-mono">
                          {Math.round(issue.ai_analysis.confidence * 100)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-layer2 overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-resolved"
                          style={{ width: `${issue.ai_analysis.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                    {issue.ai_analysis.hazardous && (
                      <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-400">
                        <span className="material-symbols-outlined text-[20px]">warning</span>
                        <span className="text-sm font-bold uppercase tracking-widest leading-tight mt-0.5">
                          Critical Hazard Detected
                        </span>
                      </div>
                    )}
                    {issue.ai_analysis.description && (
                      <p className="text-sm text-text-secondary pt-6 mt-6 border-t border-border font-light leading-relaxed">
                        {issue.ai_analysis.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Assignment Block */}
            {issue.assignment && (
              <div className="bg-layer1 p-8 rounded-[32px] border border-municipality/30 shadow-[0_0_40px_rgba(37,99,235,0.1)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-municipality/10 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6 text-municipality">
                    <span className="material-symbols-outlined text-[24px]">assignment_ind</span>
                    <h3 className="font-bold text-sm tracking-widest uppercase">
                      Dispatch & Assignment
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-layer2 p-4 rounded-xl border border-border">
                      <div className="text-[10px] uppercase tracking-widest text-text-tertiary font-bold mb-1">Assigned Department</div>
                      <div className="text-white font-mono font-bold capitalize">{issue.assignment.department.replace(/_/g, ' ')}</div>
                    </div>
                    
                    {issue.assignment.assignedToName && (
                      <div className="bg-layer2 p-4 rounded-xl border border-border">
                        <div className="text-[10px] uppercase tracking-widest text-text-tertiary font-bold mb-1">Assigned Personnel</div>
                        <div className="text-white font-bold flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-text-secondary">badge</span>
                          {issue.assignment.assignedToName}
                        </div>
                      </div>
                    )}
                    
                    {issue.assignment.dueDate && (
                      <div className="bg-layer2 p-4 rounded-xl border border-border">
                        <div className="text-[10px] uppercase tracking-widest text-text-tertiary font-bold mb-1">Target SLA / Due Date</div>
                        <div className="text-warning font-mono font-bold flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">timer</span>
                          {new Date(issue.assignment.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Reporter Meta */}
            <div className="bg-layer1 p-8 rounded-[32px] border border-border shadow-lg">
              <h3 className="font-bold text-xs mb-6 text-text-tertiary uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">person</span>
                Origin Data
              </h3>
              <div className="flex items-center gap-5">
                <Avatar name={reporter.name} size={64} />
                <div>
                  <div className="font-display font-bold text-xl text-white mb-1">
                    {reporter.name}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="text-xs text-citizen font-mono font-bold bg-citizen/10 px-2.5 py-1 rounded-md border border-citizen/20 inline-block uppercase tracking-wider">
                      Level {reporterLevel}
                    </div>
                    {reporter.role && (
                      <div className="text-xs text-text-tertiary font-bold uppercase tracking-widest bg-layer2 px-2.5 py-1 rounded-md border border-border">
                        {reporter.role}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Static Map Embed */}
            {issue.location && (
              <div className="bg-layer1 rounded-[32px] overflow-hidden border border-border shadow-lg group cursor-pointer">
                <div className="h-48 bg-layer2 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg/50 to-transparent pointer-events-none" />

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative z-10 flex flex-col items-center"
                  >
                    <span className="material-symbols-outlined text-[48px] text-citizen drop-shadow-[0_0_20px_rgba(37,99,235,0.5)]">
                      location_on
                    </span>
                  </motion.div>

                  <div className="absolute bottom-3 left-3 right-3 p-2.5 bg-layer1/80 backdrop-blur-xl rounded-xl text-xs font-mono font-bold text-center text-white/90 border border-border shadow-lg">
                    {issue.location.coordinates[1].toFixed(4)},{' '}
                    {issue.location.coordinates[0].toFixed(4)}
                  </div>
                </div>
                <div className="p-5 text-sm text-center text-white font-bold uppercase tracking-widest group-hover:bg-citizen group-hover:text-white transition-colors border-t border-border flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">map</span>
                  Launch Map Module
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
