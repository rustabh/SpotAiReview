import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  size = 32,
  className,
  tagline = true,
}: {
  size?: number;
  wordmarkClassName?: string;
  tagline?: boolean;
  className?: string;
  /** Kept for backwards compatibility; the shipped lockup is a single fixed asset. */
  variant?: "dark" | "light";
}) {
  const height = Math.round(size * 1.3);
  return tagline ? (
    <Image
      src="/brand/logo-full.png"
      alt="AiReview by Febble Spot"
      width={1983}
      height={793}
      className={cn(className)}
      style={{ height, width: "auto" }}
      priority
    />
  ) : (
    <Image
      src="/brand/logo-wordmark.png"
      alt="AiReview"
      width={2172}
      height={724}
      className={cn(className)}
      style={{ height, width: "auto" }}
      priority
    />
  );
}
