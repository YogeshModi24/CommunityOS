import { AlertTriangle, Bell, Check, Info, ShieldCheck } from 'lucide-react';

import { useNotifications } from '@/providers/NotificationProvider';

const TYPE_ICONS: Record<string, any> = {
  info: Info,
  alert: AlertTriangle,
  success: ShieldCheck,
};

const TYPE_STYLES: Record<string, string> = {
  info: 'bg-primary/10 text-primary',
  alert: 'bg-warning/10 text-warning',
  success: 'bg-success/10 text-success',
};

export function ProfileNotifications({ profile: _profile }: { profile?: any }) {
  const { state: { notifications, loading, error }, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display font-semibold text-white">Notifications</h3>
        <button 
          onClick={() => markAllAsRead()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-white transition-colors"
        >
          <Check className="w-4 h-4" /> Mark all as read
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-text-tertiary animate-pulse">Loading notifications...</div>
      ) : error ? (
        <div className="py-12 text-center text-danger">Failed to load notifications.</div>
      ) : notifications.length === 0 ? (
        <div className="py-12 text-center text-text-tertiary">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>You have no notifications.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => {
            const Icon = TYPE_ICONS[notif.type] || Bell;
            const style = TYPE_STYLES[notif.type] || TYPE_STYLES.info;
            
            return (
              <div 
                key={notif.id} 
                className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-colors
                  ${notif.read ? 'bg-white/[0.02] border-white/5 opacity-70' : 'bg-white/5 border-white/10'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg shrink-0 ${style}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-medium ${notif.read ? 'text-text-secondary' : 'text-white'}`}>
                      {notif.title}
                    </h4>
                    <p className="text-sm text-text-tertiary mt-1">{notif.message}</p>
                    <p className="text-xs text-text-secondary/50 mt-2">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!notif.read && (
                  <button 
                    onClick={() => markAsRead(notif.id)}
                    className="p-2 shrink-0 text-text-tertiary hover:text-success hover:bg-success/10 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
