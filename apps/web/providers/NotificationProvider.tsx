'use client';

import { useSession } from 'next-auth/react';
import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';

import { useSocket } from '@/hooks/useSocket';
import { api } from '@/lib/api';

// --- State Types ---
interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  isCenterOpen: boolean;
}

type NotificationAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { notifications: Notification[]; unreadCount: number } }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'NEW_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'SET_CENTER_OPEN'; payload: boolean };

// --- Initial State ---
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: true,
  error: null,
  isCenterOpen: false,
};

// --- Reducer ---
function notificationReducer(
  state: NotificationState,
  action: NotificationAction
): NotificationState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        notifications: action.payload.notifications,
        unreadCount: action.payload.unreadCount,
        loading: false,
      };
    case 'FETCH_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'NEW_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      };
    case 'SET_CENTER_OPEN':
      return {
        ...state,
        isCenterOpen: action.payload,
      };
    default:
      return state;
  }
}

// --- Context ---
const NotificationContext = createContext<{
  state: NotificationState;
  dispatch: React.Dispatch<NotificationAction>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
} | null>(null);

// --- Provider Component ---
export function NotificationProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const fetchNotifications = async () => {
    if (status !== 'authenticated') return;
    dispatch({ type: 'FETCH_START' });
    try {
      const res = await api.get('/api/notifications');
      const unreadRes = await api.get('/api/notifications/unread-count');
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: {
          notifications: res.data.data || [],
          unreadCount: unreadRes.data.data?.count || 0,
        },
      });
    } catch (err: any) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message || 'Failed to fetch notifications' });
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotifications();
    }
  }, [status]);

  useSocket({
    'notification.created.v1': (payload: any) => {
      dispatch({
        type: 'NEW_NOTIFICATION',
        payload: {
          id: payload.notificationId,
          title: payload.title,
          message: payload.message,
          read: false,
          type: payload.type,
          createdAt: new Date().toISOString(),
        },
      });
    },
  });

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      dispatch({ type: 'MARK_READ', payload: id });
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/api/notifications/read-all');
      dispatch({ type: 'MARK_ALL_READ' });
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  };

  return (
    <NotificationContext.Provider value={{ state, dispatch, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

// --- Hook ---
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
