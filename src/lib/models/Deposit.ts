import mongoose, { Schema, Document } from 'mongoose';

export interface IDeposit extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  method: string;
  status: 'pending' | 'approved' | 'rejected';
  txHash?: string;
  proofUrl?: string;
  walletAddress?: string;
  bankDetails?: string;
  note?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
}

const DepositSchema = new Schema<IDeposit>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  txHash: String,
  proofUrl: String,
  walletAddress: String,
  bankDetails: String,
  note: String,
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
}, { timestamps: true });

export default mongoose.models.Deposit || mongoose.model<IDeposit>('Deposit', DepositSchema);