import mongoose, { Schema, Document } from 'mongoose';

export interface IAgentConfig extends Document {
  agentId: string;
  commissionRate: number;
  referralRate: number;
  maxUsers: number;
  maxLeverage: number;
  allowedSymbols: string[];
  riskLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

const AgentConfigSchema = new Schema<IAgentConfig>(
  {
    agentId: { type: String, required: true, unique: true, index: true },
    commissionRate: { type: Number, default: 0.15 },
    referralRate: { type: Number, default: 0.05 },
    maxUsers: { type: Number, default: 100 },
    maxLeverage: { type: Number, default: 100 },
    allowedSymbols: { type: [String], default: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'] },
    riskLimit: { type: Number, default: 100000 },
  },
  { timestamps: true }
);

export default mongoose.models.AgentConfig || mongoose.model<IAgentConfig>('AgentConfig', AgentConfigSchema);