import mongoose, { Schema, Document } from 'mongoose';

export type TxType = 'DEPOSIT' | 'WITHDRAW' | 'TRADE' | 'COMMISSION' | 'REFERRAL_BONUS' | 'TRANSFER';
export type TxStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface ITransaction extends Document {
  userId: string;
  type: TxType;
  status: TxStatus;
  currency: string;
  amount: number;
  fee: number;
  fromWallet?: string;
  toWallet?: string;
  tradeId?: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const TxSchema = new Schema<ITransaction>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['DEPOSIT', 'WITHDRAW', 'TRADE', 'COMMISSION', 'REFERRAL_BONUS', 'TRANSFER'], required: true },
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'], default: 'PENDING' },
    currency: { type: String, required: true },
    amount: { type: Number, required: true },
    fee: { type: Number, default: 0 },
    fromWallet: { type: String },
    toWallet: { type: String },
    tradeId: { type: String },
    description: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

TxSchema.index({ userId: 1, type: 1 });
TxSchema.index({ createdAt: -1 });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TxSchema);