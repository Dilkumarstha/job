import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveFile } from "@/lib/upload";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as "resume" | "logo" | null;
    const entityId = (formData.get("entityId") as string | null) ?? session.user.id;

    if (!file || !type) {
      return NextResponse.json(
        { error: "Missing required fields: file, type", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    if (!["resume", "logo"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid upload type. Must be 'resume' or 'logo'.", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    const result = await saveFile(file, type, entityId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message, code: "UPLOAD_ERROR" }, { status: 400 });
  }
}
