export class ResolutionPolicy {
  static canReopen(statusHistory: Array<{ status: string; timestamp: Date }>): boolean {
    const resolution = [...statusHistory].reverse().find((h) => h.status === 'resolved');
    if (!resolution) return true;
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - resolution.timestamp.getTime() < sevenDaysInMs;
  }
}
