import Image from "next/image";
import { cn } from "@/lib/utils";

const ASSETS = {
  full: {
    light: "/brand/logo-full.png",
    dark: "/brand/logo-full-dark.png",
    width: 1655,
    height: 596,
    alt: "AiReview by Febble Spot",
  },
  wordmark: {
    light: "/brand/logo-wordmark.png",
    dark: "/brand/logo-wordmark-dark.png",
    width: 1657,
    height: 541,
    alt: "AiReview",
  },
} as const;

export function Logo({
  size = 32,
  className,
  tagline = true,
  variant,
}: {
  size?: number;
  /** Unused — the shipped lockup is a single fixed asset with no separate wordmark text to size. */
  wordmarkClassName?: string;
  tagline?: boolean;
  className?: string;
  /** Force an ink color regardless of the active theme: "light" renders white ink (for a
   * surface that's always dark, like the auth screen's side panel), "dark" renders black ink
   * (for a surface that's always light). Omit to follow the light/dark theme automatically. */
  variant?: "dark" | "light";
}) {
  const asset = tagline ? ASSETS.full : ASSETS.wordmark;
  const height = Math.round(size * 1.3);
  const style = { height, width: "auto" as const };

  if (variant === "light") {
    return <Image src={asset.dark} alt={asset.alt} width={asset.width} height={asset.height} className={cn(className)} style={style} priority />;
  }
  if (variant === "dark") {
    return <Image src={asset.light} alt={asset.alt} width={asset.width} height={asset.height} className={cn(className)} style={style} priority />;
  }
  return (
    <>
      <Image src={asset.light} alt={asset.alt} width={asset.width} height={asset.height} className={cn("dark:hidden", className)} style={style} priority />
      <Image src={asset.dark} alt={asset.alt} width={asset.width} height={asset.height} className={cn("hidden dark:block", className)} style={style} priority />
    </>
  );
}
