import { CreateIssueDTO, Issue } from '@community-os/types';
import { IIssueRepository } from '../interfaces/IIssueRepository';
export declare class MongoIssueRepository implements IIssueRepository {
    findById(id: string): Promise<Issue | null>;
    create(issueData: CreateIssueDTO): Promise<Issue>;
    update(id: string, updateData: Partial<Issue>): Promise<Issue | null>;
    updateStatus(id: string, status: string, note?: string): Promise<Issue | null>;
    toggleVote(id: string, userId: string): Promise<{
        votes: number;
        priority_score: number;
        hasVoted: boolean;
    } | null>;
    findNearby(lng: number, lat: number, maxDistance: number, limit: number): Promise<Issue[]>;
    findAll(filter: {
        category?: string;
        status?: string;
        ward?: string;
        severity?: number;
        reporterId?: string;
        location?: {
            lat: number;
            lng: number;
            radius: number;
        };
    }, pagination: {
        skip?: number;
        limit?: number;
        cursor?: string;
        sort?: 'latest' | 'votes' | 'priority';
    }): Promise<{
        issues: Issue[];
        total: number;
        nextCursor?: string;
    }>;
    getUserStats(reporterId: string): Promise<{
        total: number;
        resolved: number;
        pending: number;
    }>;
    deleteAll(): Promise<void>;
}
//# sourceMappingURL=MongoIssueRepository.d.ts.map