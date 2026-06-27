import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, UserRound, MessageSquare } from "lucide-react";
import { requireUser } from "@/server/auth/guard";
import { can } from "@/lib/permissions";
import { getTask } from "@/server/repositories/tasks";
import { getEmployee } from "@/server/repositories/employees";
import { fullName } from "@/lib/format";
import { formatDate, formatTime } from "@/lib/date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/common/status-badge";
import { ReviewActions } from "@/features/applications/review-actions";
import { DeleteButton } from "@/components/common/delete-button";

export default async function TaskDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const task = getTask(id);
  if (!task) notFound();

  const isOwner = task.assigneeId === user.id;
  if (!isOwner && !can(user, "task.view.all")) redirect("/tasks");

  const assignee = getEmployee(task.assigneeId);
  const assigner = getEmployee(task.assignedById);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/tasks" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to tasks
        </Link>
        {can(user, "task.delete") && (
          <DeleteButton
            endpoint={`/api/tasks/${task.id}`}
            title="Delete task?"
            subtitle={`${task.code} — ${task.title} will be permanently removed.`}
            redirectTo="/tasks"
          />
        )}
      </div>

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="tabular text-sm font-medium text-muted-foreground">{task.code}</span>
            <StatusBadge kind="priority" value={task.priority} />
            <StatusBadge kind="task" value={task.status} />
          </div>
          <CardTitle className="text-xl">{task.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm leading-relaxed text-foreground">{task.description}</p>

          <div className="grid gap-4 border-t border-border pt-5 text-sm sm:grid-cols-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span className="text-foreground">Due {formatDate(task.dueDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserRound className="h-4 w-4" />
              <span className="text-foreground">Assignee: {assignee ? fullName(assignee.firstName, assignee.lastName) : "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserRound className="h-4 w-4" />
              <span className="text-foreground">By: {assigner ? fullName(assigner.firstName, assigner.lastName) : "—"}</span>
            </div>
          </div>

          {task.reviewNote && (
            <div
              className={
                "space-y-1.5 rounded-lg border p-3 " +
                (task.status === "reopened" ? "border-danger/30 bg-danger-soft/40" : "border-success/30 bg-success-soft/40")
              }
            >
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MessageSquare className="h-4 w-4" />
                {task.status === "reopened" ? "Reopen reason" : "Approval message"}
              </p>
              <p className="text-sm text-foreground">{task.reviewNote}</p>
            </div>
          )}

          {can(user, "task.approve") && task.status === "pending-approval" && (
            <div className="border-t border-border pt-5">
              <p className="mb-2 text-sm font-medium text-foreground">Review this task</p>
              <ReviewActions
                endpoint={`/api/tasks/${task.id}/status`}
                approveStatus="approved"
                rejectStatus="reopened"
                approveLabel="Approve"
                rejectLabel="Reopen"
                subject="task"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {task.comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
          {task.comments.map((c) => {
            const author = getEmployee(c.authorId);
            const authorName = author ? fullName(author.firstName, author.lastName) : "Unknown";
            return (
              <div key={c.id} className="flex gap-3">
                <Avatar name={authorName} size="sm" />
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium text-foreground">{authorName}</span>{" "}
                    <span className="text-xs text-muted-foreground">
                      · {formatDate(c.createdAt)} at {formatTime(c.createdAt)}
                    </span>
                  </p>
                  <p className="text-sm text-foreground">{c.body}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
