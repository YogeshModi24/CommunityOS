'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';

import { getSocket } from '@/lib/socket';

export function useSocket(events: Record<string, (...args: any[]) => void>): { socket: Socket | null, isConnected: boolean } {
  const { data: session } = useSession();
  const token = (session as any)?.token;
  
  const socket = token ? getSocket(token) : null;
  const eventsRef = useRef(events);
  eventsRef.current = events;
  const [isConnected, setIsConnected] = useState(socket?.connected || false);
  const disconnectTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!socket) return;
    
    const onConnect = () => {
      setIsConnected(true);
      // If we were disconnected for more than 5 seconds, trigger a global resync
      if (disconnectTimeRef.current && Date.now() - disconnectTimeRef.current > 5000) {
        window.dispatchEvent(new CustomEvent('socket:resync'));
      }
      disconnectTimeRef.current = null;
    };
    const onDisconnect = () => {
      setIsConnected(false);
      disconnectTimeRef.current = Date.now();
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    setIsConnected(socket.connected);

    const handlers = eventsRef.current;
    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [socket]);

  return { socket, isConnected };
}
