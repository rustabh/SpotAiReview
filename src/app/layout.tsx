import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-heading", weight: ["500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Spot AI Review | Febble Spot",
  description: "Turn real experiences into better reviews. Collect feedback and help customers write genuine, AI-assisted reviews for any business.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jakarta.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
