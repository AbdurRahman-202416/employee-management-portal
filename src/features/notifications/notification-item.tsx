"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDate, formatTime } from "@/lib/date";
import { notificationHref, notificationIcon } from "@/config/notification.config";
import type { Notification } from "@/types";

/** A single notification. Clicking marks it read and opens the linked page. */
export function NotificationItem({ notification }: { notification: Notification }) {
  const router = useRouter();
  const href = notificationHref(notification);
  const Icon = notificationIcon(notification.type);

  async function open() {
    if (!notification.read) {
      await fetch(`/api/notifications/${notification.id}/read`, { method: "POST" });
    }
    if (href) router.push(href);
    else router.refresh();
  }

  return (
    <button
      onClick={open}
      className={cn(
        "flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/60",
        !notification.read && "bg-primary-soft/30"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          notification.read ? "bg-muted text-muted-foreground" : "bg-primary-soft text-primary"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>

      <span className="min-w-0 flex-1 space-y-0.5">
        <span className="flex items-center gap-2">
          {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
          <span className="font-medium text-foreground">{notification.title}</span>
        </span>
        <span className="block truncate text-sm text-muted-foreground">{notification.message}</span>
        <span className="block text-xs text-muted-foreground">
          {formatDate(notification.createdAt)} at {formatTime(notification.createdAt)}
        </span>
      </span>

      {href && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
    </button>
  );
}
