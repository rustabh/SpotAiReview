"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea, Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export function PrivateFeedbackStep({
  onSubmit,
  onSkip,
  buttonColor,
}: {
  onSubmit: (message: string, contact: string) => Promise<void>;
  onSkip: () => void;
  buttonColor: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);

  if (!showForm) {
    return (
      <div className="px-6 pt-14 text-center">
        <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">Would you like to share private feedback with the business?</h2>
        <p className="mt-2 text-sm text-ink-500">This goes directly to the business, not to a public review.</p>
        <div className="mt-8 flex flex-col gap-2.5">
          <Button size="lg" style={{ backgroundColor: buttonColor }} onClick={() => setShowForm(true)}>Yes, share feedback</Button>
          <Button size="lg" variant="outline" onClick={onSkip}>No, continue</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-10">
      <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">Tell the business what happened</h2>
      <Alert tone="info" className="mt-3">This is sent privately to the business — it won&apos;t become a public review.</Alert>
      <Textarea rows={5} className="mt-4" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What could have been better?" />
      <div className="mt-3">
        <Label htmlFor="contact">Contact info (optional)</Label>
        <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Phone or email, if you'd like a follow-up" />
      </div>
      <Button
        className="mt-5 w-full"
        size="lg"
        style={{ backgroundColor: buttonColor }}
        loading={loading}
        disabled={!message.trim()}
        onClick={async () => {
          setLoading(true);
          await onSubmit(message, contact);
          setLoading(false);
        }}
      >
        Send Feedback
      </Button>
    </div>
  );
}
