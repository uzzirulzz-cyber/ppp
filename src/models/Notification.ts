import mongoose, { Schema, Document } from 'mongoose';

export type NotifType = 'SYSTEM' | 'TRADE' | 'WALLET' | 'SECURITY' | 'COMMISSION' | 'REFERRAL';
export type NotifPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface INotification extends Document {
  userId: string;
  type: NotifType;
  priority: NotifPriority;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const NotifSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['SYSTEM', 'TRADE', 'WALLET', 'SECURITY', 'COMMISSION', 'REFERRAL'], required: true },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    actionUrl: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

NotifSchema.index({ userId: 1, read: 1 });
NotifSchema.index({ createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotifSchema);