'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Node {
  id: number;
  x: number;
  y: number;
  type: 'citizen' | 'issue' | 'resolved';
}

export function TelemetryNetwork() {
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    // Generate static nodes for the background network effect
    const newNodes: Node[] = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      type: Math.random() > 0.8 ? 'issue' : Math.random() > 0.5 ? 'resolved' : 'citizen',
    }));
    setNodes(newNodes);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 mix-blend-screen">
      {nodes.map((node, i) => {
        // Draw connections to next 2 nodes
        const target1 = nodes[(i + 1) % nodes.length];
        const target2 = nodes[(i + 2) % nodes.length];

        return (
          <div key={node.id}>
            {/* Node */}
            <motion.div
              className={`absolute w-1.5 h-1.5 rounded-full ${node.type === 'issue' ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : node.type === 'resolved' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-citizen shadow-[0_0_10px_#2563eb]'}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />

            {/* SVG Connection Lines */}
            <svg className="absolute inset-0 w-full h-full overflow-visible">
              <motion.line
                x1={`${node.x}%`}
                y1={`${node.y}%`}
                x2={`${target1.x}%`}
                y2={`${target1.y}%`}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
                animate={{ strokeOpacity: [0.05, 0.2, 0.05] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.1 }}
              />
              {i % 2 === 0 && (
                <motion.line
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${target2.x}%`}
                  y2={`${target2.y}%`}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="0.5"
                />
              )}
            </svg>
          </div>
        );
      })}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0C1017_80%)]" />
    </div>
  );
}
