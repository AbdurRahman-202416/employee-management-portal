/**
 * NOTIFICATION CONFIG — where each notification links to, and its icon.
 * Add a new entity type here and every notification of that type becomes
 * a working link automatically.
 */

import type { LucideIcon } from "lucide-react";
import { ListTodo, PlaneTakeoff, Clock, Bell } from "lucide-react";
import type { Notification, NotificationEntity, NotificationType } from "@/types";

const ENTITY_PATH: Record<NotificationEntity, string> = {
  task: "/tasks",
  leave: "/leave",
  lateentry: "/late-entry",
};

/** Build the page link for a notification, or null if it has no target. */
export function notificationHref(n: Pick<Notification, "entityType" | "entityId">): string | null {
  if (!n.entityType || !n.entityId) return null;
  return `${ENTITY_PATH[n.entityType]}/${n.entityId}`;
}

const TYPE_ICON: Record<NotificationType, LucideIcon> = {
  "task-assigned": ListTodo,
  "task-approved": ListTodo,
  "task-reopened": ListTodo,
  "leave-approved": PlaneTakeoff,
  "leave-rejected": PlaneTakeoff,
  "lateentry-approved": Clock,
  "lateentry-rejected": Clock,
};

export function notificationIcon(type: NotificationType): LucideIcon {
  return TYPE_ICON[type] ?? Bell;
}
