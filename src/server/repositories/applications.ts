/** Leave and Late-Entry applications share the same approval lifecycle. */

import { getStore } from "../store/db";
import type {
  ApplicationStatus,
  LateEntryApplication,
  LeaveApplication,
} from "@/types";

export function listLeave(opts?: { employeeId?: string; status?: ApplicationStatus }): LeaveApplication[] {
  let rows = getStore().leaves;
  if (opts?.employeeId) rows = rows.filter((l) => l.employeeId === opts.employeeId);
  if (opts?.status) rows = rows.filter((l) => l.status === opts.status);
  return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listLateEntry(opts?: { employeeId?: string; status?: ApplicationStatus }): LateEntryApplication[] {
  let rows = getStore().lateEntries;
  if (opts?.employeeId) rows = rows.filter((l) => l.employeeId === opts.employeeId);
  if (opts?.status) rows = rows.filter((l) => l.status === opts.status);
  return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createLeave(input: {
  employeeId: string;
  type: LeaveApplication["type"];
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
}): LeaveApplication {
  const leave: LeaveApplication = {
    id: `leave-${Date.now()}`,
    ...input,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  getStore().leaves.unshift(leave);
  return leave;
}

export function createLateEntry(input: {
  employeeId: string;
  date: string;
  reason: string;
}): LateEntryApplication {
  const entry: LateEntryApplication = {
    id: `late-${Date.now()}`,
    ...input,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  getStore().lateEntries.unshift(entry);
  return entry;
}

export function getLeave(id: string): LeaveApplication | undefined {
  return getStore().leaves.find((l) => l.id === id);
}

export function getLateEntry(id: string): LateEntryApplication | undefined {
  return getStore().lateEntries.find((l) => l.id === id);
}

export function pendingApplicationCount(): number {
  const { leaves, lateEntries } = getStore();
  return (
    leaves.filter((l) => l.status === "pending").length +
    lateEntries.filter((l) => l.status === "pending").length
  );
}

export function setLeaveStatus(id: string, status: ApplicationStatus, reviewerId: string, note?: string) {
  const l = getStore().leaves.find((x) => x.id === id);
  if (!l) return undefined;
  l.status = status;
  l.reviewedById = reviewerId;
  l.reviewNote = note?.trim() || undefined;
  return l;
}

export function setLateEntryStatus(id: string, status: ApplicationStatus, reviewerId: string, note?: string) {
  const l = getStore().lateEntries.find((x) => x.id === id);
  if (!l) return undefined;
  l.status = status;
  l.reviewedById = reviewerId;
  l.reviewNote = note?.trim() || undefined;
  return l;
}
