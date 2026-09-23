"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory } from "@/actions/admin";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { X, Plus } from "lucide-react";

export function CategoryForm() {
  const router = useRouter();
  const [attributes, setAttributes] = useState<string[]>(["Service", "Quality", "Staff"]);
  const [questions, setQuestions] = useState<string[]>([""]);
  const [attrInput, setAttrInput] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  function addAttribute() {
    const value = attrInput.trim();
    if (!value || attributes.includes(value)) return;
    setAttributes([...attributes, value]);
    setAttrInput("");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const input = {
      name: String(fd.get("name")),
      description: String(fd.get("description") ?? ""),
      aiContext: String(fd.get("aiContext") ?? ""),
      attributes,
      questions: questions.filter((q) => q.trim()),
    };
    const result = await createCategory(input);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      <div>
        <Label htmlFor="name">Category name *</Label>
        <Input id="name" name="name" required placeholder="e.g. Interior Design Studio" />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>
      <div>
        <Label htmlFor="aiContext">AI context</Label>
        <Textarea id="aiContext" name="aiContext" rows={2} placeholder="Guidance for the AI when writing reviews for this category" />
      </div>

      <div>
        <Label>Experience attributes (chips shown to customers) *</Label>
        <div className="mb-2 flex flex-wrap gap-2">
          {attributes.map((a) => (
            <span key={a} className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              {a}
              <button type="button" onClick={() => setAttributes(attributes.filter((x) => x !== a))}><X size={12} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={attrInput}
            onChange={(e) => setAttrInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAttribute(); } }}
            placeholder="e.g. Cleanliness"
          />
          <Button type="button" variant="outline" onClick={addAttribute}><Plus size={14} /></Button>
        </div>
      </div>

      <div>
        <Label>Follow-up questions (optional)</Label>
        {questions.map((q, i) => (
          <div key={i} className="mb-2 flex gap-2">
            <Input
              value={q}
              onChange={(e) => setQuestions(questions.map((x, idx) => (idx === i ? e.target.value : x)))}
              placeholder="e.g. What service did you get?"
            />
            <Button type="button" variant="outline" size="icon" onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))}><X size={14} /></Button>
          </div>
        ))}
        <Button type="button" size="sm" variant="outline" onClick={() => setQuestions([...questions, ""])}><Plus size={14} /> Add question</Button>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" loading={loading}>Create Category</Button>
      </div>
    </form>
  );
}
