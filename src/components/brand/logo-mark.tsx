import Image from "next/image";
import { cn } from "@/lib/utils";

const ICON = {
  light: "/brand/icon-plain.png",
  dark: "/brand/icon-plain-dark.png",
  width: 735,
  height: 830,
};

export function LogoMark({
  size = 32,
  className,
  variant,
}: {
  size?: number;
  className?: string;
  /** Force an ink color regardless of the active theme — see Logo's `variant` doc. Omit to
   * follow the light/dark theme automatically. */
  variant?: "dark" | "light";
}) {
  const style = { height: size, width: "auto" as const };

  if (variant === "light") {
    return <Image src={ICON.dark} alt="AiReview" width={ICON.width} height={ICON.height} className={className} style={style} priority />;
  }
  if (variant === "dark") {
    return <Image src={ICON.light} alt="AiReview" width={ICON.width} height={ICON.height} className={className} style={style} priority />;
  }
  return (
    <>
      <Image src={ICON.light} alt="AiReview" width={ICON.width} height={ICON.height} className={cn("dark:hidden", className)} style={style} priority />
      <Image src={ICON.dark} alt="AiReview" width={ICON.width} height={ICON.height} className={cn("hidden dark:block", className)} style={style} priority />
    </>
  );
}
