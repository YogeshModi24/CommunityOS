"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryFactory = void 0;
class RepositoryFactory {
    static createUserRepository(options) {
        if (options.engine === 'mongo') {
            // Use dynamic require to keep interfaces decoupled from concrete implementations
            // and support flexible hot-swapping.
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { MongoUserRepository } = require('../mongodb/MongoUserRepository');
            return new MongoUserRepository();
        }
        throw new Error(`Unsupported repository engine: ${options.engine}`);
    }
    static createIssueRepository(options) {
        if (options.engine === 'mongo') {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { MongoIssueRepository } = require('../mongodb/MongoIssueRepository');
            return new MongoIssueRepository();
        }
        throw new Error(`Unsupported repository engine: ${options.engine}`);
    }
    static createUserSessionRepository(options) {
        if (options.engine === 'mongo') {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { MongoUserSessionRepository } = require('../mongodb/MongoUserSessionRepository');
            return new MongoUserSessionRepository();
        }
        throw new Error(`Unsupported repository engine: ${options.engine}`);
    }
    static createNotificationRepository(options) {
        if (options.engine === 'mongo') {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { MongoNotificationRepository } = require('../mongodb/MongoNotificationRepository');
            return new MongoNotificationRepository();
        }
        throw new Error(`Unsupported repository engine: ${options.engine}`);
    }
}
exports.RepositoryFactory = RepositoryFactory;
