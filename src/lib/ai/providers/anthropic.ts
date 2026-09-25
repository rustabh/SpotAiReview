import type {
  AIBlogArticleResult,
  AIGroundingContext,
  AIGenerationResult,
  AIInsightsInput,
  AIInsightsResult,
  AIProvider,
  AITransformInput,
  AITransformResult,
} from "../types";
import { SYSTEM_PROMPT, buildBlogArticlePrompt, buildGenerateDraftsPrompt, buildInsightsPrompt, buildTransformPrompt } from "../prompts";

const API_URL = "https://api.anthropic.com/v1/messages";

function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
}

export class AnthropicProvider implements AIProvider {
  readonly name = "ANTHROPIC" as const;
  readonly model: string;
  private apiKey: string;

  constructor(apiKey: string, model = "claude-3-5-haiku-latest") {
    this.apiKey = apiKey;
    this.model = model;
  }

  private async messages(userPrompt: string, maxTokens = 600) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: maxTokens,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Anthropic request failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const content: string = data.content?.[0]?.text ?? "";
    const inputTokens: number | undefined = data.usage?.input_tokens;
    const outputTokens: number | undefined = data.usage?.output_tokens;
    return { content, inputTokens, outputTokens };
  }

  async generateDrafts(ctx: AIGroundingContext): Promise<AIGenerationResult> {
    const { content, inputTokens, outputTokens } = await this.messages(buildGenerateDraftsPrompt(ctx));
    const parsed = JSON.parse(extractJson(content)) as { natural: string; short: string; detailed: string };
    return {
      provider: this.name,
      model: this.model,
      inputTokens,
      outputTokens,
      variants: [
        { variant: "NATURAL", content: parsed.natural },
        { variant: "SHORT", content: parsed.short },
        { variant: "DETAILED", content: parsed.detailed },
      ],
    };
  }

  async transformDraft(input: AITransformInput): Promise<AITransformResult> {
    const { content, inputTokens, outputTokens } = await this.messages(
      buildTransformPrompt(input.originalContent, input.instruction, input.context)
    );
    return { content: content.trim(), provider: this.name, model: this.model, inputTokens, outputTokens };
  }

  async generateInsights(input: AIInsightsInput): Promise<AIInsightsResult> {
    const { content } = await this.messages(
      buildInsightsPrompt(input.businessName, input.categoryName, input.feedbackSamples)
    );
    return JSON.parse(extractJson(content)) as AIInsightsResult;
  }

  async generateBlogArticle(topic: string): Promise<AIBlogArticleResult> {
    const { content } = await this.messages(buildBlogArticlePrompt(topic), 6000);
    return JSON.parse(extractJson(content)) as AIBlogArticleResult;
  }
}
