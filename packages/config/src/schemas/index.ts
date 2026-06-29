import { z } from 'zod';

// 1. Shared Schema (Used in all contexts)
export const SharedSchema = z.object({
  NODE_ENV: z
    .enum(['local', 'development', 'test', 'staging', 'production'])
    .default('development')
    .describe(
      'The runtime mode of the application (local, development, test, staging, production).'
    ),
});

// 2. Server Schema (Express API, Worker)
export const ServerSchema = SharedSchema.extend({
  PORT: z
    .preprocess((val) => {
      if (val === undefined || val === '') return undefined;
      const num = Number(val);
      return isNaN(num) ? val : num;
    }, z.number().int().min(1).max(65535))
    .describe('Port number the Express API server listens on.'),
  MONGODB_URI: z
    .string({
      required_error: 'MONGODB_URI is required for database connection.',
    })
    .min(1, 'MONGODB_URI cannot be empty.')
    .default('mock')
    .describe('Required. MongoDB connection URI string.'),
  REDIS_URL: z
    .string()
    .default('mock')
    .describe(
      'Redis connection URL for BullMQ job queue manager. Set to "mock" to use in-memory queue.'
    ),
  OPENAI_API_KEY: z
    .string()
    .default('mock')
    .describe(
      'OpenAI API Key for gpt-4o analysis. Set to "mock" to run with simulated mock responses.'
    ),
  CLOUDINARY_CLOUD_NAME: z
    .string()
    .default('mock')
    .describe('Cloudinary cloud name for media upload. Set to "mock" for local mocks.'),
  CLOUDINARY_API_KEY: z
    .string()
    .default('mock')
    .describe('Cloudinary API Key for authentication. Set to "mock" for local mocks.'),
  CLOUDINARY_API_SECRET: z
    .string()
    .default('mock')
    .describe('Cloudinary API Secret for authentication. Set to "mock" for local mocks.'),
  JWT_SECRET: z
    .string()
    .default('change_me_to_random_32_char_string')
    .describe('Secret key used to sign and verify JWT authentication tokens.'),
  CLIENT_URL: z
    .string()
    .default('https://community-os-web-seven.vercel.app')
    .describe('Domain URL of the Next.js client web application (used for CORS mapping).'),
});

// 3. Client Schema (Next.js App)
export const ClientSchema = SharedSchema.extend({
  NEXT_PUBLIC_API_URL: z.string().describe('Public endpoint URL of the backend API server.'),
  NEXT_PUBLIC_SOCKET_URL: z
    .string()
    .describe('Public endpoint URL of the WebSockets event socket server.'),
  NEXT_PUBLIC_MAPBOX_TOKEN: z
    .string()
    .default('mock')
    .describe('Mapbox public access token for interactive map plots.'),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z
    .string()
    .default('mock')
    .describe('Cloudinary cloud name for client-side direct upload streams.'),
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z
    .string()
    .default('mock')
    .describe('Cloudinary unsigned upload preset identifier.'),
  NEXTAUTH_SECRET: z
    .string()
    .default('change_me_to_random_32_char_string')
    .describe('Secret key used to encrypt and sign cookie layers in NextAuth session controls.'),
  AUTH_SECRET: z
    .string()
    .default('change_me_to_random_32_char_string')
    .describe('Alternative encryption secret for NextAuth/Auth.js credentials provider.'),
  NEXTAUTH_URL: z.string().describe('Canonical base URL of the frontend web application.'),
  AUTH_TRUST_HOST: z
    .preprocess((val) => {
      if (val === 'true' || val === true) return true;
      if (val === 'false' || val === false) return false;
      return val;
    }, z.boolean())
    .default(true)
    .describe('Instructs Auth.js to trust the host header (required in container runtimes).'),
});
