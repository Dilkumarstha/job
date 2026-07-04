import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type NotificationType =
  | "APPLICATION_STATUS_CHANGED"
  | "NEW_JOB_POSTED"
  | "ACCOUNT_SUSPENDED"
  | "ACCOUNT_REACTIVATED"
  | "COMPANY_APPROVED"
  | "COMPANY_REJECTED";

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  message: string;
  read: boolean;
  metadata?: {
    jobId?: string;
    jobTitle?: string;
    companyName?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "APPLICATION_STATUS_CHANGED",
        "NEW_JOB_POSTED",
        "ACCOUNT_SUSPENDED",
        "ACCOUNT_REACTIVATED",
        "COMPANY_APPROVED",
        "COMPANY_REJECTED",
      ] as NotificationType[],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ??
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
