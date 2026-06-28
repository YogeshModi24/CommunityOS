import { Document, Types } from 'mongoose';
export interface IIssue extends Document {
    title: string;
    description: string;
    category: 'pothole' | 'water_leak' | 'streetlight' | 'garbage' | 'encroachment' | 'sewage' | 'other';
    severity: 1 | 2 | 3 | 4 | 5;
    status: 'open' | 'verified' | 'in_progress' | 'resolved';
    ai_status: 'pending' | 'processing' | 'completed' | 'failed';
    priority_score: number;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    address: string;
    ward: string;
    media: Array<{
        url: string;
        originalUrl: string;
        optimizedUrl: string;
        thumbnailUrl: string;
        public_id: string;
    }>;
    ai_category: string;
    ai_confidence: number;
    ai_description: string;
    hazardous: boolean;
    department?: string;
    estimated_sla_days?: number;
    ai_analysis?: {
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
    };
    votes: number;
    voter_ids: Types.ObjectId[];
    reporter_id: Types.ObjectId;
    status_history: Array<{
        status: string;
        note: string;
        timestamp: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: import("mongoose").Model<IIssue, {}, {}, {}, Document<unknown, {}, IIssue, {}, {}> & IIssue & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Issue.d.ts.map