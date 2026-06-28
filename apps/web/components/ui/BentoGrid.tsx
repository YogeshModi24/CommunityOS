import { motion } from 'framer-motion';
import React from 'react';

import { cn } from '@/lib/utils';

import { GlassCard } from './GlassCard';

export function BentoGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto w-full', className)}
    >
      {children}
    </div>
  );
}

export function BentoCard({
  children,
  className,
  colSpan = 1,
  rowSpan = 1,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
}) {
  const colClasses = {
    1: 'md:col-span-1',
    2: 'md:col-span-2',
    3: 'md:col-span-3',
  };

  const rowClasses = {
    1: 'row-span-1',
    2: 'row-span-2',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      className={cn(colClasses[colSpan], rowClasses[rowSpan], className)}
    >
      <GlassCard
        intensity="low"
        className="h-full p-8 flex flex-col hover:border-white/20 transition-colors"
      >
        {children}
      </GlassCard>
    </motion.div>
  );
}
