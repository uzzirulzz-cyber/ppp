import mongoose, { Schema, Document } from 'mongoose';

export type TradeSide = 'BUY' | 'SELL';
export type TradeType = 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT';
export type TradeStatus = 'OPEN' | 'CLOSED' | 'CANCELLED' | 'LIQUIDATED';

export interface ITrade extends Document {
  userId: string;
  symbol: string;
  side: TradeSide;
  type: TradeType;
  status: TradeStatus;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  leverage: number;
  margin: number;
  pnl: number;
  pnlPercent: number;
  stopLoss?: number;
  takeProfit?: number;
  closedAt?: Date;
  agentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TradeSchema = new Schema<ITrade>(
  {
    userId: { type: String, required: true, index: true },
    symbol: { type: String, required: true },
    side: { type: String, enum: ['BUY', 'SELL'], required: true },
    type: { type: String, enum: ['MARKET', 'LIMIT', 'STOP_LOSS', 'TAKE_PROFIT'], default: 'MARKET' },
    status: { type: String, enum: ['OPEN', 'CLOSED', 'CANCELLED', 'LIQUIDATED'], default: 'OPEN' },
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number },
    quantity: { type: Number, required: true },
    leverage: { type: Number, default: 1 },
    margin: { type: Number, required: true },
    pnl: { type: Number, default: 0 },
    pnlPercent: { type: Number, default: 0 },
    stopLoss: { type: Number },
    takeProfit: { type: Number },
    closedAt: { type: Date },
    agentId: { type: String },
  },
  { timestamps: true }
);

TradeSchema.index({ userId: 1, status: 1 });
TradeSchema.index({ symbol: 1 });
TradeSchema.index({ agentId: 1 });
TradeSchema.index({ createdAt: -1 });

export default mongoose.models.Trade || mongoose.model<ITrade>('Trade', TradeSchema);