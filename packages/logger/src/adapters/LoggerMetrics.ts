import { ILogger } from '../interfaces/ILogger';
import { IMetrics } from '../interfaces/IMetrics';

export class LoggerMetrics implements IMetrics {
  constructor(private readonly logger: ILogger) {}

  public increment(metricName: string, tags?: Record<string, any>): void {
    this.logger.info(`[Metric] ${metricName} count=1`, {
      metric: metricName,
      value: 1,
      ...tags,
    });
  }
}
