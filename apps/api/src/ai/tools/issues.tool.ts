import { RepositoryFactory } from '@community-os/repositories';
import { DynamicStructuredTool } from '@langchain/core/tools';

import { container } from '../../infra/container';
import { DashboardService } from '../../services/DashboardService';
import {
  AssignIssueSchema,
  GetCriticalIssuesSchema,
  GetIssueByIdSchema,
  GetIssuesByCategorySchema,
  GetIssuesByDepartmentSchema,
  GetOpenIssuesSchema,
} from '../schemas/toolSchemas';

// Helper to format issues for the LLM concisely
const formatIssues = (issues: any[]) => {
  return issues.map((i: any) => ({
    id: i.id || i._id,
    title: i.title,
    category: i.category,
    severity: i.severity,
    status: i.status,
    department: i.department,
    ward: i.ward,
  }));
};

export const getOpenIssuesTool: any = new (DynamicStructuredTool as any)({
  name: 'getOpenIssues',
  description: 'Gets a list of open civic issues.',
  schema: GetOpenIssuesSchema,
  func: async ({ limit }: { limit: number }) => {
    try {
      const repo = RepositoryFactory.createIssueRepository({ engine: 'mongo' });
      const { issues } = await repo.findAll({ status: 'open' }, { limit });
      return JSON.stringify(formatIssues(issues));
    } catch (e: any) {
      return JSON.stringify({ error: `Failed to fetch open issues: ${e.message}` });
    }
  },
});

export const getCriticalIssuesTool: any = new (DynamicStructuredTool as any)({
  name: 'getCriticalIssues',
  description: 'Gets a list of critical civic issues (severity 4 or 5) that are not resolved.',
  schema: GetCriticalIssuesSchema,
  func: async () => {
    try {
      const service = new DashboardService();
      const { issues, total } = await service.getCriticalIssueSummary();
      return JSON.stringify({ total, issues: formatIssues(issues) });
    } catch (e: any) {
      return JSON.stringify({ error: `Failed to fetch critical issues: ${e.message}` });
    }
  },
});

export const getIssueByIdTool: any = new (DynamicStructuredTool as any)({
  name: 'getIssueById',
  description: 'Gets detailed information about a specific civic issue by its ID.',
  schema: GetIssueByIdSchema,
  func: async ({ issueId }: { issueId: string }) => {
    try {
      const repo = RepositoryFactory.createIssueRepository({ engine: 'mongo' });
      const issue = await repo.findById(issueId);
      if (!issue) return 'Issue not found.';
      return JSON.stringify({
        title: issue.title,
        description: issue.description,
        category: issue.category,
        severity: issue.severity,
        status: issue.status,
        address: issue.address,
        ward: issue.ward,
        department: issue.department,
        ai_description: issue.ai_description,
        hazardous: issue.hazardous,
      });
    } catch (e: any) {
      return JSON.stringify({ error: `Failed to fetch issue by ID: ${e.message}` });
    }
  },
});

export const getIssuesByCategoryTool: any = new (DynamicStructuredTool as any)({
  name: 'getIssuesByCategory',
  description: 'Gets a list of issues filtered by a specific category.',
  schema: GetIssuesByCategorySchema,
  func: async ({ category, limit }: { category: string; limit: number }) => {
    try {
      const repo = RepositoryFactory.createIssueRepository({ engine: 'mongo' });
      const { issues } = await repo.findAll({ category, status: 'open' }, { limit });
      return JSON.stringify(formatIssues(issues));
    } catch (e: any) {
      return JSON.stringify({ error: `Failed to fetch issues by category: ${e.message}` });
    }
  },
});

export const getIssuesByDepartmentTool: any = new (DynamicStructuredTool as any)({
  name: 'getIssuesByDepartment',
  description: 'Gets a list of issues assigned to a specific department.',
  schema: GetIssuesByDepartmentSchema,
  func: async ({ department, limit }: { department: string; limit: number }) => {
    try {
      const repo = RepositoryFactory.createIssueRepository({ engine: 'mongo' });
      // Fetch open/pending issues by department
      const { issues } = await repo.findAll({ department }, { limit });
      // Filter out resolved just in case, or we can trust findAll
      const unresolved = issues.filter((i) => i.status !== 'resolved');
      return JSON.stringify(formatIssues(unresolved));
    } catch (e: any) {
      return JSON.stringify({ error: `Failed to fetch issues by department: ${e.message}` });
    }
  },
});

export const assignIssueTool: any = new (DynamicStructuredTool as any)({
  name: 'assignIssue',
  description:
    'Assigns a civic issue to a specific department or person, and optionally sets a due date.',
  schema: AssignIssueSchema,
  func: async ({
    issueId,
    department,
    assignedToName,
    dueDate,
  }: {
    issueId: string;
    department: string;
    assignedToName?: string;
    dueDate?: string;
  }) => {
    try {
      const { AssignIssueUseCase } = await import('../../use-cases/AssignIssueUseCase.js');
      const assignUseCase = container.resolve<any>(AssignIssueUseCase);

      const parsedDueDate = dueDate ? new Date(dueDate) : undefined;
      // Using 'ai-copilot' as the system actor ID
      const result = await assignUseCase.execute(
        issueId,
        { department, assignedToName, dueDate: parsedDueDate },
        'ai-copilot'
      );

      if (result.isFailure) {
        return JSON.stringify({ error: `Failed to assign issue: ${result.error}` });
      }

      return JSON.stringify({
        success: true,
        message: `Issue ${issueId} successfully assigned to ${department}.`,
      });
    } catch (e: any) {
      return JSON.stringify({ error: `Exception assigning issue: ${e.message}` });
    }
  },
});
