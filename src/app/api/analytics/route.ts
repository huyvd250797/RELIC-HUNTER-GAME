import { NextRequest, NextResponse } from "next/server";
import { saveAnalyticsEvent, type AnalyticsEventInput, type AnalyticsEventType } from "@/lib/portfolio-analytics";

export const dynamic = "force-dynamic";

const allowedEvents = new Set<AnalyticsEventType>([
  "page_view",
  "cta_click",
  "resume_download",
  "project_view",
  "contact_click",
]);

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as Partial<AnalyticsEventInput>;
    const eventType = body.eventType;

    if (!eventType || !allowedEvents.has(eventType)) {
      return NextResponse.json({ saved: false, message: "Invalid analytics event type." }, { status: 400 });
    }

    const result = await saveAnalyticsEvent(
      {
        eventType,
        path: body.path,
        label: body.label,
        target: body.target,
        referrer: body.referrer,
        metadata: body.metadata,
      },
      { userAgent: request.headers.get("user-agent") || undefined },
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      saved: false,
      message: error instanceof Error ? error.message : "Analytics save failed.",
    });
  }
}
