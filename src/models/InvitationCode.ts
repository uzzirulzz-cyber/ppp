import mongoose, { Schema, Document } from 'mongoose';

export type CodeStatus = 'UNUSED' | 'USED' | 'DISABLED';

export interface IInvitationCode extends Document {
  code: string;
  role: string;
  createdBy: string;
  usedBy?: string;
  status: CodeStatus;
  usedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

const InvitationCodeSchema = new Schema<IInvitationCode>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    role: { type: String, enum: ['SUB_AGENT', 'USER'], required: true },
    createdBy: { type: String, required: true },
    usedBy: { type: String },
    status: { type: String, enum: ['UNUSED', 'USED', 'DISABLED'], default: 'UNUSED' },
    usedAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.InvitationCode || mongoose.model<IInvitationCode>('InvitationCode', InvitationCodeSchema);