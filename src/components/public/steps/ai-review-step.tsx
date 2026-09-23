"use client";

import { useEffect, useState } from "react";
import { generateAIDrafts, transformDraft, markDraftCopied, recordGoogleClick, addMoreFeedbackDetail } from "@/actions/public";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Sparkles, Copy, ExternalLink, RefreshCw, Wand2, Scissors, Briefcase, Check } from "lucide-react";
import type { TransformInstruction } from "@/lib/ai";

type Draft = { id: string; variant: string; content: string };

const VARIANT_LABELS: Record<string, string> = { NATURAL: "Natural", SHORT: "Short", DETAILED: "Detailed", REGENERATED: "New Version", CUSTOM: "Edited" };

export function AiReviewStep({
  sessionId,
  hasGoogleUrl,
  buttonColor,
  onDone,
}: {
  sessionId: string;
  hasGoogleUrl: boolean;
  buttonColor: string;
  onDone: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [needMoreInfo, setNeedMoreInfo] = useState(false);
  const [extraDetail, setExtraDetail] = useState("");
  const [submittingDetail, setSubmittingDetail] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [actionLoading, setActionLoading] = useState<TransformInstruction | null>(null);
  const [copied, setCopied] = useState(false);
  const [opening, setOpening] = useState(false);

  async function runGeneration() {
    setLoading(true);
    setError(undefined);
    const result = await generateAIDrafts(sessionId);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if ("needMoreInfo" in result.data) {
      setNeedMoreInfo(true);
      return;
    }
    setNeedMoreInfo(false);
    setDrafts(result.data.drafts);
    const first = result.data.drafts[0];
    if (first) {
      setActiveId(first.id);
      setContent(first.content);
    }
  }

  useEffect(() => {
    runGeneration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function submitMoreDetail() {
    if (!extraDetail.trim()) return;
    setSubmittingDetail(true);
    await addMoreFeedbackDetail(sessionId, extraDetail);
    setSubmittingDetail(false);
    await runGeneration();
  }

  function selectDraft(d: Draft) {
    setActiveId(d.id);
    setContent(d.content);
  }

  async function applyTransform(instruction: TransformInstruction) {
    setActionLoading(instruction);
    const result = await transformDraft(sessionId, content, instruction);
    setActionLoading(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setActiveId(result.data.id);
    setContent(result.data.content);
  }

  async function copyReview() {
    await navigator.clipboard.writeText(content);
    if (activeId) await markDraftCopied(sessionId, activeId);
    setCopied(true);
  }

  async function openGoogle() {
    setOpening(true);
    const result = await recordGoogleClick(sessionId);
    setOpening(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    window.open(result.data.url, "_blank", "noopener,noreferrer");
    onDone();
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center px-6 pt-16 text-center">
        <Sparkles className="animate-pulse text-brand-600" size={28} />
        <p className="mt-3 text-sm font-medium text-foreground">Let&apos;s turn your experience into a review…</p>
      </div>
    );
  }

  if (needMoreInfo) {
    return (
      <div className="px-6 pt-14">
        <h2 className="text-lg font-semibold text-foreground">Would you like to tell us a little more about your experience?</h2>
        <p className="mt-1 text-sm text-ink-500">A few more words help us write a genuine review that sounds like you.</p>
        <Textarea rows={4} className="mt-4" value={extraDetail} onChange={(e) => setExtraDetail(e.target.value)} placeholder="Example: The staff was friendly and fixed the issue quickly." />
        <Button className="mt-4 w-full" size="lg" style={{ backgroundColor: buttonColor }} loading={submittingDetail} disabled={!extraDetail.trim()} onClick={submitMoreDetail}>
          Generate My Review
        </Button>
      </div>
    );
  }

  if (error && drafts.length === 0) {
    return (
      <div className="px-6 pt-14">
        <Alert tone="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="px-6 pt-8">
      <h2 className="text-lg font-semibold text-foreground">Let&apos;s turn your experience into a review.</h2>

      <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
        {drafts.map((d) => (
          <button
            key={d.id}
            onClick={() => selectDraft(d)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium ${
              activeId === d.id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border text-ink-500"
            }`}
          >
            {VARIANT_LABELS[d.variant] ?? d.variant}
          </button>
        ))}
      </div>

      <Textarea
        rows={6}
        className="mt-4"
        value={content}
        onChange={(e) => { setContent(e.target.value); setCopied(false); }}
      />

      {error && <Alert tone="error" className="mt-3">{error}</Alert>}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" loading={actionLoading === "REGENERATE"} onClick={() => applyTransform("REGENERATE")}><RefreshCw size={13} /> Regenerate</Button>
        <Button size="sm" variant="outline" loading={actionLoading === "SHORTER"} onClick={() => applyTransform("SHORTER")}><Scissors size={13} /> Make Shorter</Button>
        <Button size="sm" variant="outline" loading={actionLoading === "MORE_NATURAL"} onClick={() => applyTransform("MORE_NATURAL")}><Wand2 size={13} /> More Natural</Button>
        <Button size="sm" variant="outline" loading={actionLoading === "MORE_PROFESSIONAL"} onClick={() => applyTransform("MORE_PROFESSIONAL")}><Briefcase size={13} /> More Professional</Button>
      </div>

      <p className="mt-4 text-sm font-medium text-foreground">Happy with your review?</p>
      <div className="mt-2 flex flex-col gap-2.5">
        <Button size="lg" variant="outline" onClick={copyReview}>
          {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copied!" : "Copy Review"}
        </Button>
        {hasGoogleUrl ? (
          <Button size="lg" style={{ backgroundColor: buttonColor }} loading={opening} onClick={openGoogle}>
            <ExternalLink size={15} /> Continue to Google
          </Button>
        ) : (
          <Alert tone="info">This business hasn&apos;t connected a Google review link yet — you can still copy your review.</Alert>
        )}
      </div>
    </div>
  );
}
