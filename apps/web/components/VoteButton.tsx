'use client';

import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { api } from '@/lib/api';

interface VoteButtonProps {
  issueId: string;
  initialVotes: number;
  voterIds?: string[];
  size?: 'sm' | 'lg';
}

export function VoteButton({
  issueId,
  initialVotes,
  voterIds = [],
  size: _size = 'sm',
}: VoteButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [votes, setVotes] = useState(initialVotes);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentUserId = (session as any)?.user?.id;

  useEffect(() => {
    setVotes(initialVotes);
  }, [initialVotes]);

  useEffect(() => {
    if (currentUserId && voterIds) {
      setVoted(voterIds.includes(currentUserId));
    }
  }, [currentUserId, voterIds]);

  async function handleVote(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (status !== 'authenticated' || !session) {
      router.push('/login');
      return;
    }

    const prevVotes = votes;
    const prevVoted = voted;
    setVoted(!voted);
    setVotes((v) => (voted ? v - 1 : v + 1));
    setLoading(true);

    try {
      await api.post(`/api/issues/${issueId}/vote`);
    } catch {
      setVoted(prevVoted);
      setVotes(prevVotes);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      id={`vote-btn-${issueId}`}
      onClick={handleVote}
      disabled={loading}
      className={clsx(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all group/vote',
        voted
          ? 'text-primary bg-primary/5'
          : 'text-on-surface-variant hover:bg-primary/5 hover:text-primary',
        loading && 'opacity-70 cursor-not-allowed'
      )}
    >
      {loading ? (
        <Loader2 className="animate-spin w-5 h-5" />
      ) : (
        <span
          className="material-symbols-outlined text-[20px] group-active/vote:scale-125 transition-transform"
          style={voted ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          thumb_up
        </span>
      )}
      <span className="font-label-md">{votes}</span>
    </button>
  );
}
