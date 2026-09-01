import { NextRequest, NextResponse } from "next/server";
import { isAdminPasswordValid } from "@/lib/portfolio-cms";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { password?: string };

  if (!isAdminPasswordValid(body.password ?? null)) {
    return NextResponse.json({ message: "Wrong admin password." }, { status: 401 });
  }

  return NextResponse.json({ message: "Admin unlocked" });
}
