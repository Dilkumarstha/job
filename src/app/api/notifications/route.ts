import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  await connectDB();

  const filter: Record<string, unknown> = { userId: session.user.id };
  if (unreadOnly) filter.read = false;

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const count = unreadOnly
    ? notifications.length
    : await Notification.countDocuments({ userId: session.user.id, read: false });

  return NextResponse.json({ notifications, count });
}
