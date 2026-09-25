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

const API_URL = "https://api.openai.com/v1/chat/completions";

export class OpenAIProvider implements AIProvider {
  readonly name = "OPENAI" as const;
  readonly model: string;
  private apiKey: string;

  constructor(apiKey: string, model = "gpt-4o-mini") {
    this.apiKey = apiKey;
    this.model = model;
  }

  private async chat(userPrompt: string, jsonMode: boolean) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.6,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`OpenAI request failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const content: string = data.choices?.[0]?.message?.content ?? "";
    const inputTokens: number | undefined = data.usage?.prompt_tokens;
    const outputTokens: number | undefined = data.usage?.completion_tokens;
    return { content, inputTokens, outputTokens };
  }

  async generateDrafts(ctx: AIGroundingContext): Promise<AIGenerationResult> {
    const { content, inputTokens, outputTokens } = await this.chat(buildGenerateDraftsPrompt(ctx), true);
    const parsed = JSON.parse(content) as { natural: string; short: string; detailed: string };
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
    const { content, inputTokens, outputTokens } = await this.chat(
      buildTransformPrompt(input.originalContent, input.instruction, input.context),
      false
    );
    return { content: content.trim(), provider: this.name, model: this.model, inputTokens, outputTokens };
  }

  async generateInsights(input: AIInsightsInput): Promise<AIInsightsResult> {
    const { content } = await this.chat(
      buildInsightsPrompt(input.businessName, input.categoryName, input.feedbackSamples),
      true
    );
    return JSON.parse(content) as AIInsightsResult;
  }

  async generateBlogArticle(topic: string): Promise<AIBlogArticleResult> {
    const { content } = await this.chat(buildBlogArticlePrompt(topic), true);
    return JSON.parse(content) as AIBlogArticleResult;
  }
}
