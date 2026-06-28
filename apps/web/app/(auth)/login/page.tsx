'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Check,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [email, setEmail] = useState('rahul@demo.com');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push('/feed');
    }
  };

  return (
    <div className="bg-bg text-text-primary min-h-screen flex flex-col font-body selection:bg-citizen/30">
      <header className="w-full absolute top-0 z-50">
        <div className="w-full max-w-[1400px] mx-auto px-8 flex justify-between items-center h-24">
          <Link
            href="/"
            className="font-display font-bold text-xl tracking-tight flex items-center gap-4 group focus-visible:ring-2 focus-visible:ring-citizen rounded-xl outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-citizen border border-citizen/50 flex items-center justify-center text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:scale-105 transition-transform">
              <span className="font-display">C</span>
            </div>
            <span className="text-white group-hover:text-citizen transition-colors">
              CommunityOS
            </span>
          </Link>
          <nav className="hidden md:flex gap-10">
            {['Home', 'Platform', 'Security', 'Support'].map((item) => (
              <Link
                key={item}
                className="text-sm font-bold text-text-secondary hover:text-white uppercase tracking-widest transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-citizen rounded outline-none px-1"
                href="/"
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 flex w-full relative overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute inset-0 bg-bg -z-10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] z-0" />
        <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-citizen/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-ai/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

        <div className="flex-1 flex flex-col lg:flex-row max-w-[1400px] mx-auto w-full z-10 relative pt-24 lg:pt-0">
          {/* Left Panel: Auth Form */}
          <div className="w-full lg:w-5/12 flex flex-col justify-center px-8 sm:px-16 py-12 lg:py-0">
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[420px] mx-auto"
            >
              <div className="mb-12">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-layer2 border border-border text-text-secondary rounded-lg text-xs font-bold uppercase tracking-widest mb-8 shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-citizen shadow-[0_0_10px_rgba(37,99,235,0.8)] motion-safe:animate-pulse"></span>
                  Secure Gateway
                </div>
                <h1 className="font-display text-5xl font-bold tracking-tight mb-4 text-white leading-tight">
                  Welcome Back.
                </h1>
                <p className="text-text-secondary text-lg font-light leading-relaxed">
                  Authenticate to access the central nervous system of your city's infrastructure.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-[16px] text-sm font-bold flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label
                    className="text-xs font-bold text-text-tertiary ml-1 block uppercase tracking-widest"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-white transition-colors" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      aria-label="Email Address"
                      aria-invalid={!!error}
                      autoComplete="email"
                      placeholder="citizen@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-layer2 border border-border rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen focus-visible:border-white transition-all text-white font-medium hover:border-white/20 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center ml-1">
                    <label
                      className="text-xs font-bold text-text-tertiary block uppercase tracking-widest"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <Link
                      href="#"
                      className="text-xs text-text-secondary hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-citizen rounded px-1 outline-none font-bold tracking-wide"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-white transition-colors" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      aria-label="Password"
                      aria-invalid={!!error}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-4 bg-layer2 border border-border rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen focus-visible:border-white transition-all text-white font-medium hover:border-white/20 shadow-inner"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-citizen rounded p-1 outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-2 mt-8">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id="remember"
                      aria-label="Remember me for 30 days"
                      className="peer w-5 h-5 appearance-none rounded-[6px] border-2 border-border bg-layer1 checked:bg-white checked:border-white transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-citizen outline-none"
                    />
                    <Check className="w-3.5 h-3.5 absolute pointer-events-none text-bg opacity-0 peer-checked:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold transition-opacity" />
                  </div>
                  <label
                    htmlFor="remember"
                    className="text-sm font-bold text-text-secondary cursor-pointer select-none tracking-wide hover:text-white transition-colors"
                  >
                    Remember me for 30 days
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  aria-disabled={loading}
                  className="w-full py-4 mt-10 bg-white text-bg font-bold rounded-[20px] hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-citizen outline-none disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group text-base tracking-wide"
                >
                  <div className="absolute inset-0 w-full h-full bg-black/5 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Enter Node
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-12 pt-8 border-t border-border text-center">
                <p className="text-sm font-bold text-text-tertiary tracking-wide">
                  New to the network?{' '}
                  <Link
                    href="/login?tab=register"
                    className="text-white hover:text-citizen transition-colors focus-visible:ring-2 focus-visible:ring-citizen rounded px-1 outline-none"
                  >
                    Request Access
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Panel: Value Proposition Showcase */}
          <div className="hidden lg:flex lg:w-7/12 items-center justify-center relative p-8 py-16">
            <motion.div
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.8,
                delay: shouldReduceMotion ? 0 : 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="w-full h-full bg-layer1/80 border border-border rounded-[40px] p-16 flex flex-col justify-between relative overflow-hidden shadow-2xl backdrop-blur-3xl group"
            >
              {/* Dynamic Glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-citizen/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-citizen/20 transition-colors duration-1000" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-ai/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-ai/20 transition-colors duration-1000" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-layer2/80 backdrop-blur-md rounded-xl text-white text-xs font-bold tracking-widest uppercase mb-10 border border-border shadow-inner">
                  <BadgeCheck className="w-4 h-4 text-citizen" />
                  Official Municipal Partner
                </div>
                <h2 className="font-display text-[56px] font-bold text-white leading-[1.1] mb-8 max-w-xl drop-shadow-md tracking-tight">
                  Transforming <br />
                  Local Governance <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-text-tertiary">
                    Together.
                  </span>
                </h2>
                <p className="text-xl text-text-secondary max-w-lg leading-relaxed font-light">
                  Join thousands of citizens actively reporting issues and holding city
                  infrastructure maintenance accountable.
                </p>
              </div>

              {/* Floating Feature Cards */}
              <div className="relative z-10 grid grid-cols-2 gap-8 mt-16">
                <div className="bg-layer2/80 backdrop-blur-xl border border-border rounded-[32px] p-8 hover:-translate-y-2 transition-transform duration-500 cursor-default shadow-lg group/card">
                  <div className="w-14 h-14 bg-ai/10 rounded-2xl flex items-center justify-center mb-6 text-ai border border-ai/20 group-hover/card:bg-ai/20 transition-colors">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-3 tracking-wide">AI Telemetry</h3>
                  <p className="text-text-secondary text-sm leading-relaxed font-light">
                    Smart neural networks instantly route your incident reports to the correct
                    municipal department.
                  </p>
                </div>
                <div className="bg-layer2/80 backdrop-blur-xl border border-border rounded-[32px] p-8 hover:-translate-y-2 transition-transform duration-500 cursor-default translate-y-8 shadow-lg group/card2">
                  <div className="w-14 h-14 bg-resolved/10 rounded-2xl flex items-center justify-center mb-6 text-resolved border border-resolved/20 group-hover/card2:bg-resolved/20 transition-colors">
                    <Globe className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-3 tracking-wide">Live Tracking</h3>
                  <p className="text-text-secondary text-sm leading-relaxed font-light">
                    Monitor the real-time resolution status of infrastructure issues across your
                    entire neighborhood.
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-6 mt-auto pt-20">
                <div className="flex -space-x-4">
                  <div className="w-12 h-12 rounded-full border-4 border-layer1 bg-citizen flex items-center justify-center text-sm font-bold text-white shadow-lg">
                    JD
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-layer1 bg-ai flex items-center justify-center text-sm font-bold text-white shadow-lg">
                    SK
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-layer1 bg-resolved flex items-center justify-center text-sm font-bold text-white shadow-lg">
                    RT
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-layer1 bg-layer2 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                    +2k
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    Active nodes online
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
