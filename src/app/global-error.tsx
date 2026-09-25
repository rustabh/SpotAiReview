"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
          <Logo size={32} />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={26} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="mt-2 max-w-sm text-sm text-ink-500">
              An unexpected error occurred. Our team has been notified — please try again.
            </p>
            {error.digest && <p className="mt-2 text-xs text-ink-400">Reference: {error.digest}</p>}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => reset()}>Try again</Button>
            <Link href="/"><Button>Go home</Button></Link>
          </div>
        </div>
      </body>
    </html>
  );
}
