'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

import { NotificationCenter } from '@/components/NotificationCenter';

export function TopBar({ pageTitle }: { pageTitle?: string }) {
  const router = useRouter();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-bg/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 lg:px-8">
      {/* Mobile Title (hidden on desktop where Sidebar handles branding) */}
      <div className="flex items-center gap-3 lg:hidden">
        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold shadow-glow-blue">
          C
        </div>
        <span className="font-display font-semibold text-text-primary">
          {pageTitle || 'CommunityOS'}
        </span>
      </div>

      {/* Desktop Title / Breadcrumb context */}
      <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-text-secondary">
        {pageTitle && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            {pageTitle}
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Command Palette Trigger */}
        <button
          onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-text-muted hover:bg-white/10 hover:text-text-secondary transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">search</span>
          Search issues...
          <kbd className="ml-2 px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">⌘K</kbd>
        </button>

        {/* Search Icon (Mobile) */}
        <button
          onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
          className="sm:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-text-secondary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => setIsNotifOpen(true)}
          className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-text-secondary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-bg" />
        </button>

        <div className="w-px h-5 bg-border hidden sm:block mx-2" />

        {/* Logout (Temporary here, usually in dropdown) */}
        <button
          onClick={handleLogout}
          className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full hover:bg-danger/10 text-text-secondary hover:text-danger transition-colors"
          title="Sign out"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>

      <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </header>
  );
}
