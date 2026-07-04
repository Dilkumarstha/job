import { connectDB } from "./db";
import NotificationModel from "@/models/Notification";
import type { NotificationType } from "@/models/Notification";
import type { Types } from "mongoose";

interface NotificationMetadata {
  jobId?: string;
  jobTitle?: string;
  companyName?: string;
}

export async function createNotification(
  userId: string | Types.ObjectId,
  type: NotificationType,
  message: string,
  metadata?: NotificationMetadata
) {
  await connectDB();
  await NotificationModel.create({ userId, type, message, metadata });
}

export async function createBulkNotifications(
  userIds: (string | Types.ObjectId)[],
  type: NotificationType,
  message: string,
  metadata?: NotificationMetadata
) {
  if (userIds.length === 0) return;
  await connectDB();
  await NotificationModel.insertMany(
    userIds.map((userId) => ({ userId, type, message, metadata }))
  );
}
