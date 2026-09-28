import type { $Enums } from "@prisma/client";

/** The tag-based reaction shown at the bill instead of a star rating — order matters, most positive first. */
export const RATING_OPTIONS: { value: $Enums.RatingSentiment; label: string }[] = [
  { value: "MOST_RECOMMENDED", label: "Most Recommended" },
  { value: "WOULD_RECOMMEND", label: "Would Recommend" },
  { value: "OKAY", label: "It Was Okay" },
  { value: "COULD_BE_BETTER", label: "Could Be Better" },
];
