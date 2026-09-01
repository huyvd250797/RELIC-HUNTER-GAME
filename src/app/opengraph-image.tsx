import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";
import { appVersion } from "@/data/version";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#13214f",
          color: "#f7f6ef",
          padding: "72px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 900 }}>{`${profile.shortName}.`}</div>
          <div style={{ display: "flex", fontSize: 24, opacity: 0.78 }}>{appVersion.label}</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", fontSize: 28, marginBottom: 26, color: "#89a6ff" }}>{profile.role}</div>
          <div style={{ display: "flex", fontSize: 78, lineHeight: 0.98, fontWeight: 900, letterSpacing: -4, maxWidth: 920 }}>
            {profile.headline}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 24, opacity: 0.82 }}>
          <span>{profile.location}</span>
          <span>{profile.email}</span>
        </div>
      </div>
    ),
    size,
  );
}
