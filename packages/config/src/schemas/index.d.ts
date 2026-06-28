import { z } from 'zod';
export declare const SharedSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["local", "development", "test", "staging", "production"]>>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "test" | "local" | "staging" | "production";
}, {
    NODE_ENV?: "development" | "test" | "local" | "staging" | "production" | undefined;
}>;
export declare const ServerSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["local", "development", "test", "staging", "production"]>>;
} & {
    PORT: z.ZodDefault<z.ZodEffects<z.ZodNumber, number, unknown>>;
    MONGODB_URI: z.ZodString;
    REDIS_URL: z.ZodDefault<z.ZodString>;
    OPENAI_API_KEY: z.ZodDefault<z.ZodString>;
    CLOUDINARY_CLOUD_NAME: z.ZodDefault<z.ZodString>;
    CLOUDINARY_API_KEY: z.ZodDefault<z.ZodString>;
    CLOUDINARY_API_SECRET: z.ZodDefault<z.ZodString>;
    JWT_SECRET: z.ZodDefault<z.ZodString>;
    CLIENT_URL: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "test" | "local" | "staging" | "production";
    PORT: number;
    MONGODB_URI: string;
    REDIS_URL: string;
    OPENAI_API_KEY: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
    JWT_SECRET: string;
    CLIENT_URL: string;
}, {
    MONGODB_URI: string;
    NODE_ENV?: "development" | "test" | "local" | "staging" | "production" | undefined;
    PORT?: unknown;
    REDIS_URL?: string | undefined;
    OPENAI_API_KEY?: string | undefined;
    CLOUDINARY_CLOUD_NAME?: string | undefined;
    CLOUDINARY_API_KEY?: string | undefined;
    CLOUDINARY_API_SECRET?: string | undefined;
    JWT_SECRET?: string | undefined;
    CLIENT_URL?: string | undefined;
}>;
export declare const ClientSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["local", "development", "test", "staging", "production"]>>;
} & {
    NEXT_PUBLIC_API_URL: z.ZodDefault<z.ZodString>;
    NEXT_PUBLIC_SOCKET_URL: z.ZodDefault<z.ZodString>;
    NEXT_PUBLIC_MAPBOX_TOKEN: z.ZodDefault<z.ZodString>;
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.ZodDefault<z.ZodString>;
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.ZodDefault<z.ZodString>;
    NEXTAUTH_SECRET: z.ZodDefault<z.ZodString>;
    AUTH_SECRET: z.ZodDefault<z.ZodString>;
    NEXTAUTH_URL: z.ZodDefault<z.ZodString>;
    AUTH_TRUST_HOST: z.ZodDefault<z.ZodEffects<z.ZodBoolean, boolean, unknown>>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "test" | "local" | "staging" | "production";
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_SOCKET_URL: string;
    NEXT_PUBLIC_MAPBOX_TOKEN: string;
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string;
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: string;
    NEXTAUTH_SECRET: string;
    AUTH_SECRET: string;
    NEXTAUTH_URL: string;
    AUTH_TRUST_HOST: boolean;
}, {
    NODE_ENV?: "development" | "test" | "local" | "staging" | "production" | undefined;
    NEXT_PUBLIC_API_URL?: string | undefined;
    NEXT_PUBLIC_SOCKET_URL?: string | undefined;
    NEXT_PUBLIC_MAPBOX_TOKEN?: string | undefined;
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?: string | undefined;
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?: string | undefined;
    NEXTAUTH_SECRET?: string | undefined;
    AUTH_SECRET?: string | undefined;
    NEXTAUTH_URL?: string | undefined;
    AUTH_TRUST_HOST?: unknown;
}>;
//# sourceMappingURL=index.d.ts.map