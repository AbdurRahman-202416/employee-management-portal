import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, UserRound, FileText, MessageSquare } from "lucide-react";
import { requireUser } from "@/server/auth/guard";
import { can } from "@/lib/permissions";
import { getLateEntry } from "@/server/repositories/applications";
import { getEmployee } from "@/server/repositories/employees";
import { fullName } from "@/lib/format";
import { formatDate } from "@/lib/date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";

export default async function LateEntryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const entry = getLateEntry(id);
  if (!entry) notFound();

  const isOwner = entry.employeeId === user.id;
  if (!isOwner && !can(user, "lateentry.view.all")) redirect("/late-entry");

  const applicant = getEmployee(entry.employeeId);
  const reviewer = entry.reviewedById ? getEmployee(entry.reviewedById) : undefined;

  return (
    <div className="space-y-6">
      <Link href="/late-entry" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to late entry
      </Link>

      <Card>
        <CardHeader className="gap-2">
          <div className="flex items-center justify-between">
            <CardTitle>Late Entry</CardTitle>
            <StatusBadge kind="application" value={entry.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span className="text-foreground">{formatDate(entry.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserRound className="h-4 w-4" />
              <span className="text-foreground">Applicant: {applicant ? fullName(applicant.firstName, applicant.lastName) : "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserRound className="h-4 w-4" />
              <span className="text-foreground">Reviewed by: {reviewer ? fullName(reviewer.firstName, reviewer.lastName) : "—"}</span>
            </div>
          </div>
          <div className="space-y-1.5 border-t border-border pt-4">
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="h-4 w-4" /> Reason
            </p>
            <p className="text-sm text-foreground">{entry.reason}</p>
          </div>

          {entry.reviewNote && (
            <div
              className={
                "space-y-1.5 rounded-lg border p-3 " +
                (entry.status === "rejected" ? "border-danger/30 bg-danger-soft/40" : "border-success/30 bg-success-soft/40")
              }
            >
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MessageSquare className="h-4 w-4" />
                {entry.status === "rejected" ? "Rejection reason" : "Approval message"}
              </p>
              <p className="text-sm text-foreground">{entry.reviewNote}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
