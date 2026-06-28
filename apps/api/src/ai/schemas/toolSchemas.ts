import { z } from 'zod';

export const GetIssuesByCategorySchema = z.object({
  category: z
    .enum(['pothole', 'water_leak', 'streetlight', 'garbage', 'encroachment', 'sewage', 'other'])
    .describe('The category of civic issues to retrieve.'),
  limit: z.number().optional().default(10).describe('Maximum number of issues to return.'),
});

export const GetIssuesByDepartmentSchema = z.object({
  department: z
    .enum(['roads', 'water_and_sanitation', 'electrical', 'waste_management', 'public_works', 'other'])
    .describe('The department assigned to the issues.'),
  limit: z.number().optional().default(10).describe('Maximum number of issues to return.'),
});

export const GetCriticalIssuesSchema = z.object({
  limit: z.number().optional().default(10).describe('Maximum number of issues to return.'),
});

export const GetIssueByIdSchema = z.object({
  issueId: z.string().describe('The ID of the issue to retrieve.'),
});

export const GetDashboardStatsSchema = z.object({
  _dummy: z.string().optional().describe('Ignored parameter to satisfy Langchain type constraints.'),
});
export const GetDepartmentWorkloadSchema = z.object({
  _dummy: z.string().optional().describe('Ignored parameter to satisfy Langchain type constraints.'),
});
export const GetSlaOverviewSchema = z.object({
  _dummy: z.string().optional().describe('Ignored parameter to satisfy Langchain type constraints.'),
});
export const GetLeaderboardSchema = z.object({
  limit: z.number().optional().default(5).describe('Maximum number of leaderboard entries to return.'),
});
export const GetOpenIssuesSchema = z.object({
  limit: z.number().optional().default(10).describe('Maximum number of issues to return.'),
});
