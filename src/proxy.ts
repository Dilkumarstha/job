import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// NOTE: This file is named proxy.ts (NOT middleware.ts) — renamed in Next.js 16.
// Edge runtime is NOT supported here. Runs on Node.js runtime only.
// Export must be named 'proxy', not 'middleware'.

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Helper to build redirect URLs
  const loginUrl = (error?: string) => {
    const url = new URL("/login", request.url);
    if (error) url.searchParams.set("error", error);
    return url;
  };

  // ─── Admin routes ────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!token) return NextResponse.redirect(loginUrl());
    if (token.role !== "SUPERADMIN") {
      return NextResponse.redirect(loginUrl("unauthorized"));
    }
  }

  // ─── Company routes ──────────────────────────────────────────────────────
  if (pathname.startsWith("/company")) {
    if (!token) return NextResponse.redirect(loginUrl());
    if (token.role !== "COMPANY") {
      return NextResponse.redirect(loginUrl("unauthorized"));
    }
    if (token.status === "SUSPENDED") {
      return NextResponse.redirect(new URL("/suspended", request.url));
    }
  }

  // ─── Seeker routes ───────────────────────────────────────────────────────
  if (pathname.startsWith("/seeker")) {
    if (!token) return NextResponse.redirect(loginUrl());
    if (token.role !== "JOBSEEKER") {
      return NextResponse.redirect(loginUrl("unauthorized"));
    }
    if (token.status === "SUSPENDED") {
      return NextResponse.redirect(new URL("/suspended", request.url));
    }
  }

  // ─── Protected API routes ────────────────────────────────────────────────
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/company/:path*",
    "/seeker/:path*",
    "/api/((?!auth|health).)*",
  ],
};
