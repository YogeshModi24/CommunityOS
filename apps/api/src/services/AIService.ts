import { Result } from '@community-os/utils';

import { AIAnalysisResponse, IAIProvider } from './contracts/IAIProvider';
import { IAIService } from './contracts/IAIService';

export class AIService implements IAIService {
  constructor(private aiProvider: IAIProvider) {}

  public async analyzeIssueImage(imageUrl: string): Promise<Result<AIAnalysisResponse, string>> {
    try {
      const response = await this.aiProvider.analyzeImage(imageUrl);
      return Result.ok(response);
    } catch (err: any) {
      return Result.fail(`AI provider analysis failed: ${err.message || err}`);
    }
  }

  async *chatStream(
    messages: { role: string; content: string }[],
    systemPrompt: string
  ): AsyncGenerator<string> {
    yield* this.aiProvider.chatStream(messages, systemPrompt);
  }
}
