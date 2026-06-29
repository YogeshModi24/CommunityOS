import { Document, model, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'citizen' | 'authority' | 'municipality' | 'admin';
  ward?: string;
  points: number;
  issues_reported: number;
  achievements?: Array<{ id: string; unlockedAt: Date; progress?: number }>;
  savedLocations?: Array<{ type: 'home' | 'office' | 'university' | 'custom'; address: string; coordinates: [number, number] }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ['citizen', 'authority', 'municipality', 'admin'],
      default: 'citizen',
    },
    ward: String,
    points: { type: Number, default: 0 },
    issues_reported: { type: Number, default: 0 },
    achievements: {
      type: [
        {
          id: { type: String, required: true },
          unlockedAt: { type: Date, required: true },
          progress: { type: Number },
        },
      ],
      default: [],
    },
    savedLocations: {
      type: [
        {
          type: { type: String, required: true, enum: ['home', 'office', 'university', 'custom'] },
          address: { type: String, required: true },
          coordinates: { type: [Number], required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export default model<IUser>('User', UserSchema);
