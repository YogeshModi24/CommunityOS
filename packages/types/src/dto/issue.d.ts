import { AIAnalysisStatus, IssueCategory, IssueStatus, IssueStatusHistory } from '../domain/issue';
export interface CreateIssueDTO {
    title: string;
    description: string;
    category: IssueCategory;
    severity: number;
    address: string;
    ward: string;
    lat: number;
    lng: number;
    mediaUrl: string;
    mediaPublicId?: string;
    mediaOriginalUrl?: string;
    mediaOptimizedUrl?: string;
    mediaThumbnailUrl?: string;
    reporterId?: string;
    status?: IssueStatus;
    ai_status?: AIAnalysisStatus;
    votes?: number;
    priority_score?: number;
    ai_category?: string;
    ai_confidence?: number;
    ai_description?: string;
    hazardous?: boolean;
    ai_analysis?: any;
    status_history?: IssueStatusHistory[];
    createdAt?: Date;
}
export interface UpdateIssueStatusDTO {
    status: IssueStatus;
    note?: string;
}
export interface ToggleVoteResponseDTO {
    issueId: string;
    votes: number;
    priority_score: number;
    hasVoted: boolean;
}
export interface ListIssuesQueryDTO {
    category?: string;
    status?: string;
    ward?: string;
    severity?: number;
    reporterId?: string;
    lat?: number;
    lng?: number;
    distance?: number;
    cursor?: string;
    sort?: 'latest' | 'votes' | 'priority';
    page?: number;
    limit?: number;
}
export interface NearbyIssuesQueryDTO {
    lat: number;
    lng: number;
    radius?: number;
}
//# sourceMappingURL=issue.d.ts.map