import { LoggerFactory } from '@community-os/logger';

import { env } from '../env';

const isDev = env.NODE_ENV === 'local' || env.NODE_ENV === 'development';
const provider = isDev ? 'console' : 'winston';

export const logger = LoggerFactory.createLogger(provider, 'api', env.NODE_ENV);
