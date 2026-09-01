import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isAdminPasswordValid, readPortfolioProfile, savePortfolioProfile } from "@/lib/portfolio-cms";
import type { PortfolioProfile } from "@/data/profile";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await readPortfolioProfile({ noStore: true });
  return NextResponse.json(result);
}

export async function PUT(request: NextRequest) {
  const password = request.headers.get("x-admin-password");

  if (!isAdminPasswordValid(password)) {
    return NextResponse.json({ message: "Unauthorized. Check ADMIN_PASSWORD or NEXT_PUBLIC_ADMIN_PASSWORD." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { profile?: PortfolioProfile };

    if (!body.profile || typeof body.profile !== "object") {
      return NextResponse.json({ message: "Missing profile payload." }, { status: 400 });
    }

    const saved = await savePortfolioProfile(body.profile);

    revalidatePath("/");
    revalidatePath("/resume");
    revalidatePath("/contact");
    body.profile.projects.forEach((project) => revalidatePath(`/projects/${project.slug}`));
    revalidatePath("/sitemap.xml");

    return NextResponse.json({ message: "Saved to Supabase", saved });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unexpected save error." },
      { status: 500 },
    );
  }
}
