export class PriorityPolicy {
  static calculateScore(issue: {
    severity: number;
    votes: number;
    hazardous: boolean;
    createdAt: Date;
  }): number {
    const age_score = Math.min((Date.now() - issue.createdAt.getTime()) / (30 * 86_400_000), 1);
    const vote_score = Math.min(issue.votes / 50, 1);

    return (
      ((issue.severity / 5) * 0.4 +
        vote_score * 0.3 +
        age_score * 0.2 +
        (issue.hazardous ? 1 : 0) * 0.1) *
      100
    );
  }
}
