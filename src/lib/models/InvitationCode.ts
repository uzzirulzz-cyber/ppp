import mongoose, { Schema, Document } from 'mongoose';

export interface IInvitationCode extends Document {
  code: string;
  ownerId: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
}

const InvitationCodeSchema = new Schema<IInvitationCode>({
  code: { type: String, required: true, unique: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

InvitationCodeSchema.index({ code: 1 });

export default mongoose.models.InvitationCode || mongoose.model<IInvitationCode>('InvitationCode', InvitationCodeSchema);