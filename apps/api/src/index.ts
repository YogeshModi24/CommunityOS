import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { env } from './env'; // validates all env vars at startup — must be first
import { container } from './infra/container';
import { registerEventHandlers } from './infra/events/eventHandlers';
import { connectDB } from './lib/db';
import { logger } from './lib/logger';
import { correlationIdMiddleware } from './middleware/correlationId';
import { errorHandler } from './middleware/error';
import { requestLogger } from './middleware/requestLogger';
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

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use(errorHandler);

// Export io as singleton
export let io: Server;

async function main(): Promise<void> {
  // Connect to MongoDB
  await connectDB();

  // BullMQ manages its own Redis connection via URL string
  const httpServer = createServer(app);

  // Initialize Socket.io
  io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, methods: ['GET', 'POST'], credentials: true },
  });

  io.on('connection', (socket) => {
    logger.info(`[Socket.io] Client connected: ${socket.id}`, { event: 'socket_connected' });
    socket.on('join', (data: { userId: string }) => {
      if (data?.userId) {
        socket.join(`user:${data.userId}`);
        logger.info(`[Socket.io] User ${data.userId} joined room user:${data.userId}`);
      }
    });
    socket.on('disconnect', () => {
      logger.info(`[Socket.io] Client disconnected: ${socket.id}`, {
        event: 'socket_disconnected',
      });
    });
  });

  // Register event listeners (persistent notifications & socket broadcasts)
  const eventBus = container.resolve<any>('eventBus');
  registerEventHandlers(eventBus, io, container);

  httpServer.listen(env.PORT, () => {
    logger.info(`[Server] Running on port ${env.PORT}`, {
      event: 'server_started',
      port: env.PORT,
      clientUrl: env.CLIENT_URL,
    });
  });
}

main().catch((err) => {
  logger.fatal('[Server] Fatal startup error', err, { event: 'server_fatal_startup' });
  process.exit(1);
});
