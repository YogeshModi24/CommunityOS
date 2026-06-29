'use client';

import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Avatar } from '../ui/primitives';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Command Center', icon: 'dashboard' },
  { href: '/feed', label: 'Issues Feed', icon: 'dynamic_feed' },
  { href: '/map', label: 'Interactive Map', icon: 'map' },
  { href: '/leaderboard', label: 'Leaderboard', icon: 'military_tech' },
];

export function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const searchStr = typeof window !== 'undefined' ? window.location.search : '';
  const currentPath = pathname + searchStr;

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 88 : 280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="hidden lg:flex flex-col shrink-0 h-screen sticky top-0 bg-layer1/95 border-r border-border backdrop-blur-3xl z-40 py-8 overflow-hidden font-body shadow-[10px_0_30px_rgba(0,0,0,0.2)]"
    >
      {/* Brand & Collapse Toggle */}
      <div className="flex items-center justify-between px-6 mb-10">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-citizen border border-citizen/50 flex items-center justify-center text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <span className="font-display text-lg">C</span>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-display font-bold text-xl tracking-tight text-white whitespace-nowrap"
              >
                CommunityOS
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-8 h-8 shrink-0 flex items-center justify-center text-text-tertiary hover:text-white transition-colors bg-layer2 rounded-lg hover:bg-white/10 border border-transparent hover:border-border"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isCollapsed ? 'menu_open' : 'keyboard_double_arrow_left'}
          </span>
        </button>
      </div>

      {/* Profile summary */}
      <div className="px-6 mb-8">
        <Link
          href="/profile"
          className={clsx(
            'p-3 rounded-2xl bg-layer2 border border-border flex items-center gap-4 hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer shadow-inner',
            isCollapsed && 'justify-center'
          )}
        >
          <Avatar name={user?.name || 'Citizen'} size={40} />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate font-display">
                {user?.name || 'Citizen'}
              </div>
              <div className="text-[11px] font-bold text-text-tertiary truncate flex justify-between uppercase tracking-widest mt-1">
                <span>{user?.role || 'Citizen'}</span>
                <span className="text-citizen font-mono">{user?.points || 0} XP</span>
              </div>
              {user?.ward && (
                <div className="text-[10px] uppercase text-text-muted mt-1 tracking-widest font-bold">
                  {user.ward}
                </div>
              )}
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 flex flex-col gap-8 overflow-y-auto hide-scrollbar px-3">
        {/* Main Nav */}
        <div className="flex flex-col gap-2">
          {!isCollapsed && (
            <div className="px-5 mb-2 text-[10px] font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-px bg-border"></span>
              Workspace
            </div>
          )}
          {NAV_ITEMS.map((item) => {
            const isActive =
              currentPath === item.href ||
              (item.href === '/feed' && pathname === '/feed' && !searchStr);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all group relative overflow-hidden',
                  isActive ? 'text-white' : 'text-text-secondary hover:text-white',
                  isCollapsed && 'justify-center'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-layer2 border border-border rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    {/* Active Accent Line */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-citizen rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
                  </motion.div>
                )}
                {!isActive && (
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                )}
                <span
                  className="material-symbols-outlined text-[22px] relative z-10 transition-transform group-hover:scale-110"
                  style={isActive ? { color: '#3b82f6', fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="relative z-10 whitespace-nowrap tracking-wide">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Shortcuts */}
        <div className="flex flex-col gap-2">
          {!isCollapsed && (
            <div className="px-5 mb-2 text-[10px] font-bold text-text-tertiary uppercase tracking-widest flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-4 h-px bg-border"></span>
                Quick Actions
              </div>
            </div>
          )}

          <button
            className={clsx(
              'flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all group text-text-secondary hover:text-white relative',
              isCollapsed && 'justify-center'
            )}
            title={isCollapsed ? 'Search' : undefined}
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <span className="material-symbols-outlined text-[22px] relative z-10 group-hover:scale-110 transition-transform">
              search
            </span>
            {!isCollapsed && (
              <div className="flex flex-1 items-center justify-between relative z-10 tracking-wide">
                <span>Search</span>
                <kbd className="text-[10px] font-mono font-bold bg-layer2 px-2 py-1 rounded text-text-tertiary border border-border shadow-inner">
                  ⌘K
                </kbd>
              </div>
            )}
          </button>

          <button
            className={clsx(
              'flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all group text-text-secondary hover:text-white relative',
              isCollapsed && 'justify-center'
            )}
            title={isCollapsed ? 'Notifications' : undefined}
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <div className="relative z-10 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)] border-2 border-layer1"></span>
            </div>
            {!isCollapsed && <span className="relative z-10 tracking-wide">Notifications</span>}
          </button>
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto px-6 pt-6">
        <Link
          href="/report"
          className={clsx(
            'w-full py-4 bg-citizen text-white rounded-[20px] text-sm font-bold flex items-center justify-center gap-3 hover:bg-blue-600 transition-all group shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-95',
            isCollapsed ? 'px-0 py-4 rounded-2xl' : 'px-4'
          )}
        >
          <span className="material-symbols-outlined text-[24px] group-hover:rotate-90 transition-transform duration-300">
            add
          </span>
          {!isCollapsed && <span className="whitespace-nowrap tracking-wide">Report Issue</span>}
        </Link>
      </div>
    </motion.aside>
  );
}
