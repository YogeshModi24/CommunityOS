'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// ─── Animated Counter ─────────────────────────────────────────────────────────
export function AnimatedCounter({
  value,
  duration = 1.5,
  prefix = '',
  suffix = '',
  className = '',
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    startRef.current = null;
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/2 rounded" />
          <Skeleton className="h-2.5 w-1/3 rounded" />
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-3/4 rounded" />
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
const GRADIENT_PAIRS = [
  ['#2563EB', '#7C3AED'],
  ['#10B981', '#2563EB'],
  ['#F59E0B', '#EF4444'],
  ['#7C3AED', '#EC4899'],
  ['#10B981', '#7C3AED'],
  ['#3B82F6', '#10B981'],
];

export function Avatar({
  name,
  src,
  size = 40,
  className = '',
}: {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}) {
  const idx = name.charCodeAt(0) % GRADIENT_PAIRS.length;
  const [g1, g2] = GRADIENT_PAIRS[idx];
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${g1}, ${g2})`,
        fontSize: size * 0.36,
      }}
      className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  open: 'badge-open',
  resolved: 'badge-resolved',
  in_progress: 'badge-progress',
  rejected: 'badge-critical',
};

export function StatusBadge({ status }: { status: string }) {
  const label =
    status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1);
  const dot =
    status === 'open'
      ? '#60A5FA'
      : status === 'resolved'
        ? '#34D399'
        : status === 'in_progress'
          ? '#FCD34D'
          : '#FCA5A5';
  return (
    <span className={`badge ${STATUS_STYLES[status] ?? 'badge-open'}`}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: dot,
          display: 'inline-block',
        }}
      />
      {label}
    </span>
  );
}

const CAT_STYLES: Record<string, { color: string; icon: string }> = {
  pothole: { color: '#F97316', icon: '⚠' },
  water_leak: { color: '#3B82F6', icon: '💧' },
  streetlight: { color: '#EAB308', icon: '💡' },
  garbage: { color: '#22C55E', icon: '🗑' },
  sewage: { color: '#A855F7', icon: '🔧' },
  encroachment: { color: '#EF4444', icon: '🚫' },
  other: { color: '#94A3B8', icon: '📍' },
};

export function CategoryBadge({ category }: { category: string }) {
  const cfg = CAT_STYLES[category] ?? CAT_STYLES.other;
  const label = category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span
      className="badge"
      style={{
        background: `${cfg.color}18`,
        color: cfg.color,
        border: `1px solid ${cfg.color}40`,
      }}
    >
      {cfg.icon} {label}
    </span>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────
export function ProgressRing({
  value,
  max = 100,
  size = 80,
  stroke = 6,
  color = '#2563EB',
  children,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  color?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const dash = circ * pct;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ strokeDasharray: circ }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'warning' | 'info';

export function Toast({
  message,
  type = 'info',
  onClose,
}: {
  message: string;
  type?: ToastType;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles: Record<ToastType, string> = {
    success: 'border-success/30 bg-success/10 text-success',
    error: 'border-danger/30 bg-danger/10 text-danger',
    warning: 'border-warning/30 bg-warning/10 text-warning-400',
    info: 'border-primary/30 bg-primary/10 text-primary-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl border text-sm font-medium shadow-xl backdrop-blur-xl ${styles[type]}`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        ✕
      </button>
    </motion.div>
  );
}

export function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Array<{ id: string; message: string; type: ToastType }>;
  removeToast: (id: string) => void;
}) {
  return (
    <AnimatePresence>
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </AnimatePresence>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  suffix = '',
  prefix = '',
  icon,
  color = '#2563EB',
  delta,
}: {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon?: React.ReactNode;
  color?: string;
  delta?: { value: number; label: string };
}) {
  return (
    <motion.div
      className="card p-5 space-y-4"
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-widest">
          {label}
        </span>
        {icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${color}18` }}
          >
            <span style={{ color }}>{icon}</span>
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold font-display text-text-primary">
          <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
        </span>
      </div>
      {delta && (
        <div className={`text-xs font-medium ${delta.value >= 0 ? 'text-success' : 'text-danger'}`}>
          {delta.value >= 0 ? '↑' : '↓'} {Math.abs(delta.value)}% {delta.label}
        </div>
      )}
    </motion.div>
  );
}
