import { Document, model, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'citizen' | 'authority' | 'municipality' | 'admin';
  ward?: string;
  points: number;
  issues_reported: number;
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
  },
  { timestamps: true }
);

export default model<IUser>('User', UserSchema);
