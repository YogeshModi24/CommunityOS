import { motion } from 'framer-motion';
import { ChevronRight, Trophy } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { OSStateView } from '@/components/layout/OSStateView';
import { Avatar } from '@/components/ui/primitives';

interface LeaderboardPreviewProps {
  leaderboard: any[];
  isLoading?: boolean;
}

export function LeaderboardPreview({ leaderboard, isLoading }: LeaderboardPreviewProps) {
  if (isLoading) {
    return (
      <div className="bg-layer1 border border-white/5 rounded-3xl p-8 h-full animate-pulse flex flex-col gap-6">
        <div className="h-8 bg-white/5 rounded-lg w-2/3" />
        <div className="flex-1 space-y-3 mt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-2xl w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="bg-layer1 border border-white/5 rounded-3xl h-full flex items-center justify-center p-4 min-h-[300px]">
        <OSStateView
          type="empty"
          title="No Rankings"
          description="The community leaderboard is currently empty."
        />
      </div>
    );
  }

  return (
    <div className="bg-layer1 border border-white/10 rounded-3xl p-8 h-full flex flex-col relative overflow-hidden group">
      {/* Top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-amber-500/5 blur-[60px] pointer-events-none group-hover:bg-amber-500/10 transition-colors" />

      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5 relative z-10">
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-1 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" aria-hidden="true" />
            Top Citizens
          </h2>
          <p className="text-sm text-text-secondary">Most impactful community members</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3 relative z-10">
        {leaderboard.slice(0, 5).map((user: any, i: number) => (
          <motion.div
            key={user.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
          >
            <div
              className={`w-6 font-mono font-bold text-center ${
                i === 0
                  ? 'text-amber-500 text-lg'
                  : i === 1
                    ? 'text-slate-300'
                    : i === 2
                      ? 'text-amber-700'
                      : 'text-text-tertiary'
              }`}
            >
              {i + 1}
            </div>

            <Avatar name={user.name} size={40} className="shrink-0" />

            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate">{user.name}</div>
              <div className="text-[10px] text-text-tertiary uppercase tracking-wider truncate">
                {user.ward || 'Resident'}
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-sm font-mono font-bold text-white">{user.points}</div>
              <div className="text-[10px] text-text-tertiary uppercase tracking-widest">XP</div>
            </div>
          </motion.div>
        ))}
      </div>

      <Link
        href="/leaderboard"
        aria-label="View Full Leaderboard"
        className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-text-secondary hover:text-white transition-all relative z-10 w-full py-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen active:scale-95"
      >
        View Full Leaderboard
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
