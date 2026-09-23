"use client";

import Image from "next/image";
import { Download, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function QrCard({
  pngDataUrl,
  svg,
  url,
  fileName,
}: {
  pngDataUrl: string;
  svg: string;
  url: string;
  fileName: string;
}) {
  const [copied, setCopied] = useState(false);
  const svgDataUrl = `data:image/svg+xml;base64,${typeof window !== "undefined" ? window.btoa(svg) : ""}`;

  async function copyUrl() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-surface p-5">
      <div className="rounded-xl border border-border p-3">
        <Image src={pngDataUrl} alt="QR code" width={180} height={180} unoptimized />
      </div>
      <p className="mt-3 max-w-[220px] truncate text-center text-xs text-ink-400">{url}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button size="sm" variant="outline" onClick={copyUrl}>
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy Link"}
        </Button>
        <a href={pngDataUrl} download={`${fileName}.png`}>
          <Button size="sm" variant="outline"><Download size={14} /> PNG</Button>
        </a>
        <a href={svgDataUrl} download={`${fileName}.svg`}>
          <Button size="sm" variant="outline"><Download size={14} /> SVG</Button>
        </a>
      </div>
    </div>
  );
}
