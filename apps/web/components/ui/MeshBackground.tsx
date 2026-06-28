'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import React from 'react';

export function MeshBackground() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <motion.div
      style={{ opacity }}
      className="fixed inset-0 z-[-1] overflow-hidden bg-bg pointer-events-none"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(28,37,53,0.5),transparent_50%)]" />

      <motion.div
        style={{ y: y1 }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]"
      />

      <motion.div
        style={{ y: y2 }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-accent/20 blur-[120px]"
      />
    </motion.div>
  );
}
