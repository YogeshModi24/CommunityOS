import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

import { container } from '../../infra/container';
import { InsightService } from '../../services/InsightService';

// We resolve it dynamically to ensure we get the fully instantiated version
function getInsightService(): InsightService {
  return container.resolve<InsightService>('insightService');
}

export const getTrendAnalysisTool: any = new (DynamicStructuredTool as any)({
  name: 'getTrendAnalysis',
  description: 'Gets trend analysis predictions for issue volume, category growth, and forecasts for the upcoming week.',
  schema: z.object({}),
  func: async () => {
    try {
      const result = await getInsightService().generateTrendPrediction();
      return JSON.stringify(result);
    } catch (e: any) {
      return JSON.stringify({ error: `Failed to fetch trend predictions: ${e.message}` });
    }
  },
});

export const getDepartmentInsightsTool: any = new (DynamicStructuredTool as any)({
  name: 'getDepartmentInsights',
  description: 'Gets insights about department workloads, active issues per department, and average resolution times.',
  schema: z.object({}),
  func: async () => {
    try {
      const result = await getInsightService().generateDepartmentInsights();
      return JSON.stringify(result);
    } catch (e: any) {
      return JSON.stringify({ error: `Failed to fetch department insights: ${e.message}` });
    }
  },
});

export const getExecutiveSummaryTool: any = new (DynamicStructuredTool as any)({
  name: 'getExecutiveSummary',
  description: 'Gets a comprehensive executive report containing key metrics, risks, and recommendations for municipal leadership.',
  schema: z.object({}),
  func: async () => {
    try {
      const result = await getInsightService().generateExecutiveReport();
      return JSON.stringify(result);
    } catch (e: any) {
      return JSON.stringify({ error: `Failed to fetch executive summary: ${e.message}` });
    }
  },
});

export const getCityHealthScoreTool: any = new (DynamicStructuredTool as any)({
  name: 'getCityHealthScore',
  description: 'Gets the current City Health Score (0-100) and its contributing weighted factors (SLA compliance, resolution rate, etc.).',
  schema: z.object({}),
  func: async () => {
    try {
      const result = await getInsightService().generateCityHealthScore();
      return JSON.stringify(result);
    } catch (e: any) {
      return JSON.stringify({ error: `Failed to fetch city health score: ${e.message}` });
    }
  },
});

export const getCitizenInsightsTool: any = new (DynamicStructuredTool as any)({
  name: 'getCitizenInsights',
  description: 'Gets personalized insights and statistics for a specific citizen given their user ID.',
  schema: z.object({
    userId: z.string().describe('The ID of the citizen to fetch insights for')
  }),
  func: async ({ userId }: { userId: string }) => {
    try {
      const result = await getInsightService().generateCitizenInsights(userId);
      return JSON.stringify(result);
    } catch (e: any) {
      return JSON.stringify({ error: `Failed to fetch citizen insights: ${e.message}` });
    }
  },
});
