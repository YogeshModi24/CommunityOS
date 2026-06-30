'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { CommandPalette } from '@/components/layout/CommandPalette';
import { FloatingActionButton, MobileNav } from '@/components/layout/MobileNav';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { NotificationCenter } from '@/components/NotificationCenter';
import { CitizenProvider } from '@/providers/CitizenProvider';
import { NotificationProvider, useNotifications } from '@/providers/NotificationProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isMap = pathname === '/map';
  const isFullScreen = isMap || pathname === '/feed' || pathname.startsWith('/feed/');

  // Determine page title for TopBar
  let pageTitle = 'CommunityOS';
  if (pathname === '/dashboard') pageTitle = 'Overview';
  else if (pathname.startsWith('/feed')) pageTitle = 'Issues Feed';
  else if (pathname === '/map') pageTitle = 'Interactive Map';
  else if (pathname === '/leaderboard') pageTitle = 'Leaderboard';
  else if (pathname === '/report') pageTitle = 'Report Issue';
  else if (pathname.startsWith('/issue/')) pageTitle = 'Issue Details';
  else if (pathname === '/profile') pageTitle = 'Mission Control';

  if (!mounted) return null; // Avoid hydration mismatch on initial render

  return (
    <CitizenProvider>
      <NotificationProvider>
        <div className="flex h-screen overflow-hidden bg-bg text-text-primary selection:bg-primary/25">
          {/* Mesh Background */}
          <div className="mesh-gradient" />

          {/* Desktop Sidebar */}
          <Sidebar user={session?.user} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 h-screen relative z-10 overflow-hidden">
            {/* Top Navigation */}
            {!isMap && <TopBar pageTitle={pageTitle} />}

            {/* Page Content with AnimatePresence for transitions */}
            <main
              className={`flex-1 overflow-y-auto custom-scrollbar relative ${isMap ? '' : isFullScreen ? '' : 'px-4 lg:px-8 py-6 lg:py-8'}`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key="os-content-layer"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={
                    isMap
                      ? 'h-full w-full absolute inset-0'
                      : isFullScreen
                        ? 'h-full'
                        : 'max-w-container-max mx-auto'
                  }
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>

          <CommandPalette />

          <NotificationCenterWrapper />

          {/* Mobile Navigation */}
          <FloatingActionButton />
          <MobileNav />
        </div>
      </NotificationProvider>
    </CitizenProvider>
  );
}

function NotificationCenterWrapper() {
  const {
    state: { isCenterOpen },
    dispatch,
  } = useNotifications();
  return (
    <NotificationCenter
      isOpen={isCenterOpen}
      onClose={() => dispatch({ type: 'SET_CENTER_OPEN', payload: false })}
    />
  );
}
