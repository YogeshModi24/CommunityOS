import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:5001';

let socket: Socket | null = null;

export function getSocket(token?: string): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: token ? { token } : undefined,
    });

    socket.on('connect', () => {
      // eslint-disable-next-line no-console
      console.error('[Socket.io] Connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.error('[Socket.io] Disconnected');
    });

    socket.on('connect_error', (err) => {
      // eslint-disable-next-line no-console
      console.error('[Socket.io] Connection error:', err.message);
    });
  }
  return socket;
}
