import { HTMLMotionProps, motion } from 'framer-motion';
import React from 'react';

import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  hoverEffect?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, intensity = 'medium', hoverEffect = false, ...props }, ref) => {
    const intensityClasses = {
      low: 'bg-white/5 backdrop-blur-sm border-white/5',
      medium: 'bg-white/5 backdrop-blur-md border-white/10',
      high: 'bg-white/10 backdrop-blur-xl border-white/20',
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-2xl border shadow-xl relative overflow-hidden',
          intensityClasses[intensity],
          hoverEffect &&
            'transition-all duration-300 hover:shadow-2xl hover:border-white/20 hover:-translate-y-1',
          className
        )}
        {...props}
      >
        {/* Subtle top inner highlight for depth */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
