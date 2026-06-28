import { motion } from 'framer-motion';
import { AlertTriangle, FileSearch, Loader2, ShieldAlert, WifiOff } from 'lucide-react';
import React from 'react';

type StateType = 'loading' | 'empty' | 'offline' | 'permission_denied' | 'error';

interface OSStateViewProps {
  type: StateType;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function OSStateView({ type, title, description, action }: OSStateViewProps) {
  const config = {
    loading: {
      icon: <Loader2 className="w-8 h-8 animate-spin text-citizen" />,
      defaultTitle: 'Processing...',
      defaultDesc: 'Synchronizing with civic network.',
    },
    empty: {
      icon: <FileSearch className="w-8 h-8 text-text-tertiary" />,
      defaultTitle: 'No Records Found',
      defaultDesc: 'There is no data available in this sector.',
    },
    offline: {
      icon: <WifiOff className="w-8 h-8 text-amber-500" />,
      defaultTitle: 'Network Disconnected',
      defaultDesc: 'You are currently offline. Checking for connection...',
    },
    permission_denied: {
      icon: <ShieldAlert className="w-8 h-8 text-rose-500" />,
      defaultTitle: 'Access Denied',
      defaultDesc: 'You do not have clearance for this sector.',
    },
    error: {
      icon: <AlertTriangle className="w-8 h-8 text-rose-500" />,
      defaultTitle: 'System Error',
      defaultDesc: 'An unexpected fault occurred in the matrix.',
    },
  };

  const { icon, defaultTitle, defaultDesc } = config[type];

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[300px] h-full p-8 font-body">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        <div className="w-16 h-16 rounded-2xl bg-layer2 border border-border flex items-center justify-center shadow-inner mb-6 relative group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
          {icon}
        </div>

        <h3 className="text-xl font-display font-bold text-white mb-2">{title || defaultTitle}</h3>
        <p className="text-sm text-text-secondary mb-8 leading-relaxed">
          {description || defaultDesc}
        </p>

        {action && (
          <button
            onClick={action.onClick}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-bold transition-all active:scale-95 shadow-lg backdrop-blur-md"
          >
            {action.label}
          </button>
        )}
      </motion.div>
    </div>
  );
}
