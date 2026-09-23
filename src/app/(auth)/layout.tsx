import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-12 dark:bg-ink-900">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white font-bold">S</div>
          <div className="text-left">
            <p className="text-sm font-semibold leading-none text-foreground">Spot AI Review</p>
            <p className="text-[11px] text-ink-400 leading-none mt-0.5">by Febble Spot</p>
          </div>
        </Link>
        {children}
      </div>
    </div>
  );
}
