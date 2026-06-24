import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'SUPER_ADMIN' | 'SUB_AGENT' | 'USER';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'LOCKED';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  phone?: string;
  agentId?: string;
  referredBy?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['SUPER_ADMIN', 'SUB_AGENT', 'USER'], default: 'USER' },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'LOCKED'], default: 'ACTIVE' },
    avatar: { type: String },
    phone: { type: String },
    agentId: { type: String },
    referredBy: { type: String },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ agentId: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);