"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSchema = exports.ServerSchema = exports.SharedSchema = void 0;
const zod_1 = require("zod");
// 1. Shared Schema (Used in all contexts)
exports.SharedSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(['local', 'development', 'test', 'staging', 'production'])
        .default('development')
        .describe('The runtime mode of the application (local, development, test, staging, production).'),
});
// 2. Server Schema (Express API, Worker)
exports.ServerSchema = exports.SharedSchema.extend({
    PORT: zod_1.z
        .preprocess((val) => {
        if (val === undefined || val === '')
            return undefined;
        const num = Number(val);
        return isNaN(num) ? val : num;
    }, zod_1.z.number().int().min(1).max(65535))
        .default(5001)
        .describe('Port number the Express API server listens on.'),
    MONGODB_URI: zod_1.z
        .string({
        required_error: 'MONGODB_URI is required for database connection.',
    })
        .min(1, 'MONGODB_URI cannot be empty.')
        .describe('Required. MongoDB connection URI string.'),
    REDIS_URL: zod_1.z
        .string()
        .default('mock')
        .describe('Redis connection URL for BullMQ job queue manager. Set to "mock" to use in-memory queue.'),
    OPENAI_API_KEY: zod_1.z
        .string()
        .default('mock')
        .describe('OpenAI API Key for gpt-4o analysis. Set to "mock" to run with simulated mock responses.'),
    CLOUDINARY_CLOUD_NAME: zod_1.z
        .string()
        .default('mock')
        .describe('Cloudinary cloud name for media upload. Set to "mock" for local mocks.'),
    CLOUDINARY_API_KEY: zod_1.z
        .string()
        .default('mock')
        .describe('Cloudinary API Key for authentication. Set to "mock" for local mocks.'),
    CLOUDINARY_API_SECRET: zod_1.z
        .string()
        .default('mock')
        .describe('Cloudinary API Secret for authentication. Set to "mock" for local mocks.'),
    JWT_SECRET: zod_1.z
        .string()
        .default('change_me_to_random_32_char_string')
        .describe('Secret key used to sign and verify JWT authentication tokens.'),
    CLIENT_URL: zod_1.z
        .string()
        .default('http://localhost:3000')
        .describe('Domain URL of the Next.js client web application (used for CORS mapping).'),
});
// 3. Client Schema (Next.js App)
exports.ClientSchema = exports.SharedSchema.extend({
    NEXT_PUBLIC_API_URL: zod_1.z
        .string()
        .default('http://localhost:5001')
        .describe('Public endpoint URL of the backend API server.'),
    NEXT_PUBLIC_SOCKET_URL: zod_1.z
        .string()
        .default('http://localhost:5001')
        .describe('Public endpoint URL of the WebSockets event socket server.'),
    NEXT_PUBLIC_MAPBOX_TOKEN: zod_1.z
        .string()
        .default('mock')
        .describe('Mapbox public access token for interactive map plots.'),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: zod_1.z
        .string()
        .default('mock')
        .describe('Cloudinary cloud name for client-side direct upload streams.'),
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: zod_1.z
        .string()
        .default('mock')
        .describe('Cloudinary unsigned upload preset identifier.'),
    NEXTAUTH_SECRET: zod_1.z
        .string()
        .default('change_me_to_random_32_char_string')
        .describe('Secret key used to encrypt and sign cookie layers in NextAuth session controls.'),
    AUTH_SECRET: zod_1.z
        .string()
        .default('change_me_to_random_32_char_string')
        .describe('Alternative encryption secret for NextAuth/Auth.js credentials provider.'),
    NEXTAUTH_URL: zod_1.z
        .string()
        .default('http://localhost:3000')
        .describe('Canonical base URL of the frontend web application.'),
    AUTH_TRUST_HOST: zod_1.z
        .preprocess((val) => {
        if (val === 'true' || val === true)
            return true;
        if (val === 'false' || val === false)
            return false;
        return val;
    }, zod_1.z.boolean())
        .default(true)
        .describe('Instructs Auth.js to trust the host header (required in container runtimes).'),
});
