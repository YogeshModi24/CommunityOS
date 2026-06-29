export interface ReputationMetrics {
  points: number;
  level: number;
  xpProgress: number; // 0 to 1
  nextLevelPoints: number;
  currentLevelPoints: number;
  rankTitle: string;
}

export interface IReputationService {
  calculateLevel(points: number): number;
  calculateMetrics(points: number): ReputationMetrics;
  getRankTitle(level: number): string;
}
