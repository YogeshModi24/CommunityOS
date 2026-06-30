/* eslint-disable no-console */
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Activity, FileText, LayoutDashboard, Map, Plus, Search, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

import { api } from '@/lib/api';

interface CommandItem {
  id: string;
  type: 'route' | 'action' | 'issue';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

export function CommandPalette() {
  const { data: session } = useSession();
  const user = session?.user;
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [issues, setIssues] = useState<any[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Toggle Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleCustomOpen);
    };
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
      fetchRecentIssues();
    }
  }, [isOpen]);

  const fetchRecentIssues = async () => {
    try {
      const res = await api.get('/api/issues?limit=5');
      setIssues(res.data.data.issues || []);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSelect = (item: CommandItem) => {
    setIsOpen(false);
    item.onSelect();
  };

  // Static Routes & Actions
  const isCitizen =
    user?.role !== 'admin' && user?.role !== 'municipality' && user?.role !== 'authority';
  const baseItems: CommandItem[] = [
    {
      id: 'nav-dashboard',
      type: 'route',
      title: 'Command Center',
      subtitle: 'Overview stats & operations',
      icon: <LayoutDashboard size={18} />,
      onSelect: () => router.push('/dashboard'),
    },
    {
      id: 'nav-feed',
      type: 'route',
      title: 'Community Feed',
      subtitle: 'Civic incidents',
      icon: <Activity size={18} />,
      onSelect: () => router.push('/feed'),
    },
    {
      id: 'nav-map',
      type: 'route',
      title: 'Interactive Map',
      subtitle: 'Live telemetry',
      icon: <Map size={18} />,
      onSelect: () => router.push('/map'),
    },
    {
      id: 'nav-leaderboard',
      type: 'route',
      title: 'Hall of Fame',
      subtitle: 'Top citizens',
      icon: <Trophy size={18} />,
      onSelect: () => router.push('/leaderboard'),
    },
    ...(isCitizen
      ? [
          {
            id: 'action-report',
            type: 'action' as const,
            title: 'Report New Issue',
            subtitle: 'Log a civic anomaly',
            icon: <Plus size={18} />,
            onSelect: () => router.push('/report'),
          },
        ]
      : []),
  ];

  // Dynamic Issues
  const issueItems: CommandItem[] = issues.map((issue) => ({
    id: `issue-${issue.id}`,
    type: 'issue',
    title: issue.title,
    subtitle: issue.address || 'Unknown location',
    icon: <FileText size={18} />,
    onSelect: () => router.push(`/issue/${issue.id}`),
  }));

  // Filter Items
  const allItems = [...baseItems, ...issueItems];
  const filteredItems = query
    ? allItems.filter(
        (i) =>
          i.title.toLowerCase().includes(query.toLowerCase()) ||
          (i.subtitle && i.subtitle.toLowerCase().includes(query.toLowerCase()))
      )
    : allItems;

  // Keyboard Navigation
  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      }
      if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredItems[selectedIndex]);
      }
    };
    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [isOpen, filteredItems, selectedIndex]);

  // Scroll active item into view
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      const activeEl = scrollRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 z-[201] flex items-start justify-center pt-[10vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl bg-layer1/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto flex flex-col font-body max-h-[70vh]"
            >
              {/* Search Input */}
              <div className="flex items-center px-4 py-4 border-b border-white/10">
                <Search className="w-5 h-5 text-text-tertiary mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a command or search..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-text-tertiary"
                />
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-layer2 rounded text-[10px] font-mono text-text-tertiary border border-border">
                    ESC
                  </kbd>
                </div>
              </div>

              {/* Results List */}
              <div className="flex-1 overflow-y-auto p-2" ref={scrollRef}>
                {filteredItems.length === 0 ? (
                  <div className="px-4 py-12 text-center text-text-tertiary">
                    No results found for "{query}"
                  </div>
                ) : (
                  filteredItems.map((item, index) => {
                    const isActive = index === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={() => handleSelect(item)}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-primary/20 text-primary border border-primary/20'
                            : 'text-text-secondary border border-transparent hover:bg-white/5'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-primary/20 text-primary' : 'bg-layer2 text-text-tertiary'}`}
                        >
                          {item.icon}
                        </div>
                        <div className="flex flex-col flex-1">
                          <span
                            className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-text-primary'}`}
                          >
                            {item.title}
                          </span>
                          {item.subtitle && (
                            <span className="text-xs text-text-tertiary">{item.subtitle}</span>
                          )}
                        </div>
                        {isActive && (
                          <div className="text-[10px] font-mono text-primary/70 flex items-center gap-1 shrink-0">
                            Select{' '}
                            <kbd className="px-1.5 py-0.5 rounded bg-primary/20 border border-primary/20">
                              ↵
                            </kbd>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-white/10 bg-layer2/50 flex items-center justify-between text-xs text-text-tertiary">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-layer2 border border-border">↑</kbd>
                    <kbd className="px-1 py-0.5 rounded bg-layer2 border border-border">↓</kbd> to
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-layer2 border border-border">↵</kbd> to
                    select
                  </span>
                </div>
                <span>CommunityOS v4.0</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
