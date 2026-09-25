import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AiReview by Febble Spot";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #5b9dff 0%, #1e3a8a 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 180,
            height: 180,
            borderRadius: 36,
            background: "#ffffff",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${appUrl}/brand/icon-plain.png`} width={140} height={140} alt="" />
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 800, color: "#ffffff" }}>
          AiReview
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#dbeafe", marginTop: 8 }}>
          by Febble Spot
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#ffffff", marginTop: 36, maxWidth: 900, textAlign: "center" }}>
          Turn Real Experiences Into Better Reviews
        </div>
      </div>
    ),
    { ...size }
  );
}
