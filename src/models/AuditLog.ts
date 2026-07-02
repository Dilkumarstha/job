import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type AuditAction =
  | "APPROVE_COMPANY"
  | "REJECT_COMPANY"
  | "SUSPEND_USER"
  | "REACTIVATE_USER"
  | "DELETE_USER"
  | "UPDATE_USER";

export interface IAuditLog extends Document {
  adminId: Types.ObjectId;
  action: AuditAction | string;
  targetUserId: Types.ObjectId | null;
  reason: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reason: {
      type: String,
      default: "",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

AuditLogSchema.index({ adminId: 1, createdAt: -1 });
AuditLogSchema.index({ targetUserId: 1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ??
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;
