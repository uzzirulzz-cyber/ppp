import mongoose, { Schema, Document } from 'mongoose';

export interface ICoin extends Document {
  symbol: string;
  name: string;
  pair: string;
  logo?: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
  isActive: boolean;
}

const CoinSchema = new Schema<ICoin>({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  pair: String,
  logo: String,
  price: { type: Number, default: 0 },
  change24h: { type: Number, default: 0 },
  high24h: { type: Number, default: 0 },
  low24h: { type: Number, default: 0 },
  volume24h: { type: Number, default: 0 },
  marketCap: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Coin || mongoose.model<ICoin>('Coin', CoinSchema);