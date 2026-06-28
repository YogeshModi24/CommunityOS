import { DynamicStructuredTool } from '@langchain/core/tools';

import { DashboardService } from '../../services/DashboardService';
import { GetDashboardStatsSchema, GetSlaOverviewSchema } from '../schemas/toolSchemas';

export const getDashboardStatsTool: any = new (DynamicStructuredTool as any)({
  name: 'getDashboardStats',
  description: 'Gets high-level dashboard statistics like total, resolved, and open civic issues.',
  schema: GetDashboardStatsSchema,
  func: async () => {
    try {
      const service = new DashboardService();
      const stats = await service.getDashboardStats();
      return JSON.stringify(stats);
    } catch (e: any) {
      return JSON.stringify({ error: `Failed to fetch dashboard stats: ${e.message}` });
    }
  },
});

export const getSlaOverviewTool: any = new (DynamicStructuredTool as any)({
  name: 'getSlaOverview',
  description: 'Gets an overview of active and expired SLAs for pending civic issues.',
  schema: GetSlaOverviewSchema,
  func: async () => {
    try {
      const service = new DashboardService();
      const overview = await service.getSlaOverview();
      return JSON.stringify(overview);
    } catch (e: any) {
      return JSON.stringify({ error: `Failed to fetch SLA overview: ${e.message}` });
    }
  },
});
