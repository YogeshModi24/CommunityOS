import mongoose from 'mongoose';

import { env } from '../env';
import { logger } from './logger';

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  const MAX_RETRIES = 5;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnected = true;
      logger.info('[DB] Connected to MongoDB', { event: 'db_connected' });

      // Programmatic index verification
      try {
        // Trigger model creation if not loaded
        await import('@community-os/repositories');
        const IssueModel = mongoose.model('Issue');
        await IssueModel.ensureIndexes();
        if (mongoose.connection.db) {
          const dbIndexes = await mongoose.connection.db.collection('issues').indexes();
          logger.info('[DB] Mongoose indexes verified successfully', {
            event: 'db_indexes_verified',
            verifiedIndexes: dbIndexes.map((idx) => Object.keys(idx.key).join(', ')),
          });
        }
      } catch (idxErr: any) {
        logger.error('[DB] Mongoose index verification failed', idxErr, {
          event: 'db_index_verification_failed',
        });
      }

      return;
    } catch (err) {
      attempt++;
      logger.error(`[DB] Connection attempt ${attempt} failed`, err, {
        event: 'db_connection_failed',
        attempt,
      });
      if (attempt >= MAX_RETRIES) throw err;
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.warn('[DB] Disconnected from MongoDB', { event: 'db_disconnected' });
});
