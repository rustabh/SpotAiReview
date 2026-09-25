"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-900/20">
        <AlertTriangle size={26} />
      </div>
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Something went wrong</h1>
        <p className="mt-2 max-w-sm text-sm text-ink-500">
          An unexpected error occurred. Please try again — if it keeps happening, let us know.
        </p>
        {error.digest && <p className="mt-2 text-xs text-ink-400">Reference: {error.digest}</p>}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => reset()}>Try again</Button>
        <Link href="/"><Button>Go home</Button></Link>
      </div>
    </div>
  );
}
