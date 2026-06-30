'use client';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';

import { api } from '@/lib/api';

function SetupAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Verification State
  const [verifying, setVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState('');
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);

  // Form Fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setVerificationError('Clearance token is missing from the URL.');
        setVerifying(false);
        return;
      }

      try {
        const response = await api.get(`/api/users/setup-account?token=${token}`);
        if (response.data?.success) {
          setUserData(response.data.data);
        } else {
          setVerificationError('Invalid setup token or server error.');
        }
      } catch (err: any) {
        setVerificationError(
          err.response?.data?.message ||
            'Token verification failed. It may be expired or already used.'
        );
      } finally {
        setVerifying(false);
      }
    }

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post('/api/users/setup-account', {
        token,
        password,
      });

      if (response.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login?type=municipality&setup_success=true');
        }, 2000);
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to activate account.');
    } finally {
      setSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-text-secondary font-mono">
        <Loader2 className="w-8 h-8 animate-spin text-citizen mb-4" />
        VALIDATING CLEARANCE TOKEN...
      </div>
    );
  }

  if (verificationError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-layer1 border border-danger/20 rounded-[32px] p-8 lg:p-12 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-danger" />
        <div className="flex items-center gap-3 text-danger mb-6">
          <AlertCircle className="w-8 h-8 shrink-0" />
          <h2 className="font-display font-bold text-lg uppercase tracking-wider text-white">
            Access Denied
          </h2>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed mb-8">{verificationError}</p>
        <Link href="/">
          <button className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 active:scale-95 transition-all text-sm uppercase tracking-wider">
            Return to Landing Page
          </button>
        </Link>
      </motion.div>
    );
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-layer1 border border-success/20 rounded-[32px] p-8 lg:p-12 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-success" />
        <div className="flex items-center gap-3 text-success mb-6">
          <CheckCircle className="w-8 h-8 shrink-0 animate-[bounce_1s_ease-in-out]" />
          <h2 className="font-display font-bold text-lg uppercase tracking-wider text-white">
            Account Activated
          </h2>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed mb-6">
          Your credentials have been successfully updated. Secure clearance established.
        </p>
        <div className="flex items-center gap-2 text-xs font-mono text-text-tertiary">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-success" />
          REDIRECTING TO LOGIN PORTAL...
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-layer1 border border-white/10 rounded-[32px] p-8 lg:p-12 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-citizen" />

      <div className="flex items-center gap-3 text-citizen mb-8">
        <ShieldCheck className="w-8 h-8 shrink-0" />
        <div>
          <h2 className="font-display font-bold text-lg uppercase tracking-wider text-white">
            Activate Official Account
          </h2>
          <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest block mt-0.5">
            Security Level: Municipality
          </span>
        </div>
      </div>

      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-6 text-xs text-text-secondary space-y-2">
        <div className="flex justify-between">
          <span className="text-text-tertiary uppercase tracking-wider">Official:</span>
          <span className="font-semibold text-white">{userData?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-tertiary uppercase tracking-wider">Email:</span>
          <span className="font-semibold text-white">{userData?.email}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {formError && (
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl text-xs text-danger font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-tertiary ml-1 block uppercase tracking-widest">
            New Password
          </label>
          <div className="relative group">
            <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-white transition-colors" />
            <input
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
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-tertiary ml-1 block uppercase tracking-widest">
            Confirm Password
          </label>
          <div className="relative group">
            <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-white transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full pl-11 pr-11 py-3.5 bg-layer2 border border-border rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-citizen transition-all text-white text-sm font-medium hover:border-white/10"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 mt-6 text-bg font-bold rounded-2xl transition-all active:scale-[0.98] focus:outline-none flex items-center justify-center gap-2 relative overflow-hidden group text-sm tracking-wider shadow-lg bg-white hover:bg-gray-100"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Establishing clearance...
            </>
          ) : (
            <>
              Activate Account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}

export default function SetupAccountPage() {
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
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-24 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-text-secondary font-mono">
              <Loader2 className="w-8 h-8 animate-spin text-citizen mb-4" />
              LOADING COMPONENT...
            </div>
          }
        >
          <SetupAccountForm />
        </Suspense>
      </main>
    </div>
  );
}
