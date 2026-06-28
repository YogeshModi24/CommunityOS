import { IIssueRepository, IUserRepository } from '@community-os/repositories';
import {
  CreateIssueDTO,
  Issue,
  IssueCategory,
  ListIssuesQueryDTO,
  NearbyIssuesQueryDTO,
  UpdateIssueStatusDTO,
} from '@community-os/types';
import { Result } from '@community-os/utils';

import { logger } from '../lib/logger';
import { IIssueService } from './contracts/IIssueService';

export class IssueService implements IIssueService {
  constructor(
    private issueRepository: IIssueRepository,
    private userRepository: IUserRepository
  ) {}

  async createIssue(dto: CreateIssueDTO, userId: string): Promise<Result<Issue, string>> {
    if (!dto.mediaUrl) {
      return Result.fail('mediaUrl is required (upload image first)');
    }

    const reporter = await this.userRepository.findById(userId);
    if (!reporter) {
      return Result.fail('Reporter user not found');
    }

    const issue = await this.issueRepository.create({
      ...dto,
      reporterId: userId,
      ai_status: 'pending',
    });

    return Result.ok(issue);
  }

  async getIssue(id: string): Promise<Result<Issue, string>> {
    const issue = await this.issueRepository.findById(id);
    if (!issue) {
      return Result.fail('Issue not found');
    }
    return Result.ok(issue);
  }

  async getNearbyIssues(dto: NearbyIssuesQueryDTO): Promise<Result<any, string>> {
    const { lat, lng, radius = 5000 } = dto;
    if (!lat || !lng) {
      return Result.fail('lat and lng are required');
    }

    const issues = await this.issueRepository.findNearby(
      Number(lng),
      Number(lat),
      Number(radius),
      200
    );

    const geojson = {
      type: 'FeatureCollection',
      features: issues.map((issue) => ({
        type: 'Feature',
        geometry: issue.location,
        properties: {
          id: issue.id,
          title: issue.title,
          category: issue.category,
          severity: issue.severity,
          status: issue.status,
          votes: issue.votes,
          address: issue.address,
          imageUrl: issue.media[0]?.url ?? null,
        },
      })),
    };

    return Result.ok(geojson);
  }

  async listIssues(dto: ListIssuesQueryDTO): Promise<Result<any, string>> {
    const startTime = Date.now();
    const {
      category,
      status,
      ward,
      severity,
      reporterId,
      lat,
      lng,
      distance,
      cursor,
      sort,
      page = 1,
      limit = 10,
    } = dto;

    const filter: any = {};
    if (category && category !== 'all') filter.category = category;
    if (status) filter.status = status;
    if (ward) filter.ward = ward;
    if (severity) filter.severity = Number(severity);
    if (reporterId) filter.reporterId = reporterId;

    if (lat !== undefined && lng !== undefined) {
      filter.location = {
        lat: Number(lat),
        lng: Number(lng),
        radius: Number(distance ?? 5000),
      };
    }

    const skip = cursor ? undefined : (Number(page) - 1) * Number(limit);
    const { issues, total, nextCursor } = await this.issueRepository.findAll(filter, {
      skip,
      limit: Number(limit),
      cursor,
      sort,
    });

    const duration = Date.now() - startTime;
    if (duration > 250) {
      logger.warn(`[IssueService] Feed API performance target exceeded: ${duration}ms`, {
        event: 'sla_target_exceeded',
        api: 'Feed',
        duration,
      });
    }

    const response = {
      issues,
      total,
      nextCursor,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    };

    return Result.ok(response);
  }

  async updateStatus(id: string, dto: UpdateIssueStatusDTO): Promise<Result<Issue, string>> {
    const issue = await this.issueRepository.updateStatus(id, dto.status as any, dto.note);
    if (!issue) {
      return Result.fail('Issue not found');
    }
    return Result.ok(issue);
  }

  async updateIssueAIResults(
    id: string,
    analysis: {
      category: string;
      severity: number;
      description: string;
      hazardous: boolean;
      confidence: number;
      department: string;
      estimated_sla_days: number;
      aiVersion: string;
      modelName: string;
      promptVersion: string;
      processedAt: Date;
    },
    priorityScore: number
  ): Promise<Result<Issue, string>> {
    const updated = await this.issueRepository.update(id, {
      ai_category: analysis.category,
      ai_confidence: analysis.confidence,
      ai_description: analysis.description,
      hazardous: analysis.hazardous,
      priority_score: priorityScore,
      department: analysis.department,
      estimated_sla_days: analysis.estimated_sla_days,
      category: analysis.category as IssueCategory,
      severity: analysis.severity as 1 | 2 | 3 | 4 | 5,
      description: analysis.description,
      ai_status: 'completed',
      ai_analysis: analysis,
    });

    if (!updated) {
      return Result.fail('Issue not found');
    }
    return Result.ok(updated);
  }

  async updateAIStatus(id: string, aiStatus: any): Promise<Result<Issue, string>> {
    const updated = await this.issueRepository.update(id, { ai_status: aiStatus });
    if (!updated) return Result.fail('Issue not found');
    return Result.ok(updated);
  }

  async getUserStats(
    reporterId: string
  ): Promise<Result<{ total: number; resolved: number; pending: number }, string>> {
    try {
      const stats = await this.issueRepository.getUserStats(reporterId);
      return Result.ok(stats);
    } catch (err: any) {
      return Result.fail(`Failed to fetch user stats: ${err.message || err}`);
    }
  }
}
