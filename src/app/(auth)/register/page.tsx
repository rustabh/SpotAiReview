"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerBusinessOwner } from "@/actions/auth";
import { loginAction } from "@/actions/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const input = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };
    const result = await registerBusinessOwner(input);
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }
    const loginResult = await loginAction(undefined, formData);
    if (loginResult?.error) {
      setLoading(false);
      router.push("/login");
    }
  }

  return (
    <Card>
      <CardHeader className="flex-col items-start pb-4">
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>Start collecting genuine customer feedback in minutes.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <div>
            <Label htmlFor="name">Your name</Label>
            <Input id="name" name="name" required placeholder="Rustabh Chauhan" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@business.com" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" />
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-ink-400">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-ink-600">Terms</Link> and{" "}
          <Link href="/privacy" className="underline hover:text-ink-600">Privacy Policy</Link>.
        </p>
        <p className="mt-5 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
