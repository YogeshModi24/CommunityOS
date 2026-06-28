import { motion } from 'framer-motion';
import React from 'react';

import { AnimatedCounter } from '../ui/AnimatedCounter';

interface InfrastructureRibbonProps {
  totalReports: number;
  resolvedReports: number;
  pendingReports: number;
  points: number;
  isLoading?: boolean;
}

export function InfrastructureRibbon({
  totalReports,
  resolvedReports,
  pendingReports,
  points,
  isLoading,
}: InfrastructureRibbonProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/5 bg-layer1 border border-white/5 rounded-2xl shadow-lg overflow-hidden animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 p-6">
            <div className="h-4 bg-white/5 rounded w-24 mb-4" />
            <div className="h-8 bg-white/5 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/10 bg-layer1 border border-white/10 rounded-2xl shadow-lg overflow-hidden"
    >
      <div className="flex-1 p-6 hover:bg-white/[0.02] transition-colors">
        <div className="text-sm font-medium text-text-tertiary uppercase tracking-wider mb-2">
          Total Reports
        </div>
        <div className="flex items-baseline gap-2">
          <AnimatedCounter
            value={totalReports || 0}
            className="text-3xl font-display font-bold text-white"
          />
        </div>
      </div>

      <div className="flex-1 p-6 hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="text-sm font-medium text-text-tertiary uppercase tracking-wider mb-2">
          Resolved
        </div>
        <div className="flex items-baseline gap-2">
          <AnimatedCounter
            value={resolvedReports || 0}
            className="text-3xl font-display font-bold text-success"
          />
        </div>
      </div>

      <div className="flex-1 p-6 hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="text-sm font-medium text-text-tertiary uppercase tracking-wider mb-2">
          Pending Action
        </div>
        <div className="flex items-baseline gap-2">
          <AnimatedCounter
            value={pendingReports || 0}
            className="text-3xl font-display font-bold text-accent"
          />
        </div>
      </div>

      <div className="flex-1 p-6 hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="text-sm font-medium text-text-tertiary uppercase tracking-wider mb-2">
          Community Impact
        </div>
        <div className="flex items-baseline gap-2">
          <AnimatedCounter
            value={points || 0}
            className="text-3xl font-display font-bold text-primary"
          />
        </div>
      </div>
    </motion.div>
  );
}
