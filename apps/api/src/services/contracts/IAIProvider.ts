export interface AIAnalysisResponse {
  category: string;
  severity: number;
  description: string;
  hazardous: boolean;
  confidence: number;
  department: string;
  estimated_sla_days: number;
  aiVersion: string;
  modelName: string;
  promptVersion: string;
  processedAt: Date;
}

export interface IAIProvider {
  analyzeImage(imageUrl: string): Promise<AIAnalysisResponse>;
  chatStream(messages: { role: string; content: string }[], systemPrompt: string): AsyncGenerator<string>;
}
