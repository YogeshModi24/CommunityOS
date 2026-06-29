/* eslint-disable no-console */
'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { HallOfFameCard } from '@/components/layout/HallOfFameCard';
import { OSStateView } from '@/components/layout/OSStateView';
import { Avatar } from '@/components/ui/primitives';
import { useSocket } from '@/hooks/useSocket';
import { api } from '@/lib/api';

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<'weekly' | 'all_time'>('all_time');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/api/users/leaderboard');
      const users = res.data.data.map((u: any, i: number) => ({
        id: u.id || u._id,
        name: u.name,
        xp: u.points || 0,
        rank: i + 1,
        badges: u.role === 'admin' ? ['verified'] : [],
      }));
      setLeaderboardData(users);
    } catch (err) {
      console.warn('Failed to load leaderboard', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    const handleResync = () => fetchLeaderboard();
    window.addEventListener('socket:resync', handleResync);
    return () => window.removeEventListener('socket:resync', handleResync);
  }, []);

  useSocket({
    'issue.updated.v1': () => fetchLeaderboard(true),
    'issue.resolved.v1': () => fetchLeaderboard(true),
  });

  const topPlayer = leaderboardData[0];
  const runnersUp = leaderboardData.slice(1, 4);
  const rest = leaderboardData.slice(4);

  return (
    <div className="min-h-screen bg-bg font-body pb-32">
      {/* Editorial Header */}
      <div className="relative pt-12 pb-16 px-4 lg:px-8 max-w-container-max mx-auto z-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="font-display text-5xl lg:text-7xl font-bold tracking-tight text-white mb-4">
              Hall of Fame
            </h1>
            <p className="text-text-secondary text-xl font-light max-w-xl">
              Recognizing the most impactful nodes in the network. A tribute to our top civic
              contributors.
            </p>
          </div>

          <div className="flex p-1.5 rounded-full bg-layer1 border border-border w-fit shadow-inner">
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${timeframe === 'weekly' ? 'bg-white text-bg shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'text-text-secondary hover:text-white hover:bg-layer2'}`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeframe('all_time')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${timeframe === 'all_time' ? 'bg-white text-bg shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'text-text-secondary hover:text-white hover:bg-layer2'}`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 w-full">
          <OSStateView
            type="loading"
            title="Syncing Leaderboard"
            description="Retrieving hall of fame data..."
          />
        </div>
      ) : leaderboardData.length > 0 ? (
        <div className="max-w-container-max mx-auto px-4 lg:px-8 relative z-10">
          {/* Spotlight Hall of Fame Card */}
          {topPlayer && (
            <div className="mb-16">
              <HallOfFameCard user={topPlayer} />
            </div>
          )}

          {/* Runners Up Grid (replaces list rhythm) */}
          {runnersUp.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {runnersUp.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-layer1 rounded-[32px] p-8 border border-white/5 relative overflow-hidden group hover:border-white/20 transition-all hover:-translate-y-1 shadow-lg"
                >
                  <div className="absolute top-0 right-0 p-6 text-6xl font-display font-black text-white/5 pointer-events-none transition-transform group-hover:scale-110">
                    {user.rank}
                  </div>
                  <div className="flex items-center gap-5 mb-8">
                    <Avatar name={user.name} size={64} className="border-2 border-white/10" />
                    <div>
                      <div className="font-bold text-white text-lg">{user.name}</div>
                      <div className="text-sm text-text-tertiary">
                        Level {Math.floor(user.xp / 1000) + 1}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-text-secondary font-mono text-xs uppercase tracking-widest">
                      Experience
                    </div>
                    <div className="text-2xl font-display font-bold text-citizen drop-shadow-[0_0_10px_rgba(37,99,235,0.4)]">
                      {user.xp.toLocaleString()} XP
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Rest of the network */}
          {rest.length > 0 && (
            <div className="bg-layer1 rounded-[40px] border border-white/5 overflow-hidden">
              <div className="px-8 py-6 border-b border-white/5 bg-layer2/50 backdrop-blur-md">
                <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-widest">
                  Extended Network Ranking
                </h3>
              </div>
              <div className="divide-y divide-white/5">
                {rest.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center p-6 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-16 text-text-tertiary font-mono text-lg">#{user.rank}</div>
                    <div className="flex-1 flex items-center gap-4">
                      <Avatar name={user.name} size={40} />
                      <div className="font-bold text-white">{user.name}</div>
                    </div>
                    <div className="text-right font-mono text-citizen font-bold">
                      {user.xp.toLocaleString()}{' '}
                      <span className="text-xs text-text-tertiary">XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full flex items-center justify-center py-32">
          <OSStateView
            type="empty"
            title="No Data Available"
            description="No civic contributions logged in this sector yet."
            action={{ label: 'Back to Dashboard', onClick: () => window.history.back() }}
          />
        </div>
      )}
    </div>
  );
}
