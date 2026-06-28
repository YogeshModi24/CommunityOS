import { DynamicStructuredTool } from '@langchain/core/tools';

import { DashboardService } from '../../services/DashboardService';
import { GetDepartmentWorkloadSchema } from '../schemas/toolSchemas';

export const getDepartmentWorkloadTool: any = new (DynamicStructuredTool as any)({
  name: 'getDepartmentWorkload',
  description: 'Gets a summary of unresolved issues grouped by department, helping identify operational bottlenecks.',
  schema: GetDepartmentWorkloadSchema,
  func: async () => {
    try {
      const service = new DashboardService();
      const stats = await service.getDepartmentWorkload();
      return JSON.stringify(stats);
    } catch (e: any) {
      return JSON.stringify({ error: `Failed to fetch department workload: ${e.message}` });
    }
  },
});
