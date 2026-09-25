import Image from "next/image";

export function LogoMark({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
  /** Kept for backwards compatibility with existing call sites; the shipped
   * brand asset is a single black-on-white mark used everywhere. */
  variant?: "dark" | "light";
}) {
  return (
    <Image
      src="/brand/icon-plain.png"
      alt="AiReview"
      width={1254}
      height={1254}
      className={className}
      style={{ height: size, width: size }}
      priority
    />
  );
}
