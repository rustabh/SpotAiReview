"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePlatformSettings } from "@/actions/platform";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

type Settings = {
  platformName: string;
  primaryColor: string;
  aiProvider: string;
  aiModel: string;
  defaultSystemPrompt: string;
  maxAIGenerationsPerSession: number;
};

export function PlatformSettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await updatePlatformSettings({
      platformName: String(fd.get("platformName")),
      primaryColor: String(fd.get("primaryColor")),
      aiProvider: String(fd.get("aiProvider")),
      aiModel: String(fd.get("aiModel")),
      defaultSystemPrompt: String(fd.get("defaultSystemPrompt")),
      maxAIGenerationsPerSession: Number(fd.get("maxAIGenerationsPerSession")),
    });
    setLoading(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {saved && <Alert tone="success">Platform settings saved.</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label htmlFor="platformName">Platform name</Label><Input id="platformName" name="platformName" defaultValue={settings.platformName} /></div>
        <div><Label htmlFor="primaryColor">Primary color</Label><Input id="primaryColor" name="primaryColor" type="color" defaultValue={settings.primaryColor} className="h-10 w-full" /></div>
        <div>
          <Label htmlFor="aiProvider">AI provider</Label>
          <Select id="aiProvider" name="aiProvider" defaultValue={settings.aiProvider}>
            <option value="MOCK">Mock (offline, no API key needed)</option>
            <option value="OPENAI">OpenAI</option>
            <option value="ANTHROPIC">Anthropic</option>
            <option value="GEMINI">Gemini (not yet implemented)</option>
          </Select>
        </div>
        <div><Label htmlFor="aiModel">AI model</Label><Input id="aiModel" name="aiModel" defaultValue={settings.aiModel} /></div>
        <div><Label htmlFor="maxAIGenerationsPerSession">Max AI generations per customer session</Label><Input id="maxAIGenerationsPerSession" name="maxAIGenerationsPerSession" type="number" min={1} defaultValue={settings.maxAIGenerationsPerSession} /></div>
      </div>
      <div>
        <Label htmlFor="defaultSystemPrompt">Default AI system prompt</Label>
        <Textarea id="defaultSystemPrompt" name="defaultSystemPrompt" rows={5} defaultValue={settings.defaultSystemPrompt} />
      </div>
      <Button type="submit" loading={loading}>Save Settings</Button>
    </form>
  );
}
