import { Document, model, Schema, Types } from 'mongoose';

export interface IIssue extends Document {
  title: string;
  description: string;
  category:
    | 'pothole'
    | 'water_leak'
    | 'streetlight'
    | 'garbage'
    | 'encroachment'
    | 'sewage'
    | 'other';
  severity: 1 | 2 | 3 | 4 | 5;
  status: 'open' | 'verified' | 'in_progress' | 'resolved';
  ai_status: 'pending' | 'processing' | 'completed' | 'failed';
  priority_score: number;
  location: { type: 'Point'; coordinates: [number, number] };
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
  assignment?: {
    department?: string;
    assignedToId?: Types.ObjectId;
    assignedToName?: string;
    assignedToRole?: string;
    assignedAt: Date;
    assignedById: Types.ObjectId;
    dueDate?: Date;
    status: 'assigned' | 'acknowledged' | 'in_progress';
  };
  votes: number;
  voter_ids: Types.ObjectId[];
  reporter_id: Types.ObjectId;
  status_history: Array<{ status: string; note: string; timestamp: Date }>;
  createdAt: Date;
  updatedAt: Date;
}

const IssueSchema = new Schema<IIssue>(
  {
    title: { type: String, required: true, maxlength: 100, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['pothole', 'water_leak', 'streetlight', 'garbage', 'encroachment', 'sewage', 'other'],
      required: true,
    },
    severity: { type: Number, min: 1, max: 5, required: true },
    status: {
      type: String,
      enum: ['open', 'verified', 'in_progress', 'resolved'],
      default: 'open',
    },
    ai_status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      required: true,
    },
    priority_score: { type: Number, default: 0 },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    address: { type: String, trim: true },
    ward: { type: String, trim: true },
    media: [
      {
        url: { type: String, required: true },
        originalUrl: { type: String, required: true },
        optimizedUrl: { type: String, required: true },
        thumbnailUrl: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    ai_category: String,
    ai_confidence: Number,
    ai_description: String,
    hazardous: { type: Boolean, default: false },
    department: { type: String },
    estimated_sla_days: { type: Number },
    ai_analysis: {
      category: String,
      severity: Number,
      description: String,
      hazardous: Boolean,
      confidence: Number,
      department: String,
      estimated_sla_days: Number,
      aiVersion: String,
      modelName: String,
      promptVersion: String,
      processedAt: Date,
    },
    assignment: {
      department: String,
      assignedToId: { type: Schema.Types.ObjectId, ref: 'User' },
      assignedToName: String,
      assignedToRole: String,
      assignedAt: Date,
      assignedById: { type: Schema.Types.ObjectId, ref: 'User' },
      dueDate: Date,
      status: {
        type: String,
        enum: ['assigned', 'acknowledged', 'in_progress'],
      },
    },
    votes: { type: Number, default: 0 },
    voter_ids: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reporter_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status_history: [
      {
        status: String,
        note: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

IssueSchema.index({ location: '2dsphere' });
IssueSchema.index({ status: 1, priority_score: -1 });
IssueSchema.index({ reporter_id: 1 });
IssueSchema.index({ createdAt: -1 });
IssueSchema.index({ category: 1 });
IssueSchema.index({ priority_score: -1 });

export default model<IIssue>('Issue', IssueSchema);
