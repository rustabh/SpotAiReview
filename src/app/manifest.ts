import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AiReview by Febble Spot",
    short_name: "AiReview",
    description: "Turn real customer experiences into honest, AI-assisted Google reviews.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#2563EB",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-512.png", sizes: "1254x1254", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "1254x1254", type: "image/png", purpose: "maskable" },
    ],
  };
}
