"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const LABELS: Record<number, string> = {
  1: "Not great",
  2: "Could be better",
  3: "It was okay",
  4: "Good",
  5: "Excellent!",
};

export function RatingStep({ onContinue, buttonColor }: { onContinue: (rating: number) => void; buttonColor: string }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const shown = hovered || rating;

  return (
    <div className="flex flex-col items-center px-6 pt-16 text-center">
      <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">How was your experience?</h2>
      <p className="mt-1 text-sm text-ink-500">Tap to rate</p>

      <div className="mt-8 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${n} star`}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              size={42}
              strokeWidth={1.5}
              className={shown >= n ? "fill-amber-400 text-amber-400 drop-shadow-sm" : "text-ink-200"}
            />
          </button>
        ))}
      </div>

      <p className="mt-4 h-5 text-sm font-medium text-brand-600">{shown ? LABELS[shown] : ""}</p>

      <Button
        className="mt-8 w-full max-w-xs"
        size="lg"
        disabled={rating === 0}
        style={{ backgroundColor: rating ? buttonColor : undefined }}
        onClick={() => onContinue(rating)}
      >
        Continue
      </Button>
    </div>
  );
}
