import Link from "next/link";
import { CalendarDays, ListTodo, Clock, PlaneTakeoff } from "lucide-react";
import { StatCard } from "@/components/common/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonutChart, SeriesBarChart } from "@/components/charts/charts";
import { StatusBadge } from "@/components/common/status-badge";
import { AttendanceWidget } from "@/features/attendance/attendance-widget";
import { formatDate } from "@/lib/date";
import type { EmployeeStats } from "@/server/repositories/stats";
import type { TaskItem } from "@/types";

export function EmployeeDashboard({
  stats,
  recentTasks,
}: {
  stats: EmployeeStats;
  recentTasks: TaskItem[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Remaining Leave" value={`${stats.remainingLeave} days`} icon={PlaneTakeoff} tone="primary" href="/leave" />
        <StatCard label="Assigned Tasks" value={stats.assignedTasks} icon={ListTodo} tone="info" href="/tasks" />
        <StatCard label="Pending Tasks" value={stats.pendingTasks} icon={Clock} tone="warning" href="/tasks" />
        <StatCard label="This Month" value={`${stats.monthlyAttendance[0]?.value ?? 0} present`} icon={CalendarDays} tone="success" href="/attendance" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AttendanceWidget status={stats.todayStatus} checkInAt={stats.checkInAt} checkOutAt={stats.checkOutAt} />

        <Card>
          <CardHeader>
            <CardTitle>Monthly Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <SeriesBarChart
              data={stats.monthlyAttendance}
              xKey="label"
              bars={[{ key: "value", color: "#059669", name: "Days" }]}
              height={220}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={stats.taskProgress} height={220} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent Tasks</CardTitle>
          <Link href="/tasks" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {recentTasks.length === 0 && <p className="py-4 text-sm text-muted-foreground">No tasks assigned yet.</p>}
          {recentTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{task.title}</p>
                <p className="text-xs text-muted-foreground">
                  {task.code} · Due {formatDate(task.dueDate)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge kind="priority" value={task.priority} />
                <StatusBadge kind="task" value={task.status} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
