'use client';

import { motion } from 'framer-motion';
import { Map as MapIcon, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { GradientButton } from '@/components/ui/GradientButton';
import { Avatar } from '@/components/ui/primitives';

interface DashboardHeroProps {
  user: any;
  xp: number;
  level: number;
}

export function DashboardHero({ user, xp, level }: DashboardHeroProps) {
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const xpProgress = xp % 1000;
  const progressPercent = (xpProgress / 1000) * 100;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-layer1 to-bg border border-white/10 shadow-2xl p-8 lg:p-12"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-text-secondary mb-6 backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Mission Control Online
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl lg:text-5xl font-display font-bold text-white mb-4 tracking-tight"
          >
            {greeting},{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              {user?.name?.split(' ')[0] || 'Citizen'}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-text-secondary max-w-xl leading-relaxed mb-8"
          >
            Welcome to your command center. Monitor infrastructure health, dispatch resources, and
            review community insights in real-time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/report">
              <GradientButton className="w-full sm:w-auto">
                <ShieldAlert className="w-4 h-4 mr-2" />
                Report New Issue
              </GradientButton>
            </Link>
            <Link href="/map">
              <GradientButton variant="glass" className="w-full sm:w-auto">
                <MapIcon className="w-4 h-4 mr-2" />
                Open Live Map
              </GradientButton>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
          className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 min-w-[300px]"
        >
          <div className="flex items-center gap-4 mb-6">
            <Avatar name={user?.name || 'User'} size={56} className="ring-2 ring-primary/50" />
            <div>
              <div className="text-text-primary font-bold">{user?.name || 'User'}</div>
              <div className="text-text-tertiary text-xs uppercase tracking-wider">
                {user?.ward || 'City Resident'}
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-text-tertiary mb-2">
              <span>Level {level}</span>
              <span>{xpProgress} / 1000 XP</span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden border border-white/5 relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.6 }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full shadow-glow-blue"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
