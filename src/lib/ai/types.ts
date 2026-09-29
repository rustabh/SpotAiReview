export type ReviewToneKey = "NATURAL" | "PROFESSIONAL" | "FRIENDLY" | "CASUAL" | "DETAILED";
export type ReviewLengthKey = "SHORT" | "MEDIUM" | "DETAILED";
export type DraftVariantKey = "NATURAL" | "SHORT" | "DETAILED";
export type TransformInstruction =
  | "SHORTER"
  | "MORE_NATURAL"
  | "MORE_PROFESSIONAL"
  | "REGENERATE";

/**
 * Every fact the AI is allowed to use. Nothing outside of this object may be
 * introduced into a review — this is the grounding contract described in the
 * product spec: the AI must never invent products, staff, prices or events.
 */
export interface AIGroundingContext {
  businessName: string;
  categoryName: string;
  businessDescription?: string | null;
  services?: string[];
  rating: number;
  selectedAttributes: string[];
  customerFeedback: string;
  language: string;
  tone: ReviewToneKey;
}

export interface AIDraftVariantResult {
  variant: DraftVariantKey;
  content: string;
}

export interface AIGenerationResult {
  variants: AIDraftVariantResult[];
  provider: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface AITransformInput {
  originalContent: string;
  instruction: TransformInstruction;
  context: AIGroundingContext;
}

export interface AITransformResult {
  content: string;
  provider: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface AIInsightsFeedbackSample {
  rating: number;
  attributes: string[];
  text: string | null;
}

export interface AIInsightsInput {
  businessName: string;
  categoryName: string;
  feedbackSamples: AIInsightsFeedbackSample[];
}

export interface AIInsightsResult {
  positiveThemes: string[];
  improvementThemes: string[];
  commonPhrases: string[];
  summary: string;
}

export interface AIReviewReplyInput {
  businessName: string;
  categoryName: string;
  businessDescription?: string | null;
  reviewerName: string;
  starRating: number; // 1-5
  reviewComment: string | null;
  language?: string;
}

export interface AIReviewReplyResult {
  content: string;
  provider: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface AIGmbAuditCheckInput {
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
  recommendation: string | null;
}

export interface AIGmbAuditSummaryInput {
  businessName: string;
  categoryName: string;
  score: number;
  checks: AIGmbAuditCheckInput[];
}

export interface AIGmbAuditSummaryResult {
  content: string;
  provider: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface AISocialCaptionInput {
  businessName: string;
  categoryName: string;
  productName: string;
  productDescription?: string | null;
  isVeg?: boolean | null;
}

export interface AISocialCaptionResult {
  caption: string;
  hashtags: string[];
  provider: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface AIBlogArticleResult {
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  category: string;
  keywords: string[];
  readingMinutes: number;
  content: string; // Markdown body
}

export interface AIProvider {
  readonly name: "OPENAI" | "ANTHROPIC" | "GEMINI" | "MOCK";
  readonly model: string;
  generateDrafts(input: AIGroundingContext): Promise<AIGenerationResult>;
  transformDraft(input: AITransformInput): Promise<AITransformResult>;
  generateInsights(input: AIInsightsInput): Promise<AIInsightsResult>;
  generateBlogArticle(topic: string): Promise<AIBlogArticleResult>;
  generateReviewReply(input: AIReviewReplyInput): Promise<AIReviewReplyResult>;
  generateGmbAuditSummary(input: AIGmbAuditSummaryInput): Promise<AIGmbAuditSummaryResult>;
  generateSocialCaption(input: AISocialCaptionInput): Promise<AISocialCaptionResult>;
}

/** Minimum signal required before we let AI write anything at all. */
export function hasEnoughSignal(ctx: Pick<AIGroundingContext, "customerFeedback" | "selectedAttributes">) {
  const words = ctx.customerFeedback?.trim().split(/\s+/).filter(Boolean).length ?? 0;
  return words >= 4 || ctx.selectedAttributes.length >= 1;
}
