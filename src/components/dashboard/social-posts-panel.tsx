"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Facebook, Instagram, RefreshCw, Unplug, Loader2, Sparkles, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import {
  generateSocialPost,
  setSocialAutoPostEnabled,
  disconnectSocial,
  updateSocialCaption,
  regenerateSocialCaption,
  postSocialNow,
  deleteSocialPost,
  type SocialPageData,
  type SocialPostView,
} from "@/actions/social";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  DRAFT: "warning",
  POSTED: "success",
  PARTIAL: "warning",
  FAILED: "danger",
};

function PostCard({ post, businessId, hasFacebook, hasInstagram }: { post: SocialPostView; businessId: string; hasFacebook: boolean; hasInstagram: boolean }) {
  const router = useRouter();
  const [caption, setCaption] = useState(post.caption);
  const [busy, setBusy] = useState<"regenerate" | "post" | "save" | "delete" | null>(null);
  const [error, setError] = useState<string | undefined>();

  const isLive = post.status === "POSTED" || post.status === "PARTIAL";

  async function onRegenerate() {
    setError(undefined);
    setBusy("regenerate");
    const result = await regenerateSocialCaption(post.id, businessId);
    setBusy(null);
    if (!result.ok) return setError(result.error);
    router.refresh();
  }

  async function onSave() {
    if (caption === post.caption) return;
    setBusy("save");
    await updateSocialCaption(post.id, businessId, caption);
    setBusy(null);
    router.refresh();
  }

  async function onPost() {
    setError(undefined);
    if (caption !== post.caption) await updateSocialCaption(post.id, businessId, caption);
    setBusy("post");
    const result = await postSocialNow(post.id, businessId);
    setBusy(null);
    if (!result.ok) return setError(result.error);
    router.refresh();
  }

  async function onDelete() {
    if (!confirm("Delete this draft post?")) return;
    setBusy("delete");
    const result = await deleteSocialPost(post.id, businessId);
    setBusy(null);
    if (!result.ok) return setError(result.error);
    router.refresh();
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-4 p-4 sm:flex-row">
        <div className="h-40 w-full shrink-0 overflow-hidden rounded-xl bg-ink-100 sm:h-32 sm:w-32 dark:bg-ink-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.imageUrl} alt={post.productName ?? "Post image"} className="h-full w-full object-cover" loading="lazy" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              {post.productName && <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{post.productName}</p>}
              <p className="text-xs text-ink-400">{formatDate(post.createdAt)}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge tone={STATUS_TONE[post.status]}>{post.status}</Badge>
              {post.facebookPostId && <Facebook size={14} className="text-brand-600" />}
              {post.instagramPostId && <Instagram size={14} className="text-brand-600" />}
            </div>
          </div>

          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          {post.status === "FAILED" && post.error && !error && <p className="mt-2 text-xs text-red-600">Last attempt failed: {post.error}</p>}
          {post.status === "PARTIAL" && post.error && !error && <p className="mt-2 text-xs text-amber-600">Posted partially: {post.error}</p>}

          {isLive ? (
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{post.caption}</p>
          ) : (
            <div className="mt-2 space-y-2">
              <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} onBlur={onSave} />
              {post.hashtags.length > 0 && <p className="text-xs text-ink-400">{post.hashtags.map((h) => `#${h}`).join(" ")}</p>}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" loading={busy === "regenerate"} disabled={busy !== null} onClick={onRegenerate}>
                  <RefreshCw size={13} /> Regenerate
                </Button>
                <Button size="sm" loading={busy === "post"} disabled={busy !== null || !caption.trim() || (!hasFacebook && !hasInstagram)} onClick={onPost}>
                  Post Now
                </Button>
                <Button size="sm" variant="outline" loading={busy === "delete"} disabled={busy !== null} onClick={onDelete}>
                  <Trash2 size={13} /> Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function SocialPostsPanel({
  businessId,
  connection,
  posts,
}: {
  businessId: string;
  connection: NonNullable<SocialPageData["connection"]>;
  posts: SocialPostView[];
}) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [togglingAuto, setTogglingAuto] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function onGenerate() {
    setError(undefined);
    setGenerating(true);
    const result = await generateSocialPost(businessId);
    setGenerating(false);
    if (!result.ok) return setError(result.error);
    router.refresh();
  }

  async function onToggleAuto() {
    setTogglingAuto(true);
    await setSocialAutoPostEnabled(businessId, !connection.autoPostEnabled);
    setTogglingAuto(false);
    router.refresh();
  }

  async function onDisconnect() {
    if (!confirm("Disconnect Facebook/Instagram? Past posts stay recorded, but new posts and auto-posting will stop.")) return;
    setDisconnecting(true);
    await disconnectSocial(businessId);
    setDisconnecting(false);
    router.refresh();
  }

  const hasFacebook = Boolean(connection.facebookPageName);
  const hasInstagram = Boolean(connection.instagramUsername);

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <Facebook size={15} className="text-brand-600" /> {connection.facebookPageName}
            </p>
            {hasInstagram ? (
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-400">
                <Instagram size={12} /> @{connection.instagramUsername}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-ink-400">No Instagram account linked to this Page.</p>
            )}
            {connection.lastError && <p className="mt-1 text-xs text-red-600">{connection.lastError}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onToggleAuto}
              disabled={togglingAuto}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                connection.autoPostEnabled ? "border-brand-600 bg-brand-600 text-white" : "border-border text-ink-600"
              }`}
            >
              {togglingAuto && <Loader2 size={12} className="animate-spin" />}
              Auto-post: {connection.autoPostEnabled ? "On" : "Off"}
            </button>
            <Button size="sm" loading={generating} onClick={onGenerate}>
              <Sparkles size={13} /> Generate New Post
            </Button>
            <Button size="sm" variant="outline" loading={disconnecting} onClick={onDisconnect}>
              <Unplug size={13} /> Disconnect
            </Button>
          </div>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        {!connection.autoPostEnabled && (
          <p className="mt-2 text-xs text-ink-400">Auto-post is off — AI drafts a post for you to review and approve before anything goes live.</p>
        )}
      </Card>

      {posts.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-ink-400">No posts yet. Click &quot;Generate New Post&quot; and AI will pick a menu photo and write a caption.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} businessId={businessId} hasFacebook={hasFacebook} hasInstagram={hasInstagram} />
          ))}
        </div>
      )}
    </div>
  );
}
