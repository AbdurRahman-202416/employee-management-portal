/**
 * ============================================================
 *  DOMAIN TYPES — single source of truth for the whole app.
 *  Plain-language note for non-developers:
 *  Each "type" below describes the shape of one kind of record
 *  the portal stores (an employee, an attendance entry, etc.).
 * ============================================================
 */

/** Every action a role can be allowed to do. Permissions, not role names,
 *  are checked everywhere — so new roles can be added without code changes. */
export type Permission =
  | "dashboard.view"
  | "employee.view"
  | "employee.create"
  | "employee.edit"
  | "employee.delete"
  | "department.view"
  | "department.manage"
  | "attendance.view.own"
  | "attendance.view.all"
  | "attendance.check"
  | "task.view.own"
  | "task.view.all"
  | "task.create"
  | "task.update.status"
  | "task.approve"
  | "leave.apply"
  | "leave.view.all"
  | "leave.approve"
  | "lateentry.apply"
  | "lateentry.view.all"
  | "lateentry.approve"
  | "report.view"
  | "notification.view"
  | "role.manage"
  | "settings.manage"
  | "auditlog.view";

export interface Role {
  id: string;
  name: string;            // e.g. "Admin / HR"
  slug: string;            // e.g. "admin"
  description: string;
  permissions: Permission[];
  isSystem: boolean;       // system roles cannot be deleted
}

export interface Department {
  id: string;
  name: string;            // e.g. "Engineering"
  code: string;            // e.g. "IT"
  description: string;
  createdAt: string;
}

export type EmploymentStatus = "active" | "on-leave" | "inactive";

export interface LeaveBalance {
  allocated: number;
  used: number;
  /** remaining is derived: allocated - used */
}

export interface Employee {
  id: string;
  employeeId: string;          // human ID: EMP-0001
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: string;
  designation: string;         // e.g. "Senior Engineer"
  roleId: string;
  joiningDate: string;
  employmentStatus: EmploymentStatus;
  photoUrl?: string;
  passwordHash: string;
  mustChangePassword: boolean;
  leave: {
    sick: LeaveBalance;
    annual: LeaveBalance;
  };
  createdAt: string;
  isDeleted: boolean;          // soft delete — history stays intact
}

/** Employee shape that is safe to send to the browser (no password). */
export type SafeEmployee = Omit<Employee, "passwordHash">;

export type AttendanceStatus =
  | "present"
  | "late"
  | "early-exit"
  | "absent"
  | "leave";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;          // references Employee.id
  date: string;                // YYYY-MM-DD
  checkInAt?: string;          // ISO timestamp (UTC)
  checkInGeo?: GeoPoint;
  checkOutAt?: string;
  checkOutGeo?: GeoPoint;
  status: AttendanceStatus;
  workedMinutes: number;
}

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus =
  | "todo"
  | "in-progress"
  | "pending-approval"
  | "approved"
  | "reopened";

export interface TaskComment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  code: string;                // TSK-0001
  title: string;
  description: string;
  assigneeId: string;
  assignedById: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  comments: TaskComment[];
  createdAt: string;
  reviewNote?: string;         // note left when approving / reopening
}

export type LeaveType = "sick" | "annual";
export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface LeaveApplication {
  id: string;
  employeeId: string;
  type: LeaveType;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: ApplicationStatus;
  reviewedById?: string;
  reviewNote?: string;         // optional message (approve) or reason (reject)
  createdAt: string;
}

export interface LateEntryApplication {
  id: string;
  employeeId: string;
  date: string;
  reason: string;
  status: ApplicationStatus;
  reviewedById?: string;
  reviewNote?: string;         // optional message (approve) or reason (reject)
  createdAt: string;
}

export type NotificationType =
  | "task-assigned"
  | "task-approved"
  | "task-reopened"
  | "leave-approved"
  | "leave-rejected"
  | "lateentry-approved"
  | "lateentry-rejected";

/** What a notification points to, so clicking it opens the right page. */
export type NotificationEntity = "task" | "leave" | "lateentry";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  entityType?: NotificationEntity;
  entityId?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;              // e.g. "employee.create"
  entity: string;              // e.g. "Employee"
  entityId: string;
  summary: string;             // human-readable line
  createdAt: string;
}

export interface AppSettings {
  officeStart: string;         // "09:00"
  officeEnd: string;           // "18:00"
  lateGraceMinutes: number;    // minutes after officeStart still counted on-time
  workdays: number[];          // 0=Sun ... 6=Sat
  timezone: string;            // IANA, e.g. "Asia/Dhaka"
  leaveAllocation: {
    sick: number;
    annual: number;
  };
}

/** Logged-in user context shared across the app. */
export interface SessionUser {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  roleSlug: string;
  roleName: string;
  permissions: Permission[];
  departmentId: string;
  photoUrl?: string;
  mustChangePassword: boolean;
}
