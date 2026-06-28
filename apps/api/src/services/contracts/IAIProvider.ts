export interface AIAnalysisResponse {
  category: string;
  severity: number;
  description: string;
  hazardous: boolean;
  confidence: number;
  aiVersion: string;
  modelName: string;
  promptVersion: string;
  processedAt: Date;
}

export interface IAIProvider {
  analyzeImage(imageUrl: string): Promise<AIAnalysisResponse>;
}
