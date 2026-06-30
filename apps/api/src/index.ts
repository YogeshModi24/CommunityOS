import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';

import { env } from './env'; // validates all env vars at startup — must be first
import { container } from './infra/container';
import { registerEventHandlers } from './infra/events/eventHandlers';
import { connectDB } from './lib/db';
import { logger } from './lib/logger';
import { correlationIdMiddleware } from './middleware/correlationId';
import { errorHandler } from './middleware/error';
import { requestLogger } from './middleware/requestLogger';
import aiRoutes from './routes/ai';
import issueRoutes from './routes/issues';
import notificationRoutes from './routes/notifications';
import userRoutes from './routes/users';

const app = express();

app.set('trust proxy', true);
app.disable('x-powered-by');

app.use(correlationIdMiddleware);
app.use(requestLogger);
app.use(
  helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
    hsts: env.NODE_ENV === 'production',
  })
);
app.use(cookieParser());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Routes
app.use('/api/issues', issueRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

import Redis from 'ioredis';
import mongoose from 'mongoose';

const healthRedisClient = new Redis(env.REDIS_URL, { lazyConnect: true });
let isRedisConnecting = false;
async function checkRedis() {
  if (env.REDIS_URL === 'mock' || env.REDIS_URL.includes('change_me')) return true;
  if ((healthRedisClient.status as string) === 'ready') return true;
  if (!isRedisConnecting) {
    isRedisConnecting = true;
    try {
      await healthRedisClient.connect();
    } catch {
      // ignore
    }
  }
  return (healthRedisClient.status as string) === 'ready';
}

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'community-os-api',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/ready', async (_req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const isDbConnected = dbState === 1;
    const isRedisConnected = await checkRedis();

    if (isDbConnected && isRedisConnected) {
      res.status(200).json({
        status: 'ready',
        mongodb: 'connected',
        redis: 'connected',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'not_ready',
        mongodb: isDbConnected ? 'connected' : 'disconnected',
        redis: isRedisConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    res.status(503).json({ status: 'error', error: String(error) });
  }
});
app.use(errorHandler);

// Export io as singleton
export let io: Server;

async function main(): Promise<void> {
  const httpServer = createServer(app);

  httpServer.listen(env.PORT as number, '0.0.0.0', () => {
    logger.info(`[Server] Running on port ${env.PORT}`, {
      event: 'server_started',
      port: env.PORT,
      clientUrl: env.CLIENT_URL,
    });
  });

  // Connect to MongoDB
  await connectDB();

  // BullMQ manages its own Redis connection via URL string
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Dynamically allow any origin to connect, preventing CORS mismatch in preview or multiple domains
        callback(null, true);
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const authHeader = socket.handshake.auth?.token || socket.handshake.headers['authorization'];
      let token = '';

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else if (socket.handshake.headers.cookie) {
        // Fallback to cookie
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const cookies = require('cookie').parse(socket.handshake.headers.cookie);
        token = cookies['community_os_token'] || ''; // adjust based on actual cookie name if different, NextAuth uses next-auth.session-token
      }

      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        sub: string;
        role: string;
        department?: string;
      };
      socket.data.user = { id: decoded.sub, role: decoded.role, department: decoded.department };
      next();
    } catch {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    logger.info(
      `[Socket.io] Client connected: ${socket.id} (User: ${user.id}, Role: ${user.role})`,
      { event: 'socket_connected' }
    );

    // Join Role-based Rooms
    socket.join(`User:${user.id}`);

    if (user.role === 'citizen') {
      socket.join('Citizens');
    } else if (user.role === 'municipality' || user.role === 'authority' || user.role === 'admin') {
      socket.join('Municipality');
      if (user.department) {
        socket.join(`Department:${user.department}`);
      }
    }

    socket.on('disconnect', () => {
      logger.info(`[Socket.io] Client disconnected: ${socket.id}`, {
        event: 'socket_disconnected',
      });
    });
  });

  // Register event listeners (persistent notifications & socket broadcasts)
  const eventBus = container.resolve<any>('eventBus');
  registerEventHandlers(eventBus, io, container);
}

main().catch((err) => {
  logger.fatal('[Server] Fatal startup error', err, { event: 'server_fatal_startup' });
  process.exit(1);
});
