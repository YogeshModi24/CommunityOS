export interface IMetrics {
  increment(metricName: string, tags?: Record<string, any>): void;
}
