// Rough, provider-published per-1K-token USD rates, used only for admin-facing
// cost estimates — not for billing.
const RATES: Record<string, { input: number; output: number }> = {
  "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  "gpt-4o": { input: 0.0025, output: 0.01 },
  "claude-3-5-haiku-latest": { input: 0.0008, output: 0.004 },
  "claude-3-5-sonnet-latest": { input: 0.003, output: 0.015 },
};

export function estimateCostUsd(model: string, inputTokens = 0, outputTokens = 0) {
  const rate = RATES[model];
  if (!rate) return 0;
  return (inputTokens / 1000) * rate.input + (outputTokens / 1000) * rate.output;
}
