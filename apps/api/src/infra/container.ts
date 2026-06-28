import { LoggerMetrics } from '@community-os/logger';
import { RepositoryFactory } from '@community-os/repositories';
import { SystemClock } from '@community-os/utils';

import { logger } from '../lib/logger';
import { AIService } from '../services/AIService';
import { AuthService } from '../services/AuthService';
import { IssueService } from '../services/IssueService';
import { NotificationService } from '../services/NotificationService';
import { CloudinaryStorageProvider } from '../services/providers/CloudinaryStorageProvider';
import { OpenAIProvider } from '../services/providers/OpenAIProvider';
import { UploadService } from '../services/UploadService';
import { UserService } from '../services/UserService';
import { VoteService } from '../services/VoteService';
import { AnalyzeIssueUseCase } from '../use-cases/AnalyzeIssueUseCase';
import { DeleteNotificationUseCase } from '../use-cases/DeleteNotificationUseCase';
import { GetDashboardDataUseCase } from '../use-cases/GetDashboardDataUseCase';
import { GetRecentNotificationsUseCase } from '../use-cases/GetRecentNotificationsUseCase';
import { GetUnreadCountUseCase } from '../use-cases/GetUnreadCountUseCase';
import { LoginUserUseCase } from '../use-cases/LoginUserUseCase';
import { LogoutUserUseCase } from '../use-cases/LogoutUserUseCase';
import { MarkAllNotificationsReadUseCase } from '../use-cases/MarkAllNotificationsReadUseCase';
import { MarkNotificationReadUseCase } from '../use-cases/MarkNotificationReadUseCase';
import { RefreshTokenUseCase } from '../use-cases/RefreshTokenUseCase';
import { ReportIssueUseCase } from '../use-cases/ReportIssueUseCase';
import { ResolveIssueUseCase } from '../use-cases/ResolveIssueUseCase';
import { VoteIssueUseCase } from '../use-cases/VoteIssueUseCase';
import { EventEmitterEventBus } from './events/EventEmitterEventBus';

class ServiceContainer {
  private instances = new Map<any, any>();

  constructor() {
    // 1. Instantiating Repositories
    const userRepository = RepositoryFactory.createUserRepository({ engine: 'mongo' });
    const issueRepository = RepositoryFactory.createIssueRepository({ engine: 'mongo' });
    const userSessionRepository = RepositoryFactory.createUserSessionRepository({
      engine: 'mongo',
    });
    const notificationRepository = RepositoryFactory.createNotificationRepository({
      engine: 'mongo',
    });

    // 2. Instantiating Infrastructure / Event Bus / Providers
    const clock = new SystemClock();
    const metrics = new LoggerMetrics(logger);
    const eventBus = new EventEmitterEventBus();
    const storageProvider = new CloudinaryStorageProvider();
    const aiProvider = new OpenAIProvider();

    // 3. Instantiating Services
    const authService = new AuthService(userRepository, userSessionRepository, clock, metrics);
    const userService = new UserService(userRepository);
    const issueService = new IssueService(issueRepository, userRepository);
    const voteService = new VoteService(issueRepository);
    const aiService = new AIService(aiProvider);
    const uploadService = new UploadService(storageProvider);
    const notificationService = new NotificationService(notificationRepository, eventBus, metrics);

    // 4. Instantiating Use Cases
    const loginUserUseCase = new LoginUserUseCase(authService);
    const refreshTokenUseCase = new RefreshTokenUseCase(authService);
    const logoutUserUseCase = new LogoutUserUseCase(authService);
    const reportIssueUseCase = new ReportIssueUseCase(issueService, uploadService, eventBus);
    const analyzeIssueUseCase = new AnalyzeIssueUseCase(
      issueService,
      aiService,
      userService,
      eventBus
    );
    const voteIssueUseCase = new VoteIssueUseCase(voteService, eventBus);
    const resolveIssueUseCase = new ResolveIssueUseCase(issueService, eventBus);
    const getDashboardDataUseCase = new GetDashboardDataUseCase(userService);
    const getRecentNotificationsUseCase = new GetRecentNotificationsUseCase(notificationService);
    const getUnreadCountUseCase = new GetUnreadCountUseCase(notificationService);
    const markNotificationReadUseCase = new MarkNotificationReadUseCase(notificationService);
    const markAllNotificationsReadUseCase = new MarkAllNotificationsReadUseCase(
      notificationService
    );
    const deleteNotificationUseCase = new DeleteNotificationUseCase(notificationService);

    // 5. Registering in the container
    this.instances.set('userRepository', userRepository);
    this.instances.set('issueRepository', issueRepository);
    this.instances.set('userSessionRepository', userSessionRepository);
    this.instances.set('notificationRepository', notificationRepository);

    this.instances.set('eventBus', eventBus);
    this.instances.set('authService', authService);
    this.instances.set('userService', userService);
    this.instances.set('issueService', issueService);
    this.instances.set('voteService', voteService);
    this.instances.set('aiService', aiService);
    this.instances.set('uploadService', uploadService);
    this.instances.set('notificationService', notificationService);

    this.instances.set(LoginUserUseCase, loginUserUseCase);
    this.instances.set(RefreshTokenUseCase, refreshTokenUseCase);
    this.instances.set(LogoutUserUseCase, logoutUserUseCase);
    this.instances.set(ReportIssueUseCase, reportIssueUseCase);
    this.instances.set(AnalyzeIssueUseCase, analyzeIssueUseCase);
    this.instances.set(VoteIssueUseCase, voteIssueUseCase);
    this.instances.set(ResolveIssueUseCase, resolveIssueUseCase);
    this.instances.set(GetDashboardDataUseCase, getDashboardDataUseCase);
    this.instances.set(GetRecentNotificationsUseCase, getRecentNotificationsUseCase);
    this.instances.set(GetUnreadCountUseCase, getUnreadCountUseCase);
    this.instances.set(MarkNotificationReadUseCase, markNotificationReadUseCase);
    this.instances.set(MarkAllNotificationsReadUseCase, markAllNotificationsReadUseCase);
    this.instances.set(DeleteNotificationUseCase, deleteNotificationUseCase);
  }

  public resolve<T>(key: any): T {
    const instance = this.instances.get(key);
    if (!instance) {
      throw new Error(`Dependency not registered inside container: ${key}`);
    }
    return instance;
  }
}

export const container = new ServiceContainer();
export default container;
