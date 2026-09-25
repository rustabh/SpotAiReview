import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import { ThemeScript } from "@/components/theme/theme-script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-heading", weight: ["500", "600", "700", "800"] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "AiReview by Febble Spot | AI-Assisted Google Review Collection",
    template: "%s | AiReview by Febble Spot",
  },
  description:
    "Turn real customer experiences into honest, AI-assisted Google reviews. QR & NFC review campaigns, grounded AI writing, and full funnel analytics for any business.",
  keywords: [
    "Google review software",
    "AI review generator",
    "QR code review",
    "NFC review card",
    "review standee",
    "Google review QR code",
    "customer feedback platform",
    "Febble Spot",
  ],
  applicationName: "AiReview",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AiReview",
  },
  openGraph: {
    type: "website",
    siteName: "AiReview by Febble Spot",
    title: "AiReview by Febble Spot | AI-Assisted Google Review Collection",
    description: "Turn real customer experiences into honest, AI-assisted Google reviews.",
  },
  twitter: {
    card: "summary",
    title: "AiReview by Febble Spot",
    description: "Turn real customer experiences into honest, AI-assisted Google reviews.",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${inter.variable} ${jakarta.variable} font-sans antialiased`}>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
