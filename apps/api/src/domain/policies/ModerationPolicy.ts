export class ModerationPolicy {
  static shouldFlagSpam(description: string): boolean {
    const spamKeywords = ['buy now', 'cheap', 'casino', 'viagra', 'credit card debt', 'click here'];
    const text = description.toLowerCase();
    return spamKeywords.some((keyword) => text.includes(keyword));
  }

  static isLowAIConfidence(confidence: number): boolean {
    return confidence < 0.7;
  }
}
