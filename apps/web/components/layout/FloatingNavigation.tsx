'use client';

import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import Link from 'next/link';
import React, { useState } from 'react';

import { GradientButton } from '../ui/GradientButton';

export function FloatingNavigation() {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollYProgress, 'change', (current) => {
    if (typeof current === 'number') {
      const direction = current! - scrollYProgress.getPrevious()!;
      if (scrollYProgress.get() < 0.05) {
        setVisible(true);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    }
  });

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-6 inset-x-0 mx-auto w-[90%] max-w-4xl z-50 pointer-events-none flex justify-center"
    >
      <div className="pointer-events-auto flex items-center justify-between px-6 py-3 w-full bg-surface/40 backdrop-blur-xl border border-white/10 rounded-full shadow-lg shadow-black/50">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm tracking-tighter group-hover:scale-110 transition-transform">
              CO
            </span>
          </div>
          <span className="font-display font-semibold text-text-primary tracking-tight">
            CommunityOS
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
          <Link href="#features" className="hover:text-text-primary transition-colors">
            Features
          </Link>
          <Link href="#impact" className="hover:text-text-primary transition-colors">
            Impact
          </Link>
          <Link href="#platform" className="hover:text-text-primary transition-colors">
            Platform
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login?type=citizen"
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors hidden sm:block"
          >
            Sign In
          </Link>
          <Link href="/dashboard">
            <GradientButton size="sm" className="hidden sm:inline-flex rounded-full">
              Launch App
            </GradientButton>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
