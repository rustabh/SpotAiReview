"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/actions/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await requestPasswordReset({ email: String(formData.get("email") ?? "") });
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <Card>
      <CardHeader className="flex-col items-start pb-4">
        <CardTitle className="text-xl">Reset your password</CardTitle>
        <CardDescription>We&apos;ll help you get back into your account.</CardDescription>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <Alert tone="success">
            If an account exists for that email, we&apos;ve sent a password reset link to it. Check your inbox.
          </Alert>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="you@business.com" />
            </div>
            <Button type="submit" className="w-full" loading={loading}>
              Send reset link
            </Button>
          </form>
        )}
        <p className="mt-5 text-center text-sm text-ink-500">
          <Link href="/login" className="font-medium text-brand-600 hover:underline">Back to login</Link>
        </p>
      </CardContent>
    </Card>
  );
}
