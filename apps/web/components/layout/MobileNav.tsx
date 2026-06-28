'use client';

import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: 'dashboard' },
  { href: '/feed', label: 'Feed', icon: 'dynamic_feed' },
  { href: '/map', label: 'Map', icon: 'map' },
  { href: '/leaderboard', label: 'Rank', icon: 'military_tech' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-bg/95 backdrop-blur-xl border-t border-border flex items-center justify-around px-2 pb-safe">
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href || (item.href === '/feed' && pathname.startsWith('/feed'));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'relative flex flex-col items-center justify-center w-16 h-full transition-colors',
              isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="mobile-nav-active"
                className="absolute top-0 w-8 h-1 bg-primary rounded-b-full shadow-glow-blue"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
            <span
              className="material-symbols-outlined text-[24px] mb-0.5"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function FloatingActionButton() {
  const pathname = usePathname();

  if (pathname === '/report') return null;

  return (
    <Link
      href="/report"
      className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-tr from-primary to-accent rounded-full flex items-center justify-center text-white shadow-glow-blue z-40 hover:scale-105 active:scale-95 transition-transform"
    >
      <span className="material-symbols-outlined text-[28px]">add</span>
    </Link>
  );
}
