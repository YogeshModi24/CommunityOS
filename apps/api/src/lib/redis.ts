import { env } from '../env';

// Export the raw URL for BullMQ Queue/Worker connection options.
// BullMQ bundles its own ioredis — passing the URL string avoids
// the type conflict between BullMQ's bundled ioredis and a standalone instance.
export const REDIS_URL: string = env.REDIS_URL;

// Re-export for convenience in index.ts health checks
export const redisConfig = { connection: { url: env.REDIS_URL } };
