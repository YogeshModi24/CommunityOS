/* eslint-disable no-console */
'use client';

import { formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { useNotifications } from '@/providers/NotificationProvider';

import { OSStateView } from './layout/OSStateView';

export function NotificationCenter({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    state: { notifications, loading },
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const router = useRouter();

  const handleNotificationClick = async (n: any) => {
    if (!n.read) {
      await markAsRead(n.id || n._id);
    }
    // Deep link routing based on notification type
    if (n.issueId) {
      router.push(`/issue/${n.issueId}`);
      onClose();
    }
  };

  const getIconConfig = (type: string) => {
    switch (type) {
      case 'resolved':
      case 'ai_completed':
        return {
          icon: 'task_alt',
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-500',
          border: 'border-emerald-500/20',
        };
      case 'status_changed':
      case 'nearby_issue':
        return {
          icon: 'trending_up',
          bg: 'bg-amber-500/10',
          text: 'text-amber-500',
          border: 'border-amber-500/20',
        };
      case 'promotion':
      case 'assignment':
        return {
          icon: 'military_tech',
          bg: 'bg-indigo-500/10',
          text: 'text-indigo-400',
          border: 'border-indigo-500/20',
        };
      default:
        return {
          icon: 'info',
          bg: 'bg-citizen/10',
          text: 'text-citizen',
          border: 'border-citizen/20',
        };
    }
  };

  const formatNotificationTime = (dateStr: any) => {
    if (!dateStr) return 'some time ago';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'some time ago';
    try {
      return formatDistanceToNow(d, { addSuffix: true });
    } catch {
      return 'some time ago';
    }
  };

  // Grouping logic
  const validNotifications = Array.isArray(notifications) ? notifications : [];
  const today = validNotifications.filter((n) => {
    if (!n?.createdAt) return false;
    const d = new Date(n.createdAt);
    return !isNaN(d.getTime()) && isToday(d);
  });
  const yesterday = validNotifications.filter((n) => {
    if (!n?.createdAt) return false;
    const d = new Date(n.createdAt);
    return !isNaN(d.getTime()) && isYesterday(d);
  });
  const earlier = validNotifications.filter((n) => {
    if (!n?.createdAt) return false;
    const d = new Date(n.createdAt);
    return !isNaN(d.getTime()) && !isToday(d) && !isYesterday(d);
  });

  const NotificationGroup = ({ title, items }: { title: string; items: any[] }) => {
    if (!Array.isArray(items) || items.length === 0) return null;
    return (
      <div className="mb-8">
        <div className="px-6 mb-3 text-xs font-bold text-text-tertiary uppercase tracking-widest">
          {title}
        </div>
        <div className="space-y-1 px-4">
          <AnimatePresence>
            {items.map((n) => {
              const { icon, bg, text, border } = getIconConfig(n.type);
              return (
                <motion.div
                  key={n.id || n._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 rounded-[20px] flex gap-4 cursor-pointer transition-all relative overflow-hidden group ${n.read ? 'bg-layer2/30 border border-transparent hover:border-white/10 hover:bg-layer2/80' : 'bg-layer2 border border-border shadow-lg hover:border-white/20'}`}
                >
                  {!n.read && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-citizen shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
                  )}

                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg} ${text} border ${border} shadow-inner`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm font-bold truncate pr-4 ${!n.read ? 'text-white' : 'text-text-secondary'}`}
                      >
                        {n.title}
                      </span>
                      <span className="text-[11px] text-text-tertiary font-medium shrink-0">
                        {formatNotificationTime(n.createdAt)}
                      </span>
                    </div>
                    <p
                      className={`text-sm leading-snug line-clamp-2 ${!n.read ? 'text-text-secondary' : 'text-text-tertiary'}`}
                    >
                      {n.message}
                    </p>

                    {/* Deep link indicator */}
                    {n.issueId && (
                      <div className="mt-2 text-xs font-bold text-citizen opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        View Details{' '}
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blur Backdrop */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            onClick={onClose}
            className="fixed inset-0 bg-bg/40 z-[100]"
          />

          {/* OS-Style Activity Center Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 250, mass: 0.8 }}
            className="fixed top-2 right-2 bottom-2 w-full max-w-[420px] bg-layer1/90 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.5)] z-[101] flex flex-col font-body overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-white/5 bg-layer1/50">
              <h2 className="font-display font-bold text-2xl text-white tracking-tight flex items-center gap-2">
                Activity Center
              </h2>
              <div className="flex items-center gap-2">
                {Array.isArray(notifications) && notifications.some((n) => !n.read) && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="w-8 h-8 rounded-full bg-layer2 hover:bg-citizen/20 hover:text-citizen border border-border text-text-tertiary flex items-center justify-center transition-colors"
                    title="Mark all read"
                  >
                    <span className="material-symbols-outlined text-[18px]">done_all</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-layer2 hover:bg-white/10 border border-border text-text-tertiary hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pt-6 pb-20">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <OSStateView
                    type="loading"
                    title="Syncing Activity"
                    description="Connecting to civic data streams..."
                  />
                </div>
              ) : !Array.isArray(notifications) || notifications.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <OSStateView
                    type="empty"
                    title="All clear"
                    description="No new activities in your sector."
                  />
                </div>
              ) : (
                <>
                  <NotificationGroup title="Today" items={today} />
                  <NotificationGroup title="Yesterday" items={yesterday} />
                  <NotificationGroup title="Earlier" items={earlier} />
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
