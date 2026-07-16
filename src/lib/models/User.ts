import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  uid: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  country?: string;
  avatar?: string;
  role: 'user' | 'sub_agent' | 'super_admin';
  status: 'active' | 'suspended' | 'banned' | 'pending';
  twoFactor: boolean;
  twoFactorSecret?: string;
  emailVerified: boolean;
  mustChangePass: boolean;
  referralCode: string;
  subAgentId?: mongoose.Types.ObjectId;
  invitationCode?: string;
  referredBy?: string;
  balance: number;
  frozenBalance: number;
  bonusBalance: number;
  totalProfit: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  uid: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: String,
  country: String,
  avatar: String,
  role: { type: String, enum: ['user', 'sub_agent', 'super_admin'], default: 'user' },
  status: { type: String, enum: ['active', 'suspended', 'banned', 'pending'], default: 'active' },
  twoFactor: { type: Boolean, default: false },
  twoFactorSecret: String,
  emailVerified: { type: Boolean, default: false },
  mustChangePass: { type: Boolean, default: false },
  referralCode: { type: String, required: true, unique: true },
  subAgentId: { type: Schema.Types.ObjectId, ref: 'User' },
  invitationCode: String,
  referredBy: String,
  balance: { type: Number, default: 0 },
  frozenBalance: { type: Number, default: 0 },
  bonusBalance: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);