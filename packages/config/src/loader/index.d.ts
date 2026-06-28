import { SecretResolver } from '../types';
export declare const defaultResolver: SecretResolver;
/**
 * Standardized env files loading order based on Next.js/twelve-factor conventions:
 * 1. .env.${NODE_ENV}.local (local overrides, ignored)
 * 2. .env.local (local overrides, ignored, not loaded in test mode)
 * 3. .env.${NODE_ENV} (environment-specific settings)
 * 4. .env (defaults)
 */
export declare function loadEnvFiles(workspaceRoot?: string): void;
//# sourceMappingURL=index.d.ts.map