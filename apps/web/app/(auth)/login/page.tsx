'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Building,
  CheckCircle,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  Star,
  User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Suspense, useEffect, useState } from 'react';

import { api } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldReduceMotion = useReducedMotion();

  // Route/Tab Query Param Extraction
  const typeParam = searchParams.get('type') === 'municipality' ? 'municipality' : 'citizen';
  const tabParam = searchParams.get('tab') === 'register' ? 'register' : 'login';

  const [portalType, setPortalType] = useState<'citizen' | 'municipality'>(typeParam);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(tabParam);

  // Sync state if query params change
  useEffect(() => {
    setPortalType(typeParam);
  }, [typeParam]);

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ward, setWard] = useState('');
  const [message, setMessage] = useState('');

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Default login credentials for demo ease
  useEffect(() => {
    if (activeTab === 'login') {
      if (portalType === 'citizen') {
        setEmail('rahul@demo.com');
        setPassword('demo123');
      } else {
        setEmail('');
        setPassword('');
      }
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setWard('');
      setMessage('');
    }
    setError('');
  }, [portalType, activeTab]);

  const handlePortalTypeChange = (type: 'citizen' | 'municipality') => {
    setPortalType(type);
    setError('');
    // Update URL query param cleanly
    const params = new URLSearchParams(window.location.search);
    params.set('type', type);
    router.replace(`/login?${params.toString()}`);
  };

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setError('');
    setRequestSubmitted(false);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    router.replace(`/login?${params.toString()}`);
  };

  const handleLogin = async (e: React.FormEvent) => {
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
      // Middleware handles redirection to /dashboard (municipality) or /feed (citizen)
      // For immediate client redirection assurance:
      if (portalType === 'municipality') {
        router.push('/dashboard');
      } else {
        router.push('/feed');
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (portalType === 'citizen') {
        // Instant Citizen self-registration
        const regRes = await api.post('/api/users/register', {
          name,
          email,
          password,
          ward: ward || undefined,
        });

        if (regRes.data?.success) {
          // Auto login after citizen registration
          const loginRes = await signIn('credentials', {
            redirect: false,
            email,
            password,
          });

          if (loginRes?.error) {
            setError('Registration succeeded, but auto-login failed. Please sign in manually.');
            setActiveTab('login');
          } else {
            router.push('/feed');
          }
        }
      } else {
        // Municipality Access Request submission
        const reqRes = await api.post('/api/users/municipality-request', {
          name,
          email,
          ward,
          message: message || undefined,
        });

        if (reqRes.data?.success) {
          setRequestSubmitted(true);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
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
        <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-citizen/10 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-ai/10 rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="flex-1 flex flex-col lg:flex-row max-w-[1400px] mx-auto w-full z-10 relative pt-28 lg:pt-0">
          {/* Left Panel: Auth Form */}
          <div className="w-full lg:w-5/12 flex flex-col justify-center px-8 sm:px-16 py-12 lg:py-0">
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[420px] mx-auto"
            >
              {/* Portal Segmented Selection */}
              <div className="flex bg-layer2/80 border border-white/5 rounded-2xl p-1 mb-8 shadow-inner backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => handlePortalTypeChange('citizen')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 focus:outline-none ${
                    portalType === 'citizen'
                      ? 'bg-citizen text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => handlePortalTypeChange('municipality')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 focus:outline-none ${
                    portalType === 'municipality'
                      ? 'bg-primary text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  Official
                </button>
              </div>

              {/* Title & Headers */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-layer2 border border-border text-text-secondary rounded-lg text-xs font-bold uppercase tracking-widest mb-6 shadow-inner">
                  <span
                    className={`w-2 h-2 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.8)] motion-safe:animate-pulse ${
                      portalType === 'municipality' ? 'bg-primary' : 'bg-citizen'
                    }`}
                  />
                  {portalType === 'municipality' ? 'Official Gate' : 'Citizen Network'}
                </div>
                <h1 className="font-display text-4xl font-bold tracking-tight mb-3 text-white leading-tight">
                  {portalType === 'municipality' ? 'Municipal Portal' : 'Welcome Back.'}
                </h1>
                <p className="text-text-secondary text-sm font-light leading-relaxed">
                  {portalType === 'municipality'
                    ? 'Authenticate as a verified city representative or department official to manage civic action.'
                    : 'Access the central intelligence system to file reports, check resolutions, and earn repute.'}
                </p>
              </div>

              {/* Error Callout */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-bold flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </motion.div>
              )}

              {/* Form Mode Selection Buttons (Login vs Register/Request Access) */}
              <div className="flex border-b border-border/40 mb-6 gap-6 text-sm font-bold">
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className={`pb-3 relative transition-all ${
                    activeTab === 'login' ? 'text-white' : 'text-text-tertiary hover:text-white'
                  }`}
                >
                  Sign In
                  {activeTab === 'login' && (
                    <motion.div
                      layoutId="tabUnderline"
                      className={`absolute bottom-0 left-0 right-0 h-[2px] ${
                        portalType === 'municipality' ? 'bg-primary' : 'bg-citizen'
                      }`}
                    />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className={`pb-3 relative transition-all ${
                    activeTab === 'register' ? 'text-white' : 'text-text-tertiary hover:text-white'
                  }`}
                >
                  {portalType === 'municipality' ? 'Request Access' : 'Create Account'}
                  {activeTab === 'register' && (
                    <motion.div
                      layoutId="tabUnderline"
                      className={`absolute bottom-0 left-0 right-0 h-[2px] ${
                        portalType === 'municipality' ? 'bg-primary' : 'bg-citizen'
                      }`}
                    />
                  )}
                </button>
              </div>

              {/* Form Content */}
              {requestSubmitted ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-layer2/50 border border-white/5 p-6 rounded-3xl text-center space-y-4 shadow-inner"
                >
                  <div className="w-12 h-12 rounded-full bg-success/20 border border-success/30 flex items-center justify-center mx-auto text-success">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-white font-bold text-lg">Request Logged</h3>
                  <p className="text-text-secondary text-sm leading-relaxed font-light">
                    Your municipality access request has been recorded. Verification keys will be
                    issued manually upon credentials validation.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleTabChange('login')}
                    className="text-xs font-bold text-primary hover:underline uppercase tracking-wider block mx-auto pt-2"
                  >
                    Back to Sign In
                  </button>
                </motion.div>
              ) : activeTab === 'login' ? (
                /* LOGIN FORM */
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <label
                      className="text-[10px] font-bold text-text-tertiary ml-1 block uppercase tracking-widest"
                      htmlFor="email"
                    >
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-white transition-colors" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder={
                          portalType === 'municipality'
                            ? 'official@city.gov'
                            : 'citizen@example.com'
                        }
                        className="w-full pl-11 pr-4 py-3.5 bg-layer2 border border-border rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen transition-all text-white text-sm font-medium hover:border-white/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label
                        className="text-[10px] font-bold text-text-tertiary block uppercase tracking-widest"
                        htmlFor="password"
                      >
                        Password
                      </label>
                    </div>
                    <div className="relative group">
                      <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-white transition-colors" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full pl-11 pr-11 py-3.5 bg-layer2 border border-border rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen transition-all text-white text-sm font-medium hover:border-white/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-white transition-colors focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3.5 mt-6 text-bg font-bold rounded-2xl transition-all active:scale-[0.98] focus:outline-none flex items-center justify-center gap-2 relative overflow-hidden group text-sm tracking-wider shadow-lg bg-white hover:bg-gray-100`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Enter Node
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* SIGNUP / ACCESS REQUEST FORM */
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-tertiary ml-1 block uppercase tracking-widest">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Jane Doe"
                      className="w-full px-4 py-3 bg-layer2 border border-border rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen transition-all text-white text-sm font-medium hover:border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-tertiary ml-1 block uppercase tracking-widest">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder={
                        portalType === 'municipality' ? 'official@city.gov' : 'jane.doe@example.com'
                      }
                      className="w-full px-4 py-3 bg-layer2 border border-border rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen transition-all text-white text-sm font-medium hover:border-white/10"
                    />
                  </div>

                  {portalType === 'citizen' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-text-tertiary ml-1 block uppercase tracking-widest">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="•••••••• (Min 6 chars)"
                        className="w-full px-4 py-3 bg-layer2 border border-border rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen transition-all text-white text-sm font-medium hover:border-white/10"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-tertiary ml-1 block uppercase tracking-widest">
                      {portalType === 'municipality'
                        ? 'Organization / Department / Ward'
                        : 'Assigned Ward (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      required={portalType === 'municipality'}
                      placeholder={
                        portalType === 'municipality' ? 'Department of Sanitation' : 'Ward 12'
                      }
                      className="w-full px-4 py-3 bg-layer2 border border-border rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen transition-all text-white text-sm font-medium hover:border-white/10"
                    />
                  </div>

                  {portalType === 'municipality' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-text-tertiary ml-1 block uppercase tracking-widest">
                        Justification Message (Optional)
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        placeholder="Please state your role and official reason for access..."
                        className="w-full px-4 py-3 bg-layer2 border border-border rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen transition-all text-white text-sm font-medium hover:border-white/10 resize-none"
                      />
                    </div>
                  )}

                  {portalType === 'municipality' && (
                    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-[11px] leading-relaxed text-text-secondary">
                      <span className="font-bold text-white block mb-1">
                        Administrative Restraint Notice
                      </span>
                      Official municipal access is vetted and manually approved by administrators.
                      You will be contacted via your official email address once cleared.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3.5 mt-4 text-bg font-bold rounded-2xl transition-all active:scale-[0.98] focus:outline-none flex items-center justify-center gap-2 relative overflow-hidden group text-sm tracking-wider shadow-lg bg-white hover:bg-gray-100`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {portalType === 'municipality' ? 'Submit Request' : 'Register Account'}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="mt-8 pt-6 border-t border-border/30 text-center">
                <p className="text-xs font-bold text-text-tertiary tracking-wide">
                  By entering this node you agree to comply with regional telemetry guidelines.
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg text-white flex items-center justify-center font-mono">
          LOADING CONTROL NODE...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
