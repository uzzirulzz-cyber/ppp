import mongoose, { Schema, Document } from 'mongoose';

export type WalletType = 'SPOT' | 'FUTURES' | 'EARN';
export type WalletStatus = 'ACTIVE' | 'FROZEN';

export interface IWallet extends Document {
  userId: string;
  type: WalletType;
  status: WalletStatus;
  balances: { currency: string; amount: number; frozen: number }[];
  totalEquity: number;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['SPOT', 'FUTURES', 'EARN'], default: 'SPOT' },
    status: { type: String, enum: ['ACTIVE', 'FROZEN'], default: 'ACTIVE' },
    balances: [
      {
        currency: { type: String, required: true },
        amount: { type: Number, default: 0 },
        frozen: { type: Number, default: 0 },
      },
    ],
    totalEquity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

WalletSchema.index({ userId: 1, type: 1 });

export default mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', WalletSchema);