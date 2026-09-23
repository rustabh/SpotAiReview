"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

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
    <div className="px-6 pt-10">
      <h2 className="text-lg font-semibold text-foreground">What did you like about your experience?</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {attributes.map((a) => (
          <button
            key={a.id}
            onClick={() => toggle(a.label)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              selected.includes(a.label) ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border text-ink-600"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

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
    </div>
  );
}
