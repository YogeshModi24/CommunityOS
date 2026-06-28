import { HTMLMotionProps, motion } from 'framer-motion';
import React from 'react';

import { cn } from '@/lib/utils';

interface HeroHeadingProps extends HTMLMotionProps<'h1'> {
  title: string;
  highlight?: string;
  subtitle?: string;
  className?: string;
}

export function HeroHeading({ title, highlight, subtitle, className, ...props }: HeroHeadingProps) {
  return (
    <div className={cn('flex flex-col items-center text-center', className)}>
      <motion.h1
        className="text-display font-display font-bold tracking-tighter text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        {...props}
      >
        {title}
        {highlight && (
          <span className="block bg-gradient-to-r from-primary via-blue-400 to-accent bg-clip-text text-transparent">
            {highlight}
          </span>
        )}
      </motion.h1>

      {subtitle && (
        <motion.p
          className="mt-6 max-w-2xl text-body-lg text-text-secondary leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
