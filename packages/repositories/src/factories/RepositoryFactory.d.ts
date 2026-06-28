import { IIssueRepository } from '../interfaces/IIssueRepository';
import { INotificationRepository } from '../interfaces/INotificationRepository';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IUserSessionRepository } from '../interfaces/IUserSessionRepository';
export interface RepositoryFactoryOptions {
    engine: 'mongo' | 'mock';
    logger?: any;
    config?: any;
}
export declare class RepositoryFactory {
    static createUserRepository(options: RepositoryFactoryOptions): IUserRepository;
    static createIssueRepository(options: RepositoryFactoryOptions): IIssueRepository;
    static createUserSessionRepository(options: RepositoryFactoryOptions): IUserSessionRepository;
    static createNotificationRepository(options: RepositoryFactoryOptions): INotificationRepository;
}
//# sourceMappingURL=RepositoryFactory.d.ts.map