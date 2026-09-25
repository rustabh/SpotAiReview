import Link from "next/link";
import { MapPinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <Logo size={30} />
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/20">
        <MapPinOff size={26} />
      </div>
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Page not found</h1>
        <p className="mt-2 max-w-sm text-sm text-ink-500">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>
      </div>
      <Link href="/"><Button>Go home</Button></Link>
    </div>
  );
}
