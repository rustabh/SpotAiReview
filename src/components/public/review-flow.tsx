"use client";

import { useEffect, useState } from "react";
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
      <div className="mx-auto max-w-md">
        {step === "loading" && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-300 border-t-brand-600" />
          </div>
        )}

        {step === "error" && (
          <div className="px-6 pt-16">
            <Alert tone="error">{errorMessage ?? "Something went wrong. Please try again."}</Alert>
          </div>
        )}

        {step === "language" && (
          <LanguageStep
            businessName={business.name}
            logoUrl={business.logoUrl}
            description={business.description}
            allowedLanguages={business.allowedLanguages}
            onSelect={handleLanguageSelect}
          />
        )}

        {step === "rating" && <RatingStep onContinue={handleRating} buttonColor={business.buttonColor} />}

        {step === "experience" && (
          <ExperienceStep attributes={category.attributes} onContinue={handleExperienceContinue} buttonColor={business.buttonColor} />
        )}

        {step === "private" && sessionId && (
          <PrivateFeedbackStep
            onSubmit={handlePrivateSubmit}
            onSkip={() => setStep("ai")}
            buttonColor={business.buttonColor}
          />
        )}

        {step === "ai" && sessionId && (
          <AiReviewStep
            sessionId={sessionId}
            hasGoogleUrl={hasGoogleUrl}
            buttonColor={business.buttonColor}
            onDone={() => setStep("done")}
          />
        )}

        {step === "done" && (
          <div className="flex flex-col items-center px-6 pt-16 text-center">
            <CheckCircle2 className="text-emerald-500" size={40} />
            <h2 className="mt-4 text-lg font-semibold text-foreground">Thank you for sharing your experience!</h2>
            <p className="mt-1 text-sm text-ink-500">Your feedback helps {business.name} grow.</p>
          </div>
        )}

        {errorMessage && step !== "error" && (
          <div className="px-6 pt-3">
            <Alert tone="error">{errorMessage}</Alert>
          </div>
        )}

        {ctaText && step === "language" && (
          <p className="mt-6 px-6 text-center text-xs text-ink-400">{ctaText}</p>
        )}

        <PublicFooter />
      </div>
    </div>
  );
}
