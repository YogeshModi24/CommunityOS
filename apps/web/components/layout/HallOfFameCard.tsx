import { motion } from 'framer-motion';
import React from 'react';

import { Avatar } from '@/components/ui/primitives';

export function HallOfFameCard({ user }: { user: any }) {
  const level = Math.floor(user.xp / 1000) + 1;
  const progress = ((user.xp % 1000) / 1000) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-4xl mx-auto rounded-[40px] overflow-hidden bg-layer1 border border-amber-400/20 shadow-[0_0_50px_rgba(251,191,36,0.1)] group"
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-transparent to-transparent opacity-50" />

      <div className="relative z-10 p-12 lg:p-16 flex flex-col md:flex-row items-center gap-12">
        {/* Prestige Avatar */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-[40px] animate-pulse" />
          <svg className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] -rotate-90 pointer-events-none">
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              stroke="rgba(251,191,36,0.1)"
              strokeWidth="4"
              fill="none"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="48%"
              stroke="rgba(251,191,36,0.8)"
              strokeWidth="4"
              fill="none"
              strokeDasharray="300"
              strokeDashoffset={300 - (300 * progress) / 100}
              strokeLinecap="round"
            />
          </svg>
          <Avatar
            name={user.name}
            size={160}
            className="border-4 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)]"
          />
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 font-black text-xl w-14 h-14 rounded-full flex items-center justify-center border-4 border-bg shadow-[0_0_20px_rgba(251,191,36,0.6)]">
            1
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
            <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
            Top Contributor
          </div>

          <h2 className="text-4xl lg:text-6xl font-display font-bold text-white mb-2 tracking-tight">
            {user.name}
          </h2>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8">
            <div className="text-amber-400 font-mono text-2xl font-bold drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]">
              {user.xp.toLocaleString()} XP
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="text-text-secondary font-bold uppercase tracking-widest text-sm">
              Level {level}
            </div>
          </div>

          <div className="flex justify-center md:justify-start gap-3">
            <div
              className="w-12 h-12 rounded-2xl bg-layer2 border border-border flex items-center justify-center text-text-tertiary hover:text-amber-400 hover:border-amber-400/50 transition-colors shadow-inner"
              title="First Responder"
            >
              <span className="material-symbols-outlined text-[24px]">local_fire_department</span>
            </div>
            <div
              className="w-12 h-12 rounded-2xl bg-layer2 border border-border flex items-center justify-center text-text-tertiary hover:text-amber-400 hover:border-amber-400/50 transition-colors shadow-inner"
              title="Verified Reporter"
            >
              <span className="material-symbols-outlined text-[24px]">verified_user</span>
            </div>
            {user.badges.includes('verified') && (
              <div
                className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner"
                title="Admin Authority"
              >
                <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
