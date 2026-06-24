import mongoose, { Schema, Document } from 'mongoose';

export interface IReferral extends Document {
  referrerId: string;
  referredId: string;
  referralCode: string;
  level: number;
  totalCommission: number;
  isActive: boolean;
  createdAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    referrerId: { type: String, required: true, index: true },
    referredId: { type: String, required: true, index: true },
    referralCode: { type: String, required: true },
    level: { type: Number, default: 1 },
    totalCommission: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ReferralSchema.index({ referrerId: 1, referredId: 1 }, { unique: true });

export default mongoose.models.Referral || mongoose.model<IReferral>('Referral', ReferralSchema);