"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inviteTeamMember, removeTeamMember } from "@/actions/team";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { UserMinus } from "lucide-react";

type Member = { id: string; role: string; user: { id: string; name: string; email: string } };

export function TeamManager({ businessId, members, canManage }: { businessId: string; members: Member[]; canManage: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function onInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setSuccess(undefined);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await inviteTeamMember(businessId, String(fd.get("email")), fd.get("role") as "MANAGER" | "STAFF");
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess("Team member added.");
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  async function onRemove(memberId: string) {
    await removeTeamMember(businessId, memberId);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-border">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">{m.user.name}</p>
              <p className="text-xs text-ink-400">{m.user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{m.role}</Badge>
              {canManage && m.role !== "OWNER" && (
                <button onClick={() => onRemove(m.id)} className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600" title="Remove">
                  <UserMinus size={14} />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {canManage && (
        <form onSubmit={onInvite} className="flex flex-wrap items-end gap-2 rounded-xl border border-border p-3">
          {error && <Alert tone="error" className="w-full">{error}</Alert>}
          {success && <Alert tone="success" className="w-full">{success}</Alert>}
          <div className="flex-1 min-w-[180px]">
            <Label htmlFor={`email-${businessId}`}>Email</Label>
            <Input id={`email-${businessId}`} name="email" type="email" required placeholder="teammate@business.com" />
          </div>
          <div>
            <Label htmlFor={`role-${businessId}`}>Role</Label>
            <Select id={`role-${businessId}`} name="role" defaultValue="STAFF">
              <option value="MANAGER">Manager — analytics &amp; campaigns</option>
              <option value="STAFF">Staff — view feedback only</option>
            </Select>
          </div>
          <Button type="submit" size="sm" loading={loading}>Invite</Button>
        </form>
      )}
    </div>
  );
}
