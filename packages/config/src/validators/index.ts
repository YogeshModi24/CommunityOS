import { z } from 'zod';

import { ConfigurationValidationError, ValidationErrorDetail } from '../errors';
import { defaultResolver } from '../loader';
import { ClientSchema, ServerSchema } from '../schemas';
import { ClientConfig, SecretResolver, ServerConfig } from '../types';

function resolveAndValidate<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  context: 'Server' | 'Client',
  resolver: SecretResolver = defaultResolver
): Record<string, unknown> {
  const rawObj: Record<string, unknown> = {};
  for (const key of Object.keys(schema.shape)) {
    rawObj[key] = resolver(key);
  }

  const result = schema.safeParse(rawObj);
  if (!result.success) {
    const details: ValidationErrorDetail[] = result.error.issues.map((issue) => {
      const key = String(issue.path[0]);
      // Avoid exposing any potential secrets in error details
      const expected = 'expected' in issue ? String(issue.expected) : 'Valid type';
      const received = 'received' in issue ? String(issue.received) : 'Invalid format';

      return {
        key,
        expected,
        received,
        message: issue.message,
      };
    });
    throw new ConfigurationValidationError(details, context);
  }

  // Freeze the configuration object to enforce immutability
  return Object.freeze(result.data);
}

export function validateServerEnv(resolver: SecretResolver = defaultResolver): ServerConfig {
  return resolveAndValidate(ServerSchema, 'Server', resolver) as ServerConfig;
}

export function validateClientEnv(resolver: SecretResolver = defaultResolver): ClientConfig {
  return resolveAndValidate(ClientSchema, 'Client', resolver) as ClientConfig;
}
