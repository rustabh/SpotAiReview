"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
      className="flex flex-col items-center px-6 pt-16 text-center"
    >
      <motion.h2
        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
        className="font-heading text-lg font-bold tracking-tight text-foreground"
      >
        How was your experience?
      </motion.h2>
      <motion.p variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="mt-1 text-sm text-ink-500">
        Tap to rate
      </motion.p>

      <div className="mt-8 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button
            key={n}
            variants={{ hidden: { opacity: 0, scale: 0.5 }, show: { opacity: 1, scale: 1 } }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            animate={rating === n ? { scale: [1, 1.3, 1] } : undefined}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${n} star`}
          >
            <Star
              size={42}
              strokeWidth={1.5}
              className={shown >= n ? "fill-amber-400 text-amber-400 drop-shadow-sm" : "text-ink-200"}
            />
          </motion.button>
        ))}
      </div>

      <motion.p
        key={shown}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 h-5 text-sm font-medium text-brand-600"
      >
        {shown ? LABELS[shown] : ""}
      </motion.p>

      <motion.div variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} className="mt-8 w-full max-w-xs">
        <Button
          className="w-full"
          size="lg"
          disabled={rating === 0}
          style={{ backgroundColor: rating ? buttonColor : undefined }}
          onClick={() => onContinue(rating)}
        >
          Continue
        </Button>
      </motion.div>
    </motion.div>
  );
}
