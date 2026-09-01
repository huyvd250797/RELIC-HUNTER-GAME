import { NextRequest, NextResponse } from "next/server";
import { isAdminPasswordValid } from "@/lib/portfolio-cms";
import { getAnalyticsSummary } from "@/lib/portfolio-analytics";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const password = request.headers.get("x-admin-password");

  if (!isAdminPasswordValid(password)) {
    return NextResponse.json({ message: "Unauthorized. Enter ADMIN_PASSWORD, then refresh analytics." }, { status: 401 });
  }

  const summary = await getAnalyticsSummary();
  return NextResponse.json(summary);
}
