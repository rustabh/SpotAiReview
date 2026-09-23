"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RatingStep({ onContinue, buttonColor }: { onContinue: (rating: number) => void; buttonColor: string }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex flex-col items-center px-6 pt-16 text-center">
      <h2 className="text-lg font-semibold text-foreground">How was your experience?</h2>
      <p className="mt-1 text-sm text-ink-500">Tap to rate</p>

      <div className="mt-8 flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${n} star`}
            className="transition-transform active:scale-95"
          >
            <Star
              size={40}
              className={(hovered || rating) >= n ? "fill-amber-400 text-amber-400" : "text-ink-200"}
            />
          </button>
        ))}
      </div>

      <Button
        className="mt-10 w-full max-w-xs"
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
