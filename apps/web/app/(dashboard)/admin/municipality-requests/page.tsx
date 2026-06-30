'use client';

import {
  AlertTriangle,
  Building,
  CheckCircle,
  Copy,
  History,
  Inbox,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { api } from '@/lib/api';

interface AccessRequest {
  id: string;
  name: string;
  email: string;
  ward: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export default function MunicipalityRequestsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<'pending' | 'history'>('pending');

  // Approval result display
  const [approvedRequest, setApprovedRequest] = useState<AccessRequest | null>(null);
  const [setupToken, setSetupToken] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/users/municipality-requests');
      if (res.data?.success) {
        setRequests(res.data.data);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || err.message || 'Failed to fetch access requests.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === 'authenticated' && session?.user?.role === 'admin') {
      fetchRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus]);

  const handleApprove = async (id: string) => {
    setError('');
    setActionLoadingId(id);
    setApprovedRequest(null);
    setSetupToken('');
    setCopied(false);

    try {
      const res = await api.post(`/api/users/municipality-requests/${id}/approve`);
      if (res.data?.success) {
        const { setupToken: token } = res.data.data;
        setSetupToken(token);
        const req = requests.find((r) => r.id === id) || null;
        setApprovedRequest(req);

        // Refresh local requests list
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)));
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to approve request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const copySetupLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const link = `${origin}/setup-account?token=${setupToken}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (sessionStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-text-secondary font-mono">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        LOADING CONTROL CLEARANCE...
      </div>
    );
  }

  // Gate page to administrators only
  if (sessionStatus !== 'authenticated' || session?.user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-layer1/80 border border-white/5 rounded-3xl backdrop-blur-xl">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Clearance Level Insufficient</h2>
        <p className="text-text-secondary text-sm max-w-md leading-relaxed font-light">
          This administration dashboard is restricted to validated administrators. Your user profile
          does not possess matching credentials.
        </p>
      </div>
    );
  }

  // Filter requests
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const historyRequests = requests.filter((r) => r.status !== 'pending');
  const displayedRequests = activeFilter === 'pending' ? pendingRequests : historyRequests;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Upper Dashboard Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Building className="w-8 h-8 text-primary" />
            Municipality Access Control
          </h1>
          <p className="text-text-secondary text-sm font-light mt-1">
            Vet, approve, or log municipality access keys to clear city department officials.
          </p>
        </div>
        <div className="flex bg-layer2 border border-white/5 rounded-xl p-1 shadow-inner">
          <button
            onClick={() => setActiveFilter('pending')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all focus:outline-none ${
              activeFilter === 'pending'
                ? 'bg-primary text-white shadow-md'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Pending ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveFilter('history')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all focus:outline-none ${
              activeFilter === 'history'
                ? 'bg-layer3 text-white'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            History ({historyRequests.length})
          </button>
        </div>
      </div>

      {/* Setup Key Display Card post-approval */}
      {approvedRequest && setupToken && (
        <div className="p-6 bg-success/10 border border-success/20 rounded-2xl space-y-4 animate-fadeIn">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-success/20 border border-success/30 flex items-center justify-center text-success shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-white font-bold text-base">
                Access Request Approved Successfully
              </h3>
              <p className="text-text-secondary text-sm font-light leading-relaxed">
                Clearance credentials successfully generated for{' '}
                <strong className="text-white">{approvedRequest.name}</strong> (
                {approvedRequest.email}).
              </p>
            </div>
          </div>
          <div className="bg-layer2/80 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="font-mono text-xs text-success-light break-all select-all flex-1">
              Token: <span className="font-bold">{setupToken}</span>
            </div>
            <button
              onClick={copySetupLink}
              className="flex items-center gap-2 px-4 py-2 bg-white text-bg hover:bg-gray-100 rounded-lg text-xs font-bold transition-all shrink-0 focus:outline-none"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? 'Link Copied!' : 'Copy Portal Link'}
            </button>
          </div>
          <p className="text-[11px] text-text-tertiary">
            * Note: Share the portal link with the official. They can complete configuration by
            accessing the Portal with their official email address.
          </p>
        </div>
      )}

      {/* Error Output */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-bold flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Requests Listing */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 font-mono text-text-tertiary">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          SYNCHRONIZING ACCESS LOGS...
        </div>
      ) : displayedRequests.length === 0 ? (
        <div className="text-center py-20 bg-layer1/50 border border-white/5 rounded-3xl p-12">
          <Inbox className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg mb-1">No requests found</h3>
          <p className="text-text-secondary text-sm font-light">
            No access requests match the selected filters at this time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedRequests.map((req) => (
            <div
              key={req.id}
              className="bg-layer1/80 border border-white/5 hover:border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden backdrop-blur-xl group transition-all"
            >
              <div className="space-y-4">
                {/* Meta details */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base leading-tight tracking-tight">
                        {req.name}
                      </h4>
                      <p className="text-text-secondary text-xs font-light mt-0.5 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {req.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      req.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : req.status === 'approved'
                          ? 'bg-success/10 text-success border border-success/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="space-y-2 pt-2 text-sm text-text-secondary font-light">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-text-tertiary shrink-0" />
                    <span>
                      Ward / Department: <strong className="text-white">{req.ward}</strong>
                    </span>
                  </div>
                  {req.message && (
                    <div className="flex items-start gap-2 bg-layer2/40 p-3 rounded-xl border border-white/5 mt-2">
                      <MessageSquare className="w-4 h-4 text-text-tertiary shrink-0 mt-0.5" />
                      <p className="text-xs italic leading-relaxed text-text-secondary select-all">
                        &ldquo;{req.message}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <span className="text-[11px] text-text-tertiary font-mono">
                  Requested {new Date(req.createdAt).toLocaleDateString()}
                </span>

                {req.status === 'pending' && (
                  <button
                    onClick={() => handleApprove(req.id)}
                    disabled={actionLoadingId !== null}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-bg hover:bg-gray-100 disabled:opacity-50 rounded-xl text-xs font-bold transition-all focus:outline-none"
                  >
                    {actionLoadingId === req.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Approve Request
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
