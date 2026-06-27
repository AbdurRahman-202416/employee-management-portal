/** Notifications and audit logs. */

import { getStore } from "../store/db";
import type { AuditLog, Notification } from "@/types";

export function listNotifications(userId: string): Notification[] {
  return getStore()
    .notifications.filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function unreadCount(userId: string): number {
  return getStore().notifications.filter((n) => n.userId === userId && !n.read).length;
}

export function markOneRead(userId: string, id: string) {
  const n = getStore().notifications.find((x) => x.id === id && x.userId === userId);
  if (n) n.read = true;
  return n;
}

export function markAllRead(userId: string) {
  getStore()
    .notifications.filter((n) => n.userId === userId)
    .forEach((n) => (n.read = true));
}

export function addNotification(n: Notification) {
  getStore().notifications.unshift(n);
}

export function listAuditLogs(): AuditLog[] {
  return [...getStore().auditLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addAuditLog(entry: AuditLog) {
  getStore().auditLogs.unshift(entry);
}
