import { IIssueRepository } from '../interfaces/IIssueRepository';
import { INotificationRepository } from '../interfaces/INotificationRepository';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IUserSessionRepository } from '../interfaces/IUserSessionRepository';

export interface RepositoryFactoryOptions {
  engine: 'mongo' | 'mock';
  logger?: any;
  config?: any;
}

export class RepositoryFactory {
  static createUserRepository(options: RepositoryFactoryOptions): IUserRepository {
    if (options.engine === 'mongo') {
      // Use dynamic require to keep interfaces decoupled from concrete implementations
      // and support flexible hot-swapping.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { MongoUserRepository } = require('../mongodb/MongoUserRepository');
      return new MongoUserRepository();
    }
    throw new Error(`Unsupported repository engine: ${options.engine}`);
  }

  static createIssueRepository(options: RepositoryFactoryOptions): IIssueRepository {
    if (options.engine === 'mongo') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { MongoIssueRepository } = require('../mongodb/MongoIssueRepository');
      return new MongoIssueRepository();
    }
    throw new Error(`Unsupported repository engine: ${options.engine}`);
  }

  static createUserSessionRepository(options: RepositoryFactoryOptions): IUserSessionRepository {
    if (options.engine === 'mongo') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { MongoUserSessionRepository } = require('../mongodb/MongoUserSessionRepository');
      return new MongoUserSessionRepository();
    }
    throw new Error(`Unsupported repository engine: ${options.engine}`);
  }

  static createNotificationRepository(options: RepositoryFactoryOptions): INotificationRepository {
    if (options.engine === 'mongo') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { MongoNotificationRepository } = require('../mongodb/MongoNotificationRepository');
      return new MongoNotificationRepository();
    }
    throw new Error(`Unsupported repository engine: ${options.engine}`);
  }
}
