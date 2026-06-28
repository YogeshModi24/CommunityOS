import { Issue } from '@community-os/types';
import { Result } from '@community-os/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IAIService } from '../services/contracts/IAIService';
import { IEventBus } from '../services/contracts/IEventBus';
import { IIssueService } from '../services/contracts/IIssueService';
import { IUserService } from '../services/contracts/IUserService';
import { AnalyzeIssueUseCase } from '../use-cases/AnalyzeIssueUseCase';

describe('AnalyzeIssueUseCase Idempotency and Execution Tests', () => {
  let issueServiceMock: IIssueService;
  let aiServiceMock: IAIService;
  let userServiceMock: IUserService;
  let eventBusMock: IEventBus;
  let useCase: AnalyzeIssueUseCase;

  beforeEach(() => {
    issueServiceMock = {
      getIssue: vi.fn(),
      updateAIStatus: vi.fn(),
      updateIssueAIResults: vi.fn(),
    } as any;

    aiServiceMock = {
      analyzeIssueImage: vi.fn(),
    } as any;

    userServiceMock = {
      incrementPointsAndIssues: vi.fn(),
    } as any;

    eventBusMock = {
      publish: vi.fn(),
    } as any;

    useCase = new AnalyzeIssueUseCase(
      issueServiceMock,
      aiServiceMock,
      userServiceMock,
      eventBusMock
    );
  });

  it('should process a pending issue, update status to completed, award points and publish events', async () => {
    const mockIssue: Partial<Issue> = {
      id: 'issue-123',
      ai_status: 'pending',
      createdAt: new Date(),
    };

    const mockAIResult = {
      category: 'pothole',
      severity: 4,
      description: 'AI detected large pothole',
      hazardous: true,
      confidence: 0.95,
      department: 'roads',
      estimated_sla_days: 7,
      aiVersion: 'v1.0.0',
      modelName: 'gpt-4o',
      promptVersion: 'p1.0.0',
      processedAt: new Date(),
    };

    vi.mocked(issueServiceMock.getIssue).mockResolvedValue(Result.ok(mockIssue as Issue));
    vi.mocked(issueServiceMock.updateAIStatus).mockResolvedValue(Result.ok(undefined as any));
    vi.mocked(aiServiceMock.analyzeIssueImage).mockResolvedValue(Result.ok(mockAIResult));
    vi.mocked(issueServiceMock.updateIssueAIResults).mockResolvedValue(
      Result.ok(mockIssue as Issue)
    );
    vi.mocked(userServiceMock.incrementPointsAndIssues).mockResolvedValue(
      Result.ok(undefined as any)
    );

    const result = await useCase.execute({
      issueId: 'issue-123',
      imageUrl: 'https://test.com/image.jpg',
      reporterId: 'user-123',
    });

    expect(result.isSuccess).toBe(true);
    expect(issueServiceMock.updateAIStatus).toHaveBeenCalledWith('issue-123', 'processing');
    expect(aiServiceMock.analyzeIssueImage).toHaveBeenCalledWith('https://test.com/image.jpg');
    expect(issueServiceMock.updateIssueAIResults).toHaveBeenCalled();
    expect(userServiceMock.incrementPointsAndIssues).toHaveBeenCalledWith('user-123', 10, 1);
    expect(eventBusMock.publish).toHaveBeenCalledTimes(2); // IssueAnalyzed & IssuePriorityUpdated
  });

  it('should skip processing and prevent duplicate points if issue is already completed or processing (idempotency)', async () => {
    const mockIssue: Partial<Issue> = {
      id: 'issue-123',
      ai_status: 'completed',
      createdAt: new Date(),
    };

    vi.mocked(issueServiceMock.getIssue).mockResolvedValue(Result.ok(mockIssue as Issue));

    const result = await useCase.execute({
      issueId: 'issue-123',
      imageUrl: 'https://test.com/image.jpg',
      reporterId: 'user-123',
    });

    expect(result.isSuccess).toBe(true);
    expect(aiServiceMock.analyzeIssueImage).not.toHaveBeenCalled();
    expect(issueServiceMock.updateAIStatus).not.toHaveBeenCalled();
    expect(userServiceMock.incrementPointsAndIssues).not.toHaveBeenCalled();
    expect(eventBusMock.publish).not.toHaveBeenCalled();
  });

  it('should run analysis if previous attempt failed (recovery)', async () => {
    const mockIssue: Partial<Issue> = {
      id: 'issue-123',
      ai_status: 'failed',
      createdAt: new Date(),
    };

    const mockAIResult = {
      category: 'water_leak',
      severity: 3,
      description: 'Leak detected',
      hazardous: true,
      confidence: 0.95,
      department: 'roads',
      estimated_sla_days: 7,
      aiVersion: 'v1.0.0',
      modelName: 'gpt-4o',
      promptVersion: 'p1.0.0',
      processedAt: new Date(),
    };

    vi.mocked(issueServiceMock.getIssue).mockResolvedValue(Result.ok(mockIssue as Issue));
    vi.mocked(issueServiceMock.updateAIStatus).mockResolvedValue(Result.ok(undefined as any));
    vi.mocked(aiServiceMock.analyzeIssueImage).mockResolvedValue(Result.ok(mockAIResult));
    vi.mocked(issueServiceMock.updateIssueAIResults).mockResolvedValue(
      Result.ok(mockIssue as Issue)
    );
    vi.mocked(userServiceMock.incrementPointsAndIssues).mockResolvedValue(
      Result.ok(undefined as any)
    );

    const result = await useCase.execute({
      issueId: 'issue-123',
      imageUrl: 'https://test.com/image.jpg',
      reporterId: 'user-123',
    });

    expect(result.isSuccess).toBe(true);
    expect(aiServiceMock.analyzeIssueImage).toHaveBeenCalledWith('https://test.com/image.jpg');
    expect(userServiceMock.incrementPointsAndIssues).toHaveBeenCalled();
  });
});
