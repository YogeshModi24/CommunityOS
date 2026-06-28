'use client';

import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';

import { getSocket } from '@/lib/socket';

export function useSocket(events: Record<string, (...args: any[]) => void>): Socket {
  const socket = getSocket();
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    const handlers = eventsRef.current;
    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [socket]);

  return socket;
}
