"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { startOrResumeSession, submitLanguage, submitFeedback, submitPrivateFeedback } from "@/actions/public";
import { LanguageStep } from "./steps/language-step";
import { RatingStep } from "./steps/rating-step";
import { ExperienceStep } from "./steps/experience-step";
import { PrivateFeedbackStep } from "./steps/private-feedback-step";
import { AiReviewStep } from "./steps/ai-review-step";
import { PublicFooter } from "./public-footer";
import { Alert } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

type Step = "loading" | "language" | "rating" | "experience" | "private" | "ai" | "done" | "error";

const PROGRESS_STEPS: Step[] = ["language", "rating", "experience", "private", "ai"];

export function ReviewFlow({
  campaignSlug,
  business,
  category,
  ctaText,
  hasGoogleUrl,
}: {
  campaignSlug: string;
  business: {
    name: string;
    logoUrl: string | null;
    coverImageUrl: string | null;
    description: string | null;
    primaryColor: string;
    buttonColor: string;
    defaultLanguage: string;
    allowedLanguages: string[];
  };
  category: { name: string; attributes: { id: string; label: string }[] };
  ctaText: string;
  hasGoogleUrl: boolean;
}) {
  const [step, setStep] = useState<Step>("loading");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [language, setLanguage] = useState(business.defaultLanguage);
  const [rating, setRating] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const storageKey = `spot-ai-session-${campaignSlug}`;
  const progressIndex = PROGRESS_STEPS.indexOf(step);
  const progressPct = progressIndex >= 0 ? ((progressIndex + 1) / PROGRESS_STEPS.length) * 100 : 0;

  useEffect(() => {
    (async () => {
      const existing = typeof window !== "undefined" ? window.sessionStorage.getItem(storageKey) : null;
      const isMobile = typeof window !== "undefined" && /Mobi|Android/i.test(navigator.userAgent);
      const result = await startOrResumeSession({
        campaignSlug,
        existingSessionId: existing,
        deviceType: isMobile ? "mobile" : "desktop",
      });
      if (!result.ok) {
        setErrorMessage(result.error);
        setStep("error");
        return;
      }
      setSessionId(result.sessionId);
      window.sessionStorage.setItem(storageKey, result.sessionId);
      setStep("language");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignSlug]);

  async function handleLanguageSelect(code: string) {
    if (!sessionId) return;
    setLanguage(code);
    await submitLanguage(sessionId, code);
    setStep("rating");
  }

  async function handleRating(value: number) {
    setRating(value);
    setStep("experience");
  }

  async function handleExperienceContinue(selectedAttributes: string[], text: string) {
    if (!sessionId) return;
    const result = await submitFeedback({ sessionId, rating, selectedAttributes, writtenFeedback: text, language });
    if (!result.ok) {
      setErrorMessage(result.error);
      return;
    }
    setStep(rating <= 3 ? "private" : "ai");
  }

  async function handlePrivateSubmit(message: string, contact: string) {
    if (!sessionId) return;
    await submitPrivateFeedback(sessionId, message, contact);
    setStep("ai");
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {progressIndex >= 0 && (
        <div className="fixed inset-x-0 top-0 z-50 h-1 bg-ink-100 dark:bg-ink-800">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-700"
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
      )}

      <div className="mx-auto max-w-md">
        {step === "loading" && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <motion.div
              className="h-6 w-6 rounded-full border-2 border-ink-300 border-t-brand-600"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
            />
          </div>
        )}

        {step === "error" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 pt-16">
            <Alert tone="error">{errorMessage ?? "Something went wrong. Please try again."}</Alert>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === "language" && (
            <motion.div key="language" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25, ease: "easeOut" }}>
              <LanguageStep
                businessName={business.name}
                logoUrl={business.logoUrl}
                description={business.description}
                allowedLanguages={business.allowedLanguages}
                onSelect={handleLanguageSelect}
              />
            </motion.div>
          )}

          {step === "rating" && (
            <motion.div key="rating" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25, ease: "easeOut" }}>
              <RatingStep onContinue={handleRating} buttonColor={business.buttonColor} />
            </motion.div>
          )}

          {step === "experience" && (
            <motion.div key="experience" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25, ease: "easeOut" }}>
              <ExperienceStep attributes={category.attributes} onContinue={handleExperienceContinue} buttonColor={business.buttonColor} />
            </motion.div>
          )}

          {step === "private" && sessionId && (
            <motion.div key="private" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25, ease: "easeOut" }}>
              <PrivateFeedbackStep
                onSubmit={handlePrivateSubmit}
                onSkip={() => setStep("ai")}
                buttonColor={business.buttonColor}
              />
            </motion.div>
          )}

          {step === "ai" && sessionId && (
            <motion.div key="ai" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25, ease: "easeOut" }}>
              <AiReviewStep
                sessionId={sessionId}
                hasGoogleUrl={hasGoogleUrl}
                buttonColor={business.buttonColor}
                onDone={() => setStep("done")}
              />
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center px-6 pt-16 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.1 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500"
              >
                <CheckCircle2 size={34} />
              </motion.div>
              <h2 className="mt-5 font-heading text-xl font-bold tracking-tight text-foreground">Thank you for sharing your experience!</h2>
              <p className="mt-1.5 text-sm text-ink-500">Your feedback helps {business.name} grow.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {errorMessage && step !== "error" && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="px-6 pt-3">
            <Alert tone="error">{errorMessage}</Alert>
          </motion.div>
        )}

        {ctaText && step === "language" && (
          <p className="mt-6 px-6 text-center text-xs text-ink-400">{ctaText}</p>
        )}

        <PublicFooter />
      </div>
    </div>
  );
}
