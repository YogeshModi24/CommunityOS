'use client';

import { motion } from 'framer-motion';
import { signOut } from 'next-auth/react';

import { useSocket } from '@/hooks/useSocket';
import { useNotifications } from '@/providers/NotificationProvider';

export function TopBar({ pageTitle }: { pageTitle?: string }) {
  const { socket, isConnected } = useSocket({});
  const {
    state: { unreadCount },
    dispatch,
  } = useNotifications();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const transportName = socket?.io?.engine?.transport?.name;
  const isWebsocket = isConnected && transportName === 'websocket';
  const isPolling = isConnected && (transportName === 'polling' || !transportName);

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

      {/* Desktop Title / Breadcrumb context & Sync Indicator */}
      <div className="hidden lg:flex items-center gap-4 text-sm font-medium text-text-secondary">
        {pageTitle && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            {pageTitle}
          </motion.div>
        )}
        <div className="flex items-center gap-2 px-2 py-1 bg-layer1 rounded-full border border-white/5 text-[10px] uppercase tracking-wider font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              isWebsocket
                ? 'bg-success animate-pulse'
                : isPolling
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-white/20'
            }`}
          />
          {isWebsocket ? (
            <span className="text-success">Live</span>
          ) : isPolling ? (
            <span className="text-amber-500">Live: Polling</span>
          ) : (
            <span className="text-text-tertiary">Offline</span>
          )}
        </div>
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
          onClick={() => dispatch({ type: 'SET_CENTER_OPEN', payload: true })}
          className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-text-secondary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-primary ring-2 ring-bg text-[8px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
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
    </header>
  );
}
