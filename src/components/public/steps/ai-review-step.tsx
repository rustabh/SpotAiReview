"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
        <div className="relative flex h-16 w-16 items-center justify-center">
          <motion.span
            className="absolute inset-0 rounded-full bg-brand-500/20"
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft"
          >
            <Sparkles size={20} />
          </motion.div>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-sm font-medium text-foreground"
        >
          Let&apos;s turn your experience into a review…
        </motion.p>
        <div className="mt-3 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-brand-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.1, delay: i * 0.18 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (needMoreInfo) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-6 pt-14">
        <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">Would you like to tell us a little more about your experience?</h2>
        <p className="mt-1 text-sm text-ink-500">A few more words help us write a genuine review that sounds like you.</p>
        <Textarea rows={4} className="mt-4" value={extraDetail} onChange={(e) => setExtraDetail(e.target.value)} placeholder="Example: The staff was friendly and fixed the issue quickly." />
        <Button className="mt-4 w-full" size="lg" style={{ backgroundColor: buttonColor }} loading={submittingDetail} disabled={!extraDetail.trim()} onClick={submitMoreDetail}>
          Generate My Review
        </Button>
      </motion.div>
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-6 pt-8">
      <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">Let&apos;s turn your experience into a review.</h2>

      <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
        {drafts.map((d) => (
          <button
            key={d.id}
            onClick={() => selectDraft(d)}
            className={`relative shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeId === d.id ? "text-white" : "border border-border text-ink-500 hover:border-brand-300"
            }`}
          >
            {activeId === d.id && (
              <motion.span
                layoutId="draft-tab-pill"
                className="absolute inset-0 rounded-full bg-brand-600 shadow-soft"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">{VARIANT_LABELS[d.variant] ?? d.variant}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          <Textarea
            rows={6}
            className="mt-4 shadow-card"
            value={content}
            onChange={(e) => { setContent(e.target.value); setCopied(false); }}
          />
        </motion.div>
      </AnimatePresence>

      {error && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
          <Alert tone="error" className="mt-3">{error}</Alert>
        </motion.div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" loading={actionLoading === "REGENERATE"} onClick={() => applyTransform("REGENERATE")}><RefreshCw size={13} /> Regenerate</Button>
        <Button size="sm" variant="outline" loading={actionLoading === "SHORTER"} onClick={() => applyTransform("SHORTER")}><Scissors size={13} /> Make Shorter</Button>
        <Button size="sm" variant="outline" loading={actionLoading === "MORE_NATURAL"} onClick={() => applyTransform("MORE_NATURAL")}><Wand2 size={13} /> More Natural</Button>
        <Button size="sm" variant="outline" loading={actionLoading === "MORE_PROFESSIONAL"} onClick={() => applyTransform("MORE_PROFESSIONAL")}><Briefcase size={13} /> More Professional</Button>
      </div>

      <p className="mt-4 text-sm font-medium text-foreground">Happy with your review?</p>
      <div className="mt-2 flex flex-col gap-2.5">
        <Button size="lg" variant="outline" onClick={copyReview}>
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span key="copied" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="flex items-center gap-2">
                <Check size={15} /> Copied!
              </motion.span>
            ) : (
              <motion.span key="copy" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="flex items-center gap-2">
                <Copy size={15} /> Copy Review
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
        {hasGoogleUrl ? (
          <Button size="lg" style={{ backgroundColor: buttonColor }} loading={opening} onClick={openGoogle}>
            <ExternalLink size={15} /> Continue to Google
          </Button>
        ) : (
          <Alert tone="info">This business hasn&apos;t connected a Google review link yet — you can still copy your review.</Alert>
        )}
      </div>
    </motion.div>
  );
}
