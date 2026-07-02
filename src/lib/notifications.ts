import { connectDB } from "./db";
import NotificationModel from "@/models/Notification";
import type { NotificationType } from "@/models/Notification";
import type { Types } from "mongoose";

export async function createNotification(
  userId: string | Types.ObjectId,
  type: NotificationType,
  message: string
) {
  await connectDB();
  await NotificationModel.create({ userId, type, message });
}

export async function createBulkNotifications(
  userIds: (string | Types.ObjectId)[],
  type: NotificationType,
  message: string
) {
  if (userIds.length === 0) return;
  await connectDB();
  await NotificationModel.insertMany(
    userIds.map((userId) => ({ userId, type, message }))
  );
}
