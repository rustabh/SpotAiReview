"use client";

import { useState } from "react";
import Link from "next/link";
import { createBusinessOwner } from "@/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export default function NewOwnerPage() {
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const input = {
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    };
    const result = await createBusinessOwner(input);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setCreated({ email: input.email, password: result.data.temporaryPassword });
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Create Business Owner" description="Manually onboard a business owner account." />
      <Card>
        <CardContent className="p-6">
          {created ? (
            <div className="space-y-3">
              <Alert tone="success">Business owner account created.</Alert>
              <Alert tone="info">
                No email service is configured in this environment, so share these credentials directly:
                <br /><strong>Email:</strong> {created.email}
                <br /><strong>Password:</strong> {created.password}
              </Alert>
              <Link href="/admin/owners"><Button className="w-full">Back to Owners</Button></Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {error && <Alert tone="error">{error}</Alert>}
              <div><Label htmlFor="name">Name</Label><Input id="name" name="name" required /></div>
              <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
              <div><Label htmlFor="password">Temporary password</Label><Input id="password" name="password" type="text" required minLength={8} placeholder="At least 8 characters" /></div>
              <Button type="submit" className="w-full" loading={loading}>Create Business Owner</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
