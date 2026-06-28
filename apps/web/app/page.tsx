'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Camera,
  CheckCircle2,
  ChevronRight,
  Map,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { FloatingNavigation } from '@/components/layout/FloatingNavigation';
import { OSStateView } from '@/components/layout/OSStateView';
import { TelemetryNetwork } from '@/components/layout/TelemetryNetwork';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { BentoCard, BentoGrid } from '@/components/ui/BentoGrid';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { HeroHeading } from '@/components/ui/HeroHeading';
import { MeshBackground } from '@/components/ui/MeshBackground';
import { api } from '@/lib/api';

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const yDashboard = useTransform(scrollYProgress, [0, 0.3], [100, -50]);
  const opacityDashboard = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const shouldReduceMotion = useReducedMotion();

  const [stats, setStats] = useState<{ total: number; resolved: number; users: number } | null>(
    null
  );
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    // Attempt to fetch real platform statistics
    // The user requested NO MOCK DATA. If it fails, we show Empty States.
    api
      .get('/api/stats')
      .then((res) => {
        setStats(res.data);
        setStatsLoading(false);
      })
      .catch(() => {
        setStats(null);
        setStatsLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-bg selection:bg-primary/30 text-text-primary overflow-hidden">
      <MeshBackground />
      <FloatingNavigation />

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[85vh]">
        <TelemetryNetwork />

        <motion.div
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-success motion-safe:animate-pulse" />
          <span className="text-sm font-medium text-text-secondary">CommunityOS v8.0 is Live</span>
        </motion.div>

        <HeroHeading
          title="The Civic Intelligence "
          highlight="Platform for Modern Cities"
          subtitle="CommunityOS transforms raw citizen reports into structured, actionable intelligence using AI. Build safer, cleaner, and smarter neighborhoods without the bureaucratic friction."
          className="max-w-4xl"
        />

        <motion.div
          className="mt-12 flex flex-col sm:flex-row items-center gap-4"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Link
            href="/dashboard"
            className="w-full sm:w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen rounded-xl"
            aria-label="Launch Platform"
          >
            <GradientButton size="lg" className="w-full sm:w-auto">
              Launch Platform
              <ArrowRight className="w-5 h-5 ml-1" />
            </GradientButton>
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen rounded-xl"
            aria-label="Municipality Sign In"
          >
            <GradientButton variant="glass" size="lg" className="w-full sm:w-auto">
              Municipality Sign In
            </GradientButton>
          </Link>
        </motion.div>
      </section>

      {/* LIVE DASHBOARD PREVIEW */}
      <section className="relative w-full px-6 max-w-6xl mx-auto -mt-20 mb-32 z-10">
        <motion.div
          style={shouldReduceMotion ? undefined : { y: yDashboard, opacity: opacityDashboard }}
          className="relative rounded-[2rem] p-2 bg-gradient-to-b from-white/10 to-transparent border border-white/10 shadow-2xl shadow-black/50 backdrop-blur-xl"
        >
          <div className="absolute inset-0 bg-black/40 rounded-[2rem] z-[-1]" />
          <div className="w-full h-[600px] rounded-[1.5rem] bg-layer1 border border-white/5 overflow-hidden flex">
            {/* Fake Sidebar */}
            <div className="w-64 border-r border-white/5 bg-layer2/50 p-6 flex flex-col gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 mb-8" />
              <div className="w-full h-8 rounded-md bg-white/5 animate-pulse" />
              <div className="w-3/4 h-8 rounded-md bg-white/5" />
              <div className="w-5/6 h-8 rounded-md bg-white/5" />
            </div>
            {/* Fake Content */}
            <div className="flex-1 p-8 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div className="w-48 h-8 rounded-lg bg-white/5" />
                <div className="w-32 h-10 rounded-full bg-white/5" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-32 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-white/5 p-4 flex flex-col justify-end">
                  <div className="w-12 h-12 rounded-full bg-primary/20 mb-auto" />
                  <div className="w-24 h-4 rounded bg-white/10" />
                </div>
                <div className="h-32 rounded-xl bg-gradient-to-br from-accent/10 to-transparent border border-white/5 p-4 flex flex-col justify-end">
                  <div className="w-12 h-12 rounded-full bg-accent/20 mb-auto" />
                  <div className="w-24 h-4 rounded bg-white/10" />
                </div>
                <div className="h-32 rounded-xl bg-gradient-to-br from-success/10 to-transparent border border-white/5 p-4 flex flex-col justify-end">
                  <div className="w-12 h-12 rounded-full bg-success/20 mb-auto" />
                  <div className="w-24 h-4 rounded bg-white/10" />
                </div>
              </div>
              <div className="flex-1 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.1),transparent_70%)]" />
                {!shouldReduceMotion && (
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-1/2 left-0 w-1/2 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* STORYTELLING: CITIZEN JOURNEY */}
      <section
        id="impact"
        className="py-32 px-6 max-w-7xl mx-auto border-t border-white/5 relative"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <div className="mb-20 text-center">
          <h2 className="text-headline-lg font-display font-bold text-white mb-4">
            Frictionless Civic Engagement
          </h2>
          <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
            From a pothole sighting to a dispatched repair crew in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-px bg-white/10 z-0" />

          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <GlassCard
              intensity="low"
              className="p-8 h-full flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary mb-6 shadow-glow-blue">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-headline-sm text-white mb-2 font-display">1. Capture</h3>
              <p className="text-text-secondary text-body-md">
                Citizens snap a photo. Location and timestamp are captured instantly.
              </p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: shouldReduceMotion ? 0 : 0.1 }}
            className="relative z-10"
          >
            <GlassCard
              intensity="low"
              className="p-8 h-full flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-accent mb-6 shadow-glow-violet">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-headline-sm text-white mb-2 font-display">2. AI Analysis</h3>
              <p className="text-text-secondary text-body-md">
                Vision models classify the issue, assess severity, and extract key details
                automatically.
              </p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: shouldReduceMotion ? 0 : 0.2 }}
            className="relative z-10"
          >
            <GlassCard
              intensity="low"
              className="p-8 h-full flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-success mb-6 shadow-glow-green">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-headline-sm text-white mb-2 font-display">3. Resolution</h3>
              <p className="text-text-secondary text-body-md">
                Municipalities receive prioritized tickets. Citizens are updated when fixed.
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* REAL STATISTICS SECTION */}
      <section className="py-24 px-6 relative overflow-hidden bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <h2 className="text-headline-md font-display font-semibold text-text-primary mb-12">
            Platform Impact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl">
            {statsLoading ? (
              <div className="col-span-3">
                <OSStateView
                  type="loading"
                  title="Analyzing Telemetry"
                  description="Crunching regional infrastructure data..."
                />
              </div>
            ) : stats ? (
              // Real Data Animated Counters
              <>
                <div className="flex flex-col items-center text-center">
                  <AnimatedCounter
                    value={stats.total}
                    className="text-5xl font-display font-bold text-white mb-2"
                  />
                  <span className="text-text-secondary text-label-md uppercase tracking-wider">
                    Total Reports
                  </span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <AnimatedCounter
                    value={stats.resolved}
                    className="text-5xl font-display font-bold text-success mb-2"
                  />
                  <span className="text-text-secondary text-label-md uppercase tracking-wider">
                    Issues Resolved
                  </span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <AnimatedCounter
                    value={stats.users}
                    className="text-5xl font-display font-bold text-primary mb-2"
                  />
                  <span className="text-text-secondary text-label-md uppercase tracking-wider">
                    Active Citizens
                  </span>
                </div>
              </>
            ) : (
              <div className="col-span-3">
                <OSStateView
                  type="empty"
                  title="Awaiting Telemetry"
                  description="Platform statistics will appear once the first issue is reported."
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURE BENTO GRID */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="mb-20">
          <h2 className="text-headline-lg font-display font-bold text-white mb-4">
            Engineered for Scale
          </h2>
          <p className="text-body-lg text-text-secondary max-w-2xl">
            Everything you need to monitor and maintain infrastructure, packed into a beautiful
            interface.
          </p>
        </div>

        <BentoGrid>
          <BentoCard
            colSpan={2}
            rowSpan={1}
            className="bg-[radial-gradient(ellipse_at_bottom_right,rgba(37,99,235,0.15),transparent_50%)]"
          >
            <ShieldCheck className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-headline-sm font-display text-white mb-2">Automated Moderation</h3>
            <p className="text-text-secondary">
              AI filters out spam, irrelevant images, and inappropriate content before it ever
              reaches your dashboard. Save hundreds of manual review hours.
            </p>
          </BentoCard>

          <BentoCard
            colSpan={1}
            rowSpan={2}
            className="bg-[radial-gradient(ellipse_at_top_left,rgba(124,58,237,0.15),transparent_50%)]"
          >
            <Map className="w-8 h-8 text-accent mb-4" />
            <h3 className="text-headline-sm font-display text-white mb-2">Live Heatmaps</h3>
            <p className="text-text-secondary mb-6">
              Instantly identify critical infrastructure failures with real-time geographical
              clustering.
            </p>
            <div className="mt-auto h-32 rounded-lg bg-black/20 border border-white/10 overflow-hidden relative">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:12px_12px]" />
              <div className="absolute top-[40%] left-[50%] w-3 h-3 rounded-full bg-primary shadow-glow-blue motion-safe:animate-[ping_3s_ease-out_infinite] -translate-x-1/2 -translate-y-1/2 opacity-80" />
              <div className="absolute top-[20%] left-[70%] w-2 h-2 rounded-full bg-accent shadow-glow-violet motion-safe:animate-[ping_4s_ease-out_infinite] opacity-60" />
              <div className="absolute top-[70%] left-[30%] w-2 h-2 rounded-full bg-success shadow-glow-green motion-safe:animate-[ping_2s_ease-out_infinite] opacity-70" />
              <div className="absolute top-[80%] left-[60%] w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e] motion-safe:animate-[ping_3.5s_ease-out_infinite] opacity-90" />
            </div>
          </BentoCard>

          <BentoCard colSpan={1} rowSpan={1}>
            <Users className="w-8 h-8 text-success mb-4" />
            <h3 className="text-headline-sm font-display text-white mb-2">
              Community Verification
            </h3>
            <p className="text-text-secondary">
              Crowdsourced voting ensures that the most pressing issues rise to the top of your
              queue.
            </p>
          </BentoCard>

          <BentoCard colSpan={1} rowSpan={1}>
            <BarChart3 className="w-8 h-8 text-white mb-4" />
            <h3 className="text-headline-sm font-display text-white mb-2">Predictive Insights</h3>
            <p className="text-text-secondary">
              Identify recurring problem areas before they escalate into major infrastructure
              failures.
            </p>
          </BentoCard>
        </BentoGrid>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-40 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/10" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/20 blur-[100px]" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-headline-xl font-display font-bold text-white mb-6 tracking-tight">
            Ready to upgrade your city?
          </h2>
          <p className="text-body-lg text-text-secondary mb-10 max-w-2xl mx-auto">
            Join the modern municipalities relying on CommunityOS to build cleaner, safer, and
            smarter neighborhoods.
          </p>
          <div className="flex justify-center">
            <Link
              href="/dashboard"
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen rounded-xl"
              aria-label="Start Using CommunityOS"
            >
              <GradientButton size="lg" glow>
                Start Using CommunityOS
                <ChevronRight className="w-5 h-5 ml-2" />
              </GradientButton>
            </Link>
          </div>
        </div>
      </section>

      {/* MINIMAL FOOTER */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">CO</span>
            </div>
            <span className="font-display font-semibold text-text-primary text-sm">
              CommunityOS
            </span>
          </div>
          <p className="text-text-tertiary text-sm">
            © {new Date().getFullYear()} CommunityOS. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="https://github.com/yogesh-developer"
              className="text-text-tertiary hover:text-white transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen rounded px-1"
            >
              GitHub
            </Link>
            <Link
              href="#"
              className="text-text-tertiary hover:text-white transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen rounded px-1"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-text-tertiary hover:text-white transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen rounded px-1"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
