"use client";

import { LANGUAGES } from "@/lib/languages";

export function LanguageStep({
  businessName,
  logoUrl,
  description,
  allowedLanguages,
  onSelect,
}: {
  businessName: string;
  logoUrl: string | null;
  description: string | null;
  allowedLanguages: string[];
  onSelect: (code: string) => void;
}) {
  const languages = LANGUAGES.filter((l) => allowedLanguages.includes(l.code));
  const list = languages.length ? languages : LANGUAGES.slice(0, 1);

  return (
    <div className="flex flex-col items-center px-6 pt-12 text-center">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={businessName} className="h-16 w-16 rounded-2xl object-cover shadow-card" />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-bold text-white shadow-card">
          {businessName.charAt(0).toUpperCase()}
        </div>
      )}
      <h1 className="mt-4 text-xl font-semibold text-foreground">{businessName}</h1>
      <p className="mt-1 text-base text-ink-500">How was your experience?</p>
      {description && <p className="mt-2 max-w-sm text-sm text-ink-400">{description}</p>}

      <p className="mt-8 text-sm font-medium text-ink-500">Choose your language</p>
      <div className="mt-3 grid w-full max-w-sm grid-cols-2 gap-2.5">
        {list.map((l) => (
          <button
            key={l.code}
            onClick={() => onSelect(l.code)}
            className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-brand-400 hover:bg-brand-50"
          >
            {l.native}
          </button>
        ))}
      </div>
    </div>
  );
}
