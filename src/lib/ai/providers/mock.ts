import type {
  AIGroundingContext,
  AIGenerationResult,
  AIInsightsInput,
  AIInsightsResult,
  AIProvider,
  AITransformInput,
  AITransformResult,
} from "../types";

/**
 * A deterministic, offline provider. It never calls out to the network, so the
 * product works end-to-end in a demo/sandbox without any API key configured.
 * It follows the exact same grounding rules as the real providers: it only
 * ever reassembles words the customer actually gave it.
 */

const TONE_OPENERS: Record<string, string[]> = {
  NATURAL: ["I had a really good experience with", "My visit to", "I recently visited"],
  PROFESSIONAL: ["I would like to share my experience with", "My experience with"],
  FRIENDLY: ["Just wanted to share — my time at", "Had a lovely time at"],
  CASUAL: ["Honestly, my time at", "So I went to"],
  DETAILED: ["I recently had the opportunity to experience", "My complete experience with"],
};

function attributeSentence(attributes: string[]) {
  if (!attributes.length) return "";
  if (attributes.length === 1) return `The ${attributes[0].toLowerCase()} stood out to me.`;
  const last = attributes[attributes.length - 1];
  const rest = attributes.slice(0, -1).join(", ");
  return `I particularly appreciated the ${rest.toLowerCase()} and ${last.toLowerCase()}.`;
}

function ratingSentence(rating: number) {
  if (rating >= 4) return "Overall it was a great experience and I'd happily go back.";
  if (rating === 3) return "Overall it was a decent experience with some room for improvement.";
  return "Overall the experience did not fully meet my expectations.";
}

function sanitizeCustomerText(text: string) {
  return text
    .replace(/\bignore (all|the) (previous|above)[^.]*\./gi, "")
    .replace(/\bsystem:\s*/gi, "")
    .trim();
}

function buildNatural(ctx: AIGroundingContext) {
  const opener = TONE_OPENERS[ctx.tone]?.[0] ?? TONE_OPENERS.NATURAL[0];
  const feedback = sanitizeCustomerText(ctx.customerFeedback);
  const parts = [
    `${opener} ${ctx.businessName}.`,
    attributeSentence(ctx.selectedAttributes),
    feedback ? feedback.charAt(0).toUpperCase() + feedback.slice(1).replace(/\.?$/, ".") : "",
    ratingSentence(ctx.rating),
  ].filter(Boolean);
  return parts.join(" ");
}

function buildShort(ctx: AIGroundingContext) {
  const highlight = ctx.selectedAttributes[0]?.toLowerCase();
  if (highlight) {
    return `${ratingSentence(ctx.rating).replace("Overall it was a", "").replace("Overall the experience did not fully meet my expectations", "Not a great experience")} Good ${highlight} at ${ctx.businessName}.`.trim();
  }
  return `${ratingSentence(ctx.rating)} — ${ctx.businessName}.`;
}

function buildDetailed(ctx: AIGroundingContext) {
  const opener = TONE_OPENERS[ctx.tone]?.[1] ?? TONE_OPENERS.NATURAL[1];
  const feedback = sanitizeCustomerText(ctx.customerFeedback);
  const parts = [
    `${opener} ${ctx.businessName}.`,
    ctx.services?.length ? `I came in for ${ctx.services.slice(0, 2).join(" and ")}.` : "",
    attributeSentence(ctx.selectedAttributes),
    feedback ? feedback.charAt(0).toUpperCase() + feedback.slice(1).replace(/\.?$/, ".") : "",
    ratingSentence(ctx.rating),
  ].filter(Boolean);
  return parts.join(" ");
}

export class MockAIProvider implements AIProvider {
  readonly name = "MOCK" as const;
  readonly model = "spot-mock-v1";

  async generateDrafts(ctx: AIGroundingContext): Promise<AIGenerationResult> {
    return {
      provider: this.name,
      model: this.model,
      inputTokens: 0,
      outputTokens: 0,
      variants: [
        { variant: "NATURAL", content: buildNatural(ctx) },
        { variant: "SHORT", content: buildShort(ctx) },
        { variant: "DETAILED", content: buildDetailed(ctx) },
      ],
    };
  }

  async transformDraft(input: AITransformInput): Promise<AITransformResult> {
    const { originalContent, instruction, context } = input;
    let content = originalContent;
    switch (instruction) {
      case "SHORTER": {
        const sentences = originalContent.split(/(?<=[.!?])\s+/);
        content = sentences.slice(0, Math.max(1, Math.ceil(sentences.length / 2))).join(" ");
        break;
      }
      case "MORE_NATURAL":
        content = buildNatural(context);
        break;
      case "MORE_PROFESSIONAL":
        content = buildDetailed(context).replace(/^I recently had the opportunity to experience/, "I would like to share my experience with");
        break;
      case "REGENERATE":
        content = buildDetailed(context);
        break;
    }
    return { content, provider: this.name, model: this.model, inputTokens: 0, outputTokens: 0 };
  }

  async generateInsights(input: AIInsightsInput): Promise<AIInsightsResult> {
    const counts = new Map<string, number>();
    const phraseCounts = new Map<string, number>();
    let positiveCount = 0;
    let negativeCount = 0;

    for (const sample of input.feedbackSamples) {
      for (const attr of sample.attributes) counts.set(attr, (counts.get(attr) ?? 0) + 1);
      if (sample.rating >= 4) positiveCount++;
      if (sample.rating <= 2) negativeCount++;
      const words = (sample.text ?? "").toLowerCase().match(/[a-z]{4,}/g) ?? [];
      for (const w of words) phraseCounts.set(w, (phraseCounts.get(w) ?? 0) + 1);
    }

    const sortedAttrs = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const positiveThemes = sortedAttrs.filter(([, c]) => c >= 2).slice(0, 5).map(([label]) => label);
    const improvementThemes = negativeCount > 0 ? sortedAttrs.slice(-3).map(([label]) => label) : [];
    const commonPhrases = [...phraseCounts.entries()]
      .filter(([, c]) => c >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    return {
      positiveThemes,
      improvementThemes,
      commonPhrases,
      summary:
        input.feedbackSamples.length === 0
          ? "No feedback collected yet — insights will appear once customers start responding."
          : `Based on ${input.feedbackSamples.length} responses (${positiveCount} rated 4★ or higher), ${positiveThemes[0] ?? "overall experience"} is the most frequently mentioned positive theme for ${input.businessName}.`,
    };
  }
}
