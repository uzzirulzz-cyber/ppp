import mongoose, { Schema, Document } from 'mongoose';

export interface ITrade extends Document {
  userId: mongoose.Types.ObjectId;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  pair: string;
  direction: 'up' | 'down';
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  duration: number;
  status: 'pending' | 'running' | 'won' | 'lost';
  profit: number;
  payout: number;
  startedAt: Date;
  closedAt?: Date;
}

const TradeSchema = new Schema<ITrade>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  coinId: String,
  coinSymbol: String,
  coinName: String,
  pair: String,
  direction: { type: String, enum: ['up', 'down'] },
  amount: { type: Number, default: 0 },
  entryPrice: { type: Number, default: 0 },
  exitPrice: Number,
  duration: { type: Number, default: 60 },
  status: { type: String, enum: ['pending', 'running', 'won', 'lost'], default: 'pending' },
  profit: { type: Number, default: 0 },
  payout: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  closedAt: Date,
}, { timestamps: true });

export default mongoose.models.Trade || mongoose.model<ITrade>('Trade', TradeSchema);