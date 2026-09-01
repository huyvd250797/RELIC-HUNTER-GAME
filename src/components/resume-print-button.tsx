"use client";

export function ResumePrintButton() {
  return (
    <button className="resume-print-button" type="button" data-track-event="resume_download" data-track-label="Print / Save PDF" onClick={() => window.print()}>
      Print / Save PDF ↗
    </button>
  );
}
