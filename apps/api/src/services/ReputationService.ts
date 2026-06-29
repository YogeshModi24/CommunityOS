import { IReputationService, ReputationMetrics } from './contracts/IReputationService';

export class ReputationService implements IReputationService {
  // A simple exponential/quadratic formula for levels.
  // Level N requires N^2 * 10 points. 
  // Level 1: 0 to 39
  // Level 2: 40 to 89
  // Level 3: 90 to 159
  private getPointsForLevel(level: number): number {
    return level * level * 10;
  }

  calculateLevel(points: number): number {
    let level = 1;
    while (points >= this.getPointsForLevel(level + 1)) {
      level++;
    }
    return level;
  }

  getRankTitle(level: number): string {
    if (level < 3) return 'Novice Citizen';
    if (level < 6) return 'Active Contributor';
    if (level < 10) return 'Civic Leader';
    if (level < 15) return 'Community Guardian';
    return 'Local Legend';
  }

  calculateMetrics(points: number): ReputationMetrics {
    const level = this.calculateLevel(points);
    const currentLevelPoints = this.getPointsForLevel(level);
    const nextLevelPoints = this.getPointsForLevel(level + 1);
    const pointsInLevel = points - currentLevelPoints;
    const requiredForNext = nextLevelPoints - currentLevelPoints;
    const xpProgress = requiredForNext > 0 ? pointsInLevel / requiredForNext : 1;

    return {
      points,
      level,
      xpProgress,
      nextLevelPoints,
      currentLevelPoints,
      rankTitle: this.getRankTitle(level),
    };
  }
}
