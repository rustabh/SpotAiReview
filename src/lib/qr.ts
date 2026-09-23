import QRCode from "qrcode";

export function campaignUrl(slug: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/r/${slug}`;
}

export async function generateQrPngDataUrl(url: string, opts?: { fg?: string; bg?: string }) {
  return QRCode.toDataURL(url, {
    margin: 2,
    width: 512,
    color: {
      dark: opts?.fg ?? "#0F172A",
      light: opts?.bg ?? "#FFFFFF",
    },
  });
}

export async function generateQrSvg(url: string, opts?: { fg?: string; bg?: string }) {
  return QRCode.toString(url, {
    type: "svg",
    margin: 2,
    width: 512,
    color: {
      dark: opts?.fg ?? "#0F172A",
      light: opts?.bg ?? "#FFFFFF",
    },
  });
}
