"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/logo-mark";

const DISMISS_KEY = "airev-install-dismissed-at";
const SNOOZE_DAYS = 14;
const SHOW_DELAY_MS = 2500;

type Mode = "android" | "ios";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isSnoozed() {
  const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
  return Date.now() < dismissedAt + SNOOZE_DAYS * 24 * 60 * 60 * 1000;
}

export function InstallPrompt() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone() || isSnoozed()) return;

    let timer: ReturnType<typeof setTimeout>;

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setMode("android");
      timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    }

    function onInstalled() {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
      setVisible(false);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari never fires beforeinstallprompt — there's no programmatic install,
    // so offer the manual "Add to Home Screen" steps instead.
    if (isIos()) {
      setMode("ios");
      timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      clearTimeout(timer);
    };
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDeferredPrompt(null);
    setVisible(false);
  }, [deferredPrompt]);

  return (
    <AnimatePresence>
      {visible && mode && (
        <motion.div
          role="dialog"
          aria-label="Install AiReview"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="fixed inset-x-4 z-50 mx-auto max-w-sm rounded-2xl border border-border bg-surface p-4 shadow-soft md:inset-x-auto md:right-6 md:left-auto"
          style={{ bottom: "calc(6.5rem + env(safe-area-inset-bottom))" }}
        >
          <button
            onClick={dismiss}
            className="absolute right-3 top-3 rounded-full p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600 dark:hover:bg-ink-800"
            aria-label="Dismiss"
          >
            <X size={15} />
          </button>

          <div className="flex items-start gap-3 pr-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/30">
              <LogoMark size={22} />
            </div>
            <div className="min-w-0">
              <p className="font-heading text-sm font-bold text-foreground">Install AiReview</p>
              {mode === "android" ? (
                <p className="mt-0.5 text-xs leading-relaxed text-ink-500">
                  Add it to your home screen for quick, full-screen access — no browser tabs.
                </p>
              ) : (
                <p className="mt-0.5 text-xs leading-relaxed text-ink-500">
                  Tap <Share size={12} className="mb-0.5 inline-block text-ink-600 dark:text-ink-300" /> in Safari,
                  then <span className="font-medium text-foreground">Add to Home Screen</span>.
                </p>
              )}
            </div>
          </div>

          {mode === "android" && (
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={dismiss}>
                Not now
              </Button>
              <Button size="sm" onClick={install}>
                <Download size={14} /> Install
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
