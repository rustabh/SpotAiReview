import { getAuditLogs } from "@/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollText } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default async function AuditLogsPage() {
  const logs = await getAuditLogs(100);

  return (
    <div>
      <PageHeader title="Audit Logs" description="A record of sensitive Super Admin actions, including every 'Login as Owner' event." />
      {logs.length === 0 ? (
        <EmptyState icon={ScrollText} title="No audit events yet" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Target</th>
                <th className="px-4 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{log.action}</td>
                  <td className="px-4 py-3 text-ink-500">{log.actor?.name ?? "System"}</td>
                  <td className="px-4 py-3 text-ink-500">{log.targetType}{log.targetId ? ` · ${log.targetId.slice(0, 8)}…` : ""}</td>
                  <td className="px-4 py-3 text-ink-500">{formatDateTime(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
