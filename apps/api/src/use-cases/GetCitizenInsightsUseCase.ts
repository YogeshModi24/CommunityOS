import { Result } from '@community-os/utils';

import { InsightService } from '../services/InsightService';

export class GetCitizenInsightsUseCase {
  constructor(private insightService: InsightService) {}

  async execute(userId: string): Promise<Result<any, string>> {
    try {
      const insights = await this.insightService.generateCitizenInsights(userId);
      return Result.ok(insights);
    } catch (error: any) {
      return Result.fail(`Failed to fetch citizen insights: ${error.message}`);
    }
  }
}
