"use client";

import { motion } from "framer-motion";
import { LANGUAGES } from "@/lib/languages";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

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
    <motion.div initial="hidden" animate="show" variants={container} className="flex flex-col items-center px-6 pt-12 text-center">
      <motion.div variants={{ hidden: { opacity: 0, scale: 0.7 }, show: { opacity: 1, scale: 1 } }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={businessName} className="h-16 w-16 rounded-2xl object-cover shadow-soft" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-bold text-white shadow-soft">
            {businessName.charAt(0).toUpperCase()}
          </div>
        )}
      </motion.div>
      <motion.h1 variants={item} className="mt-4 font-heading text-xl font-bold tracking-tight text-foreground">{businessName}</motion.h1>
      <motion.p variants={item} className="mt-1 text-base text-ink-500">How was your experience?</motion.p>
      {description && <motion.p variants={item} className="mt-2 max-w-sm text-sm text-ink-400">{description}</motion.p>}

      <motion.p variants={item} className="mt-8 text-sm font-medium text-ink-500">Choose your language</motion.p>
      <motion.div variants={container} className="mt-3 grid w-full max-w-sm grid-cols-2 gap-2.5">
        {list.map((l) => (
          <motion.button
            key={l.code}
            variants={item}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(l.code)}
            className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground shadow-card transition-colors hover:border-brand-400 hover:bg-brand-50 hover:shadow-soft"
          >
            {l.native}
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}
