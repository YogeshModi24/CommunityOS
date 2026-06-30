import { Document, model, Schema } from 'mongoose';

export interface IMunicipalityAccessRequest extends Document {
  name: string;
  email: string;
  ward: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const MunicipalityAccessRequestSchema = new Schema<IMunicipalityAccessRequest>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    ward: { type: String, required: true, trim: true },
    message: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true,
    },
  },
  { timestamps: true }
);

// Index to ensure we can look up by email quickly and filter by status
MunicipalityAccessRequestSchema.index({ email: 1 });
MunicipalityAccessRequestSchema.index({ status: 1 });

export default model<IMunicipalityAccessRequest>(
  'MunicipalityAccessRequest',
  MunicipalityAccessRequestSchema
);
