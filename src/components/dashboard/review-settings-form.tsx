"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateReviewSettings, updateBranding } from "@/actions/settings";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const ALL_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "hi-en", name: "Hinglish" },
  { code: "mr", name: "Marathi" },
  { code: "gu", name: "Gujarati" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "bn", name: "Bengali" },
  { code: "pa", name: "Punjabi" },
];

export function ReviewSettingsForm({
  businessId,
  aiTone,
  aiLength,
  defaultLanguage,
  allowedLanguages,
  logoUrl,
  coverImageUrl,
}: {
  businessId: string;
  aiTone: string;
  aiLength: string;
  defaultLanguage: string;
  allowedLanguages: string[];
  logoUrl: string;
  coverImageUrl: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(allowedLanguages);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [brandingSaved, setBrandingSaved] = useState(false);

  function toggleLanguage(code: string) {
    setSelected((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await updateReviewSettings(businessId, {
      aiTone: String(fd.get("aiTone")),
      aiLength: String(fd.get("aiLength")),
      defaultLanguage: String(fd.get("defaultLanguage")),
      allowedLanguages: selected,
    });
    setLoading(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  async function onBrandingSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await updateBranding(businessId, String(fd.get("logoUrl")), String(fd.get("coverImageUrl")));
    setBrandingSaved(true);
    router.refresh();
    setTimeout(() => setBrandingSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4">
        {saved && <Alert tone="success">Review settings saved.</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="aiTone">AI tone</Label>
            <Select id="aiTone" name="aiTone" defaultValue={aiTone}>
              <option value="NATURAL">Natural</option>
              <option value="PROFESSIONAL">Professional</option>
              <option value="FRIENDLY">Friendly</option>
              <option value="CASUAL">Casual</option>
              <option value="DETAILED">Detailed</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="aiLength">Default review length</Label>
            <Select id="aiLength" name="aiLength" defaultValue={aiLength}>
              <option value="SHORT">Short</option>
              <option value="MEDIUM">Medium</option>
              <option value="DETAILED">Detailed</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="defaultLanguage">Default language</Label>
            <Select id="defaultLanguage" name="defaultLanguage" defaultValue={defaultLanguage}>
              {ALL_LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </Select>
          </div>
        </div>
        <div>
          <Label>Allowed languages on the public review page</Label>
          <div className="flex flex-wrap gap-2">
            {ALL_LANGUAGES.map((l) => (
              <button
                type="button"
                key={l.code}
                onClick={() => toggleLanguage(l.code)}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${selected.includes(l.code) ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border text-ink-500"}`}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" loading={loading}>Save Review Settings</Button>
      </form>

      <form onSubmit={onBrandingSubmit} className="space-y-4 border-t border-border pt-6">
        {brandingSaved && <Alert tone="success">Branding saved.</Alert>}
        <div>
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input id="logoUrl" name="logoUrl" defaultValue={logoUrl} placeholder="https://... (file upload storage not yet connected)" />
        </div>
        <div>
          <Label htmlFor="coverImageUrl">Cover image URL</Label>
          <Input id="coverImageUrl" name="coverImageUrl" defaultValue={coverImageUrl} placeholder="https://..." />
        </div>
        <Button type="submit" variant="outline">Save Branding</Button>
      </form>
    </div>
  );
}
