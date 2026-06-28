import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { SecretResolver } from '../types';

// Default resolver reads directly from process.env
export const defaultResolver: SecretResolver = (key) => process.env[key];

/**
 * Standardized env files loading order based on Next.js/twelve-factor conventions:
 * 1. .env.${NODE_ENV}.local (local overrides, ignored)
 * 2. .env.local (local overrides, ignored, not loaded in test mode)
 * 3. .env.${NODE_ENV} (environment-specific settings)
 * 4. .env (defaults)
 */
export function loadEnvFiles(workspaceRoot: string = process.cwd()): void {
  const mode = process.env.NODE_ENV || 'development';

  const envFiles = [
    `.env.${mode}.local`,
    mode !== 'test' ? '.env.local' : null,
    `.env.${mode}`,
    '.env',
  ].filter(Boolean) as string[];

  for (const file of envFiles) {
    const filePath = path.resolve(workspaceRoot, file);
    if (fs.existsSync(filePath)) {
      // dotenv.config only sets variables that are not already set
      dotenv.config({ path: filePath });
    }
  }
}
