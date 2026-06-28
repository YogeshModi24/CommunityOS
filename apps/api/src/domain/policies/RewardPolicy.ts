export class RewardPolicy {
  static calculatePoints(action: 'report_issue' | 'vote_issue' | 'resolve_issue'): number {
    switch (action) {
      case 'report_issue':
        return 10;
      case 'vote_issue':
        return 1;
      case 'resolve_issue':
        return 25;
      default:
        return 0;
    }
  }
}
