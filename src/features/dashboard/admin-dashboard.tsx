import { Users, UserCheck, UserX, FileClock, ListTodo } from "lucide-react";
import { StatCard } from "@/components/common/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeriesBarChart, DonutChart } from "@/components/charts/charts";
import { formatDate } from "@/lib/date";
import type { AdminStats } from "@/server/repositories/stats";

export function AdminDashboard({ stats }: { stats: AdminStats }) {
  const trend = stats.attendanceTrend.map((t) => ({ ...t, label: formatDate(t.date).slice(0, 6) }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total Employees" value={stats.totalEmployees} icon={Users} tone="primary" href="/employees" />
        <StatCard label="Present Today" value={stats.presentToday} icon={UserCheck} tone="success" href="/attendance" />
        <StatCard label="Absent Today" value={stats.absentToday} icon={UserX} tone="danger" href="/attendance" />
        <StatCard label="Pending Applications" value={stats.pendingApplications} icon={FileClock} tone="warning" href="/leave" />
        <StatCard label="Active Tasks" value={stats.activeTasks} icon={ListTodo} tone="info" href="/tasks" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <SeriesBarChart
              data={trend}
              xKey="label"
              bars={[
                { key: "present", color: "#059669", name: "Present" },
                { key: "late", color: "#d97706", name: "Late" },
                { key: "absent", color: "#e11d48", name: "Absent" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={stats.leaveOverview} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employees by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <SeriesBarChart
            data={stats.departmentSplit}
            xKey="name"
            bars={[{ key: "value", color: "#0284c7", name: "Employees" }]}
            height={240}
          />
        </CardContent>
      </Card>
    </div>
  );
}
