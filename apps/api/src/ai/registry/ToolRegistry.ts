import { getDashboardStatsTool, getSlaOverviewTool } from '../tools/dashboard.tool';
import { getDepartmentWorkloadTool } from '../tools/departments.tool';
import {
  getCitizenInsightsTool,
  getCityHealthScoreTool,
  getDepartmentInsightsTool,
  getExecutiveSummaryTool,
  getTrendAnalysisTool,
} from '../tools/insights.tool';
import {
  assignIssueTool,
  getCriticalIssuesTool,
  getIssueByIdTool,
  getIssuesByCategoryTool,
  getIssuesByDepartmentTool,
  getOpenIssuesTool,
} from '../tools/issues.tool';
import { getLeaderboardTool } from '../tools/leaderboard.tool';

export const ToolRegistry: any[] = [
  getDashboardStatsTool,
  getSlaOverviewTool,
  getDepartmentWorkloadTool,
  getCriticalIssuesTool,
  getIssueByIdTool,
  getIssuesByCategoryTool,
  getIssuesByDepartmentTool,
  getOpenIssuesTool,
  assignIssueTool,
  getLeaderboardTool,
  getCitizenInsightsTool,
  getCityHealthScoreTool,
  getDepartmentInsightsTool,
  getExecutiveSummaryTool,
  getTrendAnalysisTool,
];
