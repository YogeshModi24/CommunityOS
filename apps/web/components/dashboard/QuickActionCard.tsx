import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  colorClass: string;
  delay?: number;
}

export function QuickActionCard({
  title,
  description,
  icon,
  href,
  colorClass,
  delay = 0,
}: QuickActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Link
        href={href}
        aria-label={title}
        className="block h-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen rounded-2xl"
      >
        <div className="bg-layer1 hover:bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-2xl p-6 h-full flex flex-col transition-all duration-300">
          <div
            className={`w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform ${colorClass}`}
          >
            {icon}
          </div>

          <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-between">
            {title}
            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-text-secondary" />
          </h3>
          <p className="text-text-secondary text-sm flex-grow">{description}</p>
        </div>
      </Link>
    </motion.div>
  );
}
