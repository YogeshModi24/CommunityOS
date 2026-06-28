import { HTMLMotionProps, motion } from 'framer-motion';
import React from 'react';

import { cn } from '@/lib/utils';

interface GradientButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  glow?: boolean;
}

export const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ children, variant = 'primary', size = 'md', className, glow = false, ...props }, ref) => {
    const baseStyles =
      'relative inline-flex items-center justify-center font-medium rounded-full overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg focus:ring-primary';

    const variants = {
      primary: 'text-white bg-white/5 border border-white/10 hover:border-white/20',
      secondary: 'text-white bg-transparent border border-white/10 hover:bg-white/5',
      glass: 'text-white bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg font-semibold',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {variant === 'primary' && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/80 opacity-80 group-hover:opacity-100 transition-opacity" />
        )}

        {glow && (
          <div className="absolute inset-0 rounded-full blur-md bg-gradient-to-r from-primary to-accent opacity-40 animate-pulse-slow" />
        )}

        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </motion.button>
    );
  }
);

GradientButton.displayName = 'GradientButton';
