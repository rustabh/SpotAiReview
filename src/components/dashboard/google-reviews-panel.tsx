"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, RefreshCw, Unplug, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import {
  syncGoogleReviewsNow,
  setAutoReplyEnabled,
  disconnectGoogleBusiness,
  updateDraftReply,
  regenerateDraftReply,
  postReplyToGoogle,
  type GoogleReviewsPageData,
  type GoogleReviewView,
} from "@/actions/google-reviews";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={13} className={n <= rating ? "fill-amber-400 text-amber-400" : "text-ink-200"} />
      ))}
    </div>
  );
}

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  NONE: "neutral",
  DRAFTED: "warning",
  POSTED: "success",
  FAILED: "danger",
};

function ReviewCard({ review, businessId }: { review: GoogleReviewView; businessId: string }) {
  const router = useRouter();
  const [text, setText] = useState(review.draftReply ?? "");
  const [busy, setBusy] = useState<"regenerate" | "post" | "save" | null>(null);
  const [error, setError] = useState<string | undefined>();

  async function onRegenerate() {
    setError(undefined);
    setBusy("regenerate");
    const result = await regenerateDraftReply(review.id, businessId);
    setBusy(null);
    if (!result.ok) return setError(result.error);
    router.refresh();
  }

  async function onSave() {
    setBusy("save");
    await updateDraftReply(review.id, businessId, text);
    setBusy(null);
    router.refresh();
  }

  async function onPost() {
    setError(undefined);
    if (text !== review.draftReply) await updateDraftReply(review.id, businessId, text);
    setBusy("post");
    const result = await postReplyToGoogle(review.id, businessId);
    setBusy(null);
    if (!result.ok) return setError(result.error);
    router.refresh();
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{review.reviewerName}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <Stars rating={review.starRating} />
            <span className="text-xs text-ink-400">{formatDate(review.reviewCreatedAt)}</span>
          </div>
        </div>
        <Badge tone={STATUS_TONE[review.replyStatus]}>{review.replyStatus}</Badge>
      </div>

      {review.comment && <p className="mt-3 text-sm text-ink-600">{review.comment}</p>}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {review.replyStatus === "POSTED" ? (
        <div className="mt-3 rounded-xl border border-border bg-ink-50 p-3 text-sm dark:bg-ink-800">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-400">Your reply</p>
          <p className="text-foreground">{review.postedReply}</p>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {review.replyStatus === "FAILED" && review.replyError && (
            <p className="text-xs text-red-600">Last attempt failed: {review.replyError}</p>
          )}
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="AI-drafted reply will appear here…" onBlur={onSave} />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" loading={busy === "regenerate"} disabled={busy !== null} onClick={onRegenerate}>
              <RefreshCw size={13} /> Regenerate
            </Button>
            <Button size="sm" loading={busy === "post"} disabled={busy !== null || !text.trim()} onClick={onPost}>
              Post Reply to Google
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function GoogleReviewsPanel({
  businessId,
  connection,
  reviews,
}: {
  businessId: string;
  connection: NonNullable<GoogleReviewsPageData["connection"]>;
  reviews: GoogleReviewView[];
}) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [togglingAuto, setTogglingAuto] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  async function onSync() {
    setSyncing(true);
    await syncGoogleReviewsNow(businessId);
    setSyncing(false);
    router.refresh();
  }

  async function onToggleAuto() {
    setTogglingAuto(true);
    await setAutoReplyEnabled(businessId, !connection.autoReplyEnabled);
    setTogglingAuto(false);
    router.refresh();
  }

  async function onDisconnect() {
    if (!confirm("Disconnect this Google Business Profile? Reviews already fetched will stay, but syncing and replying will stop.")) return;
    setDisconnecting(true);
    await disconnectGoogleBusiness(businessId);
    setDisconnecting(false);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">{connection.locationTitle ?? "Connected location"}</p>
            <p className="text-xs text-ink-400">
              {connection.lastSyncAt ? `Last synced ${formatDate(connection.lastSyncAt)}` : "Not synced yet"}
              {connection.lastError && <span className="text-red-600"> · {connection.lastError}</span>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onToggleAuto}
              disabled={togglingAuto}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                connection.autoReplyEnabled ? "border-brand-600 bg-brand-600 text-white" : "border-border text-ink-600"
              }`}
            >
              {togglingAuto && <Loader2 size={12} className="animate-spin" />}
              Auto-post replies: {connection.autoReplyEnabled ? "On" : "Off"}
            </button>
            <Button size="sm" variant="outline" loading={syncing} onClick={onSync}>
              <RefreshCw size={13} /> Sync now
            </Button>
            <Button size="sm" variant="outline" loading={disconnecting} onClick={onDisconnect}>
              <Unplug size={13} /> Disconnect
            </Button>
          </div>
        </div>
        {!connection.autoReplyEnabled && (
          <p className="mt-2 text-xs text-ink-400">Auto-post is off — AI drafts a reply for you to review and approve before anything goes live on Google.</p>
        )}
      </Card>

      {reviews.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-ink-400">No reviews synced yet. Click &quot;Sync now&quot; to fetch your latest Google reviews.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} businessId={businessId} />
          ))}
        </div>
      )}
    </div>
  );
}
