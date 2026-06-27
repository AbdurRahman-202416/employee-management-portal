/**
 * STATUS CONFIG — maps every status value to a label + color tone.
 * The <StatusBadge> component reads this, so colors stay consistent
 * everywhere and a new status is styled by editing one place.
 */

type Tone = "neutral" | "success" | "danger" | "warning" | "info" | "primary";

export interface StatusMeta {
  label: string;
  tone: Tone;
}

export const ATTENDANCE_STATUS: Record<string, StatusMeta> = {
  present: { label: "Present", tone: "success" },
  late: { label: "Late", tone: "warning" },
  "early-exit": { label: "Early Exit", tone: "warning" },
  absent: { label: "Absent", tone: "danger" },
  leave: { label: "On Leave", tone: "info" },
  "not-checked-in": { label: "Not checked in", tone: "neutral" },
};

export const TASK_STATUS: Record<string, StatusMeta> = {
  todo: { label: "To Do", tone: "neutral" },
  "in-progress": { label: "In Progress", tone: "info" },
  "pending-approval": { label: "Pending Approval", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  reopened: { label: "Reopened", tone: "danger" },
};

export const APPLICATION_STATUS: Record<string, StatusMeta> = {
  pending: { label: "Pending", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

export const TASK_PRIORITY: Record<string, StatusMeta> = {
  low: { label: "Low", tone: "neutral" },
  medium: { label: "Medium", tone: "info" },
  high: { label: "High", tone: "warning" },
  urgent: { label: "Urgent", tone: "danger" },
};

export const EMPLOYMENT_STATUS: Record<string, StatusMeta> = {
  active: { label: "Active", tone: "success" },
  "on-leave": { label: "On Leave", tone: "warning" },
  inactive: { label: "Inactive", tone: "neutral" },
};

export const STATUS_MAPS = {
  attendance: ATTENDANCE_STATUS,
  task: TASK_STATUS,
  application: APPLICATION_STATUS,
  priority: TASK_PRIORITY,
  employment: EMPLOYMENT_STATUS,
} as const;

export type StatusKind = keyof typeof STATUS_MAPS;
