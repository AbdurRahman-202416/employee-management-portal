import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, UserRound, FileText, MessageSquare } from "lucide-react";
import { requireUser } from "@/server/auth/guard";
import { can } from "@/lib/permissions";
import { getLeave } from "@/server/repositories/applications";
import { getEmployee } from "@/server/repositories/employees";
import { fullName } from "@/lib/format";
import { formatDate } from "@/lib/date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";

export default async function LeaveDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const leave = getLeave(id);
  if (!leave) notFound();

  const isOwner = leave.employeeId === user.id;
  if (!isOwner && !can(user, "leave.view.all")) redirect("/leave");

  const applicant = getEmployee(leave.employeeId);
  const reviewer = leave.reviewedById ? getEmployee(leave.reviewedById) : undefined;

  return (
    <div className="space-y-6">
      <Link href="/leave" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to leave
      </Link>

      <Card>
        <CardHeader className="gap-2">
          <div className="flex items-center justify-between">
            <CardTitle className="capitalize">{leave.type} Leave</CardTitle>
            <StatusBadge kind="application" value={leave.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span className="text-foreground">{formatDate(leave.fromDate)} – {formatDate(leave.toDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span className="tabular text-foreground">{leave.days} day(s)</span>
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
            <p className="text-sm text-foreground">{leave.reason}</p>
          </div>

          {leave.reviewNote && (
            <div
              className={
                "space-y-1.5 rounded-lg border p-3 " +
                (leave.status === "rejected" ? "border-danger/30 bg-danger-soft/40" : "border-success/30 bg-success-soft/40")
              }
            >
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MessageSquare className="h-4 w-4" />
                {leave.status === "rejected" ? "Rejection reason" : "Approval message"}
              </p>
              <p className="text-sm text-foreground">{leave.reviewNote}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
