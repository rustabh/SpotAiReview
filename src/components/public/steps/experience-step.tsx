"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } };

export function ExperienceStep({
  attributes,
  onContinue,
  buttonColor,
}: {
  attributes: { id: string; label: string }[];
  onContinue: (selected: string[], text: string) => void;
  buttonColor: string;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [text, setText] = useState("");

  function toggle(label: string) {
    setSelected((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-6 pt-10">
      <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">What did you like about your experience?</h2>
      <motion.div initial="hidden" animate="show" variants={container} className="mt-4 flex flex-wrap gap-2">
        {attributes.map((a) => {
          const active = selected.includes(a.label);
          return (
            <motion.button
              key={a.id}
              variants={item}
              whileTap={{ scale: 0.92 }}
              animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={() => toggle(a.label)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-brand-600 bg-brand-600 text-white shadow-soft"
                  : "border-border text-ink-600 hover:border-brand-300 hover:bg-brand-50"
              }`}
            >
              {a.label}
            </motion.button>
          );
        })}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <p className="mt-6 text-sm font-medium text-foreground">Tell us a little more about your experience.</p>
        <Textarea
          rows={5}
          className="mt-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Example: The staff was very helpful and the service was quick..."
        />
        <p className="mt-1 text-xs text-ink-400">Optional, but it helps us write a better review draft for you.</p>

        <Button
          className="mt-6 w-full"
          size="lg"
          style={{ backgroundColor: buttonColor }}
          onClick={() => onContinue(selected, text)}
        >
          Continue
        </Button>
      </motion.div>
    </motion.div>
  );
}
