import { DynamicStructuredTool } from '@langchain/core/tools';

import { container } from '../../infra/container';
import { IUserService } from '../../services/contracts/IUserService';
import { GetLeaderboardSchema } from '../schemas/toolSchemas';

export const getLeaderboardTool: any = new (DynamicStructuredTool as any)({
  name: 'getLeaderboard',
  description: 'Gets the citizen leaderboard, ranking users by their resolved issues and civic engagement.',
  schema: GetLeaderboardSchema,
  func: async ({ limit }: { limit: number }) => {
    try {
      const userService = container.resolve<IUserService>('userService');
      const result = await userService.getLeaderboard(limit);
      if (result.isFailure) {
        return JSON.stringify({ error: `Failed to fetch leaderboard: ${result.error}` });
      }
      return JSON.stringify(result.value);
    } catch (e: any) {
      return JSON.stringify({ error: `Failed to fetch leaderboard: ${e.message}` });
    }
  },
});
