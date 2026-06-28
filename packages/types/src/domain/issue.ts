export type IssueCategory =
  | 'pothole'
  | 'water_leak'
  | 'streetlight'
  | 'garbage'
  | 'encroachment'
  | 'sewage'
  | 'other';

export type IssueStatus = 'open' | 'verified' | 'in_progress' | 'resolved';

export type IssueSeverity = 1 | 2 | 3 | 4 | 5;

export type AIAnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface IssueLocation {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface IssueMedia {
  url: string; // fallback matching optimizedUrl
  originalUrl: string;
  optimizedUrl: string;
  thumbnailUrl: string;
  public_id: string;
}

export interface IssueStatusHistory {
  status: string;
  note: string;
  timestamp: Date;
}

export interface PopulatedReporter {
  id: string;
  name: string;
  points?: number;
  ward?: string;
}

export interface AIAnalysisSubDocument {
  category: string;
  severity: number;
  description: string;
  hazardous: boolean;
  confidence: number;
  department: string;
  estimated_sla_days: number;
  aiVersion: string; // e.g., 'v1'
  modelName: string; // e.g., 'gpt-4o'
  promptVersion: string; // e.g., 'v1'
  processedAt: Date;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  ai_status?: AIAnalysisStatus; // 'pending' | 'processing' | 'completed' | 'failed'
  priority_score: number;
  location: IssueLocation;
  address: string;
  ward: string;
  media: IssueMedia[];
  ai_category?: string;
  ai_confidence?: number;
  ai_description?: string;
  hazardous: boolean;
  department?: string;
  estimated_sla_days?: number;
  ai_analysis?: AIAnalysisSubDocument;
  votes: number;
  voter_ids: string[];
  reporter_id: string | PopulatedReporter;
  status_history: IssueStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}
