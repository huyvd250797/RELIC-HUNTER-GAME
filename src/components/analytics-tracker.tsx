"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

type EventType = "page_view" | "cta_click" | "resume_download" | "project_view" | "contact_click";

type EventPayload = {
  eventType: EventType;
  path: string;
  label?: string;
  target?: string;
  referrer?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

const analyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "false";

function sendAnalytics(payload: EventPayload) {
  if (!analyticsEnabled || payload.path.startsWith("/admin")) return;

  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics", blob);
    return;
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

function readableText(element: HTMLElement) {
  return element.getAttribute("aria-label") || element.textContent?.replace(/\s+/g, " ").trim() || "Interaction";
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    const eventType: EventType = pathname.startsWith("/projects/") ? "project_view" : "page_view";

    sendAnalytics({
      eventType,
      path,
      label: typeof document !== "undefined" ? document.title : pathname,
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
    });
  }, [pathname, searchParams]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-track-event]") : null;
      if (!target) return;

      const query = window.location.search;
      const path = `${window.location.pathname}${query}`;
      const eventType = (target.dataset.trackEvent || "cta_click") as EventType;
      const label = target.dataset.trackLabel || readableText(target);
      const trackedTarget = target.dataset.trackTarget || target.getAttribute("href") || target.getAttribute("action") || "";

      sendAnalytics({
        eventType,
        path,
        label,
        target: trackedTarget,
        referrer: document.referrer,
      });
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  return null;
}
