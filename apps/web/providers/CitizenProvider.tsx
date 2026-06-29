'use client';

import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';

import { api } from '@/lib/api';

// --- State Types ---
interface CitizenState {
  profile: any | null;
  insights: any | null;
  loading: boolean;
  error: string | null;
}

type CitizenAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { profile: any; insights: any } }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'UPDATE_PROFILE'; payload: Partial<any> };

// --- Initial State ---
const initialState: CitizenState = {
  profile: null,
  insights: null,
  loading: true,
  error: null,
};

// --- Reducer ---
function citizenReducer(state: CitizenState, action: CitizenAction): CitizenState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, profile: action.payload.profile, insights: action.payload.insights, loading: false };
    case 'FETCH_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };
    default:
      return state;
  }
}

// --- Context ---
const CitizenContext = createContext<{
  state: CitizenState;
  dispatch: React.Dispatch<CitizenAction>;
  refreshProfile: () => void;
} | null>(null);

// --- Provider Component ---
export function CitizenProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [state, dispatch] = useReducer(citizenReducer, initialState);

  const fetchProfile = async () => {
    if (status !== 'authenticated') return;
    dispatch({ type: 'FETCH_START' });
    try {
      const [profileRes, insightsRes] = await Promise.all([
        api.get('/api/users/dashboard'),
        api.get('/api/users/me/insights').catch(() => ({ data: { data: null } }))
      ]);
      dispatch({ 
        type: 'FETCH_SUCCESS', 
        payload: { 
          profile: profileRes.data.data, 
          insights: insightsRes.data.data 
        } 
      });
    } catch (err: any) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message || 'Failed to fetch profile' });
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile();
    } else if (status === 'unauthenticated') {
      dispatch({ type: 'FETCH_ERROR', payload: 'Not authenticated' });
    }
  }, [status]);

  return (
    <CitizenContext.Provider value={{ state, dispatch, refreshProfile: fetchProfile }}>
      {children}
    </CitizenContext.Provider>
  );
}

// --- Hook ---
export function useCitizen() {
  const context = useContext(CitizenContext);
  if (!context) {
    throw new Error('useCitizen must be used within a CitizenProvider');
  }
  return context;
}
