import type { Metadata } from "next";
import { requireUser } from "@/server/auth/guard";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/common/page-header";
import { AdminDashboard } from "@/features/dashboard/admin-dashboard";
import { EmployeeDashboard } from "@/features/dashboard/employee-dashboard";
import { adminStats, employeeStats } from "@/server/repositories/stats";
import { listTasks } from "@/server/repositories/tasks";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const isManager = can(user, "attendance.view.all");

  return (
    <>
      <PageHeader
        title={`${isManager ? "Admin" : "My"} Dashboard`}
        description={
          isManager
            ? "Company-wide attendance, leave, and workforce at a glance."
            : "Your attendance, tasks, and leave summary."
        }
      />
      {isManager ? (
        <AdminDashboard stats={adminStats()} />
      ) : (
        <EmployeeDashboard
          stats={employeeStats(user.id)}
          recentTasks={listTasks({ assigneeId: user.id }).slice(0, 5)}
        />
      )}
    </>
  );
}
