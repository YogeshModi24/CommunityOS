import {
  ConfigurationValidationError,
  loadEnvFiles,
  validateServerEnv,
} from '@community-os/config';
import path from 'path';

let validatedEnv: ReturnType<typeof validateServerEnv>;

try {
  // Load env files from apps/api root directory
  loadEnvFiles(path.resolve(__dirname, '..'));
  validatedEnv = validateServerEnv();
} catch (error) {
  if (error instanceof ConfigurationValidationError) {
    console.error(error.message);
  } else {
    console.error('[STARTUP ERROR] Fatal error loading configuration:', error);
  }
  process.exit(1);
}

export const env = validatedEnv;
