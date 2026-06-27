import bcrypt from "bcryptjs";
import { z } from "zod";
import { authorize } from "@/server/auth/guard";
import { createEmployee, getEmployeeByEmail, nextEmployeeId } from "@/server/repositories/employees";
import { getSettings } from "@/server/repositories/lookups";
import { addAuditLog } from "@/server/repositories/misc";
import { fullName } from "@/lib/format";
import type { Employee } from "@/types";

const EmployeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(3, "Phone is required"),
  departmentId: z.string().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  roleId: z.string().min(1, "Role is required"),
  joiningDate: z.string().min(1, "Joining date is required"),
  tempPassword: z.string().min(6, "Temporary password must be at least 6 characters"),
});

export async function POST(request: Request) {
  const auth = await authorize("employee.create");
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = EmployeeSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  if (getEmployeeByEmail(parsed.data.email)) {
    return Response.json({ success: false, error: "An employee with this email already exists" }, { status: 409 });
  }

  const settings = getSettings();
  const employee: Employee = {
    id: `emp-${Date.now()}`,
    employeeId: nextEmployeeId(),
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    departmentId: parsed.data.departmentId,
    designation: parsed.data.designation,
    roleId: parsed.data.roleId,
    joiningDate: parsed.data.joiningDate,
    employmentStatus: "active",
    passwordHash: bcrypt.hashSync(parsed.data.tempPassword, 10),
    mustChangePassword: true,
    leave: {
      sick: { allocated: settings.leaveAllocation.sick, used: 0 },
      annual: { allocated: settings.leaveAllocation.annual, used: 0 },
    },
    createdAt: new Date().toISOString().slice(0, 10),
    isDeleted: false,
  };
  createEmployee(employee);

  addAuditLog({
    id: `log-${Date.now()}`,
    actorId: auth.user.id,
    action: "employee.create",
    entity: "Employee",
    entityId: employee.id,
    summary: `${auth.user.name} added ${fullName(employee.firstName, employee.lastName)} (${employee.employeeId})`,
    createdAt: new Date().toISOString(),
  });

  return Response.json({ success: true, data: { id: employee.id, employeeId: employee.employeeId } });
}
