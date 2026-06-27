import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/guard";
import { listAuditLogs } from "@/server/repositories/misc";
import { formatDate, formatTime } from "@/lib/date";
import { PageHeader } from "@/components/common/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/empty-state";

export const metadata: Metadata = { title: "Audit Logs" };

export default async function AuditLogsPage() {
  await requirePermission("auditlog.view");
  const logs = listAuditLogs();

  return (
    <>
      <PageHeader title="Audit Logs" description="An immutable trail of who did what." />
      <Card>
        {logs.length === 0 ? (
          <EmptyState title="No activity logged yet" />
        ) : (
          <ul className="divide-y divide-border">
            {logs.map((log) => (
              <li key={log.id} className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">{log.summary}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.entity} · {formatDate(log.createdAt)} at {formatTime(log.createdAt)}
                  </p>
                </div>
                <Badge tone="neutral" className="font-mono">{log.action}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
