import { Result } from '@community-os/utils';

import { AIAnalysisResponse } from './IAIProvider';

export interface IAIService {
  analyzeIssueImage(imageUrl: string): Promise<Result<AIAnalysisResponse, string>>;
  chatStream(messages: { role: string; content: string }[], systemPrompt: string): AsyncGenerator<string>;
}
