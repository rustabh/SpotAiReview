"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptInviteNewUser } from "@/actions/team";
import { loginAction } from "@/actions/session";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function InviteAcceptForm({ token, email }: { token: string; email: string }) {
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
      password: String(formData.get("password") ?? ""),
    };
    const result = await acceptInviteNewUser(token, input);
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const loginData = new FormData();
    loginData.set("email", email);
    loginData.set("password", input.password);
    loginData.set("next", "/dashboard");
    const loginResult = await loginAction(undefined, loginData);
    if (loginResult?.error) {
      setLoading(false);
      router.push("/login");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      <div>
        <Label>Email</Label>
        <Input value={email} disabled />
      </div>
      <div>
        <Label htmlFor="name">Your name</Label>
        <Input id="name" name="name" required placeholder="Your name" />
      </div>
      <div>
        <Label htmlFor="password">Choose a password</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" />
      </div>
      <Button type="submit" className="w-full" loading={loading}>
        Create account &amp; join
      </Button>
    </form>
  );
}
