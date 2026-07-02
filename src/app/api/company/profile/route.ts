import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import CompanyProfile from "@/models/CompanyProfile";
import { updateCompanyProfileSchema } from "@/lib/validations/profile";

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await request.json();
  const result = updateCompanyProfileSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message, code: "BAD_REQUEST" },
      { status: 400 }
    );
  }

  await connectDB();

  await CompanyProfile.findOneAndUpdate(
    { userId: session.user.id },
    { ...result.data, logoUrl: body.logoUrl ?? "" },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
