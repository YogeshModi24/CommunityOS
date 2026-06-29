import {
  CreateIssueDTO,
  Issue,
  ListIssuesQueryDTO,
  NearbyIssuesQueryDTO,
  UpdateIssueStatusDTO,
} from '@community-os/types';
import { Result } from '@community-os/utils';

export interface IIssueService {
  createIssue(dto: CreateIssueDTO, userId: string): Promise<Result<Issue, string>>;
  getIssue(id: string): Promise<Result<Issue, string>>;
  getNearbyIssues(dto: NearbyIssuesQueryDTO): Promise<Result<any, string>>;
  listIssues(dto: ListIssuesQueryDTO): Promise<Result<any, string>>;
  updateStatus(id: string, dto: UpdateIssueStatusDTO): Promise<Result<Issue, string>>;
  assignIssue(id: string, assignment: any): Promise<Result<Issue, string>>;
  updateIssueAIResults(
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
  ): Promise<Result<Issue, string>>;
  updateAIStatus(id: string, aiStatus: any): Promise<Result<Issue, string>>;

  getUserStats(reporterId: string): Promise<
    Result<
      {
        total: number;
        resolved: number;
        pending: number;
      },
      string
    >
  >;
}
