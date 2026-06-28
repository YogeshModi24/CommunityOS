'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Network } from 'lucide-react';
import Link from 'next/link';
import React, { useMemo } from 'react';

interface TelemetryPanelProps {
  data: any;
  isLoading?: boolean;
}

export function TelemetryPanel({ data, isLoading }: TelemetryPanelProps) {
  // Use recent activities for "hotspots"
  const nodes = useMemo(() => {
    if (!data?.recentActivity) return [];
    return data.recentActivity.slice(0, 8).map((activity: any, i: number) => ({
      id: activity.id,
      status: activity.status,
      // Scatter them abstractly on a grid
      x: 15 + ((i * 27) % 70) + Math.random() * 10,
      y: 20 + ((i * 31) % 60) + Math.random() * 10,
      delay: i * 0.1,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-layer1 border border-white/5 rounded-3xl h-[400px] lg:h-[500px] animate-pulse" />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-layer1 border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[400px] lg:h-[500px] relative group shadow-lg"
    >
      {/* Abstract Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Radar Pulse */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-citizen/10 flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full border border-citizen/10 flex items-center justify-center">
          <div className="w-[400px] h-[400px] rounded-full border border-citizen/10 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-citizen/20 animate-[ping_4s_ease-out_infinite] opacity-50" />
          </div>
        </div>
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(12,16,23,0.9)_100%)] pointer-events-none" />

      {/* Connection Lines (Abstract SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
            <stop offset="50%" stopColor="#3B82F6" stopOpacity="1" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {nodes.map((node: any, i: number) => {
          if (i === 0) return null;
          const prev = nodes[i - 1];
          return (
            <motion.line
              key={`line-${node.id}`}
              x1={`${prev.x}%`}
              y1={`${prev.y}%`}
              x2={`${node.x}%`}
              y2={`${node.y}%`}
              stroke="url(#line-gradient)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ delay: node.delay + 0.5, duration: 1 }}
            />
          );
        })}
      </svg>

      {/* Nodes Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {nodes.map((node: any) => {
          const isResolved = node.status === 'resolved';
          const isProgress = node.status === 'in_progress';
          const colorClass = isResolved ? 'bg-success' : isProgress ? 'bg-accent' : 'bg-citizen';
          const glowClass = isResolved
            ? 'shadow-[0_0_15px_#10b981]'
            : isProgress
              ? 'shadow-[0_0_15px_#f59e0b]'
              : 'shadow-[0_0_15px_#3B82F6]';

          return (
            <motion.div
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: node.delay, type: 'spring' }}
              className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full z-10 flex items-center justify-center"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              {!isResolved && (
                <div
                  className={`absolute inset-0 rounded-full ${colorClass} animate-ping opacity-60`}
                />
              )}
              <div
                className={`w-full h-full rounded-full ${colorClass} ${glowClass} border border-white/20`}
              />
            </motion.div>
          );
        })}
      </div>

      <div className="relative z-10 p-8 flex flex-col h-full justify-between pointer-events-none">
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-2 flex items-center gap-3 drop-shadow-md">
            <Network className="w-5 h-5 text-citizen" />
            Infrastructure Telemetry
          </h2>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-citizen animate-pulse" />
              <span className="text-xs text-text-tertiary uppercase tracking-widest font-bold">
                Anomalies
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs text-text-tertiary uppercase tracking-widest font-bold">
                Active Repair
              </span>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto">
          <Link
            href="/map"
            aria-label="Open full map"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-layer2/80 hover:bg-white text-text-primary hover:text-bg backdrop-blur-xl border border-white/10 rounded-xl font-bold transition-all group-hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen"
          >
            Enter Full Map
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
