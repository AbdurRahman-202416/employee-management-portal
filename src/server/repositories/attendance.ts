import { getStore } from "../store/db";
import { toDateKey } from "@/lib/date";
import type { AttendanceRecord } from "@/types";

export function attendanceForEmployee(employeeId: string, limit?: number): AttendanceRecord[] {
  const rows = getStore()
    .attendance.filter((a) => a.employeeId === employeeId)
    .sort((a, b) => b.date.localeCompare(a.date));
  return limit ? rows.slice(0, limit) : rows;
}

export function todayAttendance(employeeId: string): AttendanceRecord | undefined {
  const key = toDateKey();
  return getStore().attendance.find((a) => a.employeeId === employeeId && a.date === key);
}

export function attendanceOn(employeeId: string, date: string): AttendanceRecord | undefined {
  return getStore().attendance.find((a) => a.employeeId === employeeId && a.date === date);
}

export function listAttendance(opts?: {
  employeeId?: string;
  from?: string;
  to?: string;
}): AttendanceRecord[] {
  let rows = getStore().attendance;
  if (opts?.employeeId) rows = rows.filter((a) => a.employeeId === opts.employeeId);
  if (opts?.from) rows = rows.filter((a) => a.date >= opts.from!);
  if (opts?.to) rows = rows.filter((a) => a.date <= opts.to!);
  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

export interface AttendanceSummary {
  present: number;
  late: number;
  earlyExit: number;
  absent: number;
  leave: number;
  workingDays: number;
}

export function summaryFor(employeeId: string, sinceDays: number): AttendanceSummary {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - sinceDays);
  const sinceKey = since.toISOString().slice(0, 10);

  const rows = getStore().attendance.filter(
    (a) => a.employeeId === employeeId && a.date >= sinceKey
  );

  const s: AttendanceSummary = {
    present: 0, late: 0, earlyExit: 0, absent: 0, leave: 0, workingDays: rows.length,
  };
  for (const r of rows) {
    if (r.status === "present") s.present++;
    else if (r.status === "late") s.late++;
    else if (r.status === "early-exit") s.earlyExit++;
    else if (r.status === "absent") s.absent++;
    else if (r.status === "leave") s.leave++;
  }
  return s;
}

export function checkIn(employeeId: string, geo: { lat: number; lng: number }): AttendanceRecord {
  const store = getStore();
  const key = toDateKey();
  const existing = store.attendance.find((a) => a.employeeId === employeeId && a.date === key);
  const now = new Date().toISOString();
  if (existing && existing.checkInAt) return existing; // prevent double check-in
  if (existing) {
    existing.checkInAt = now;
    existing.checkInGeo = geo;
    existing.status = "present";
    return existing;
  }
  const rec: AttendanceRecord = {
    id: `att-${Date.now()}`,
    employeeId,
    date: key,
    checkInAt: now,
    checkInGeo: geo,
    status: "present",
    workedMinutes: 0,
  };
  store.attendance.push(rec);
  return rec;
}

export function checkOut(employeeId: string, geo: { lat: number; lng: number }): AttendanceRecord | undefined {
  const key = toDateKey();
  const rec = getStore().attendance.find((a) => a.employeeId === employeeId && a.date === key);
  if (!rec || !rec.checkInAt) return undefined;
  rec.checkOutAt = new Date().toISOString();
  rec.checkOutGeo = geo;
  rec.workedMinutes = Math.round(
    (new Date(rec.checkOutAt).getTime() - new Date(rec.checkInAt).getTime()) / 60000
  );
  return rec;
}
