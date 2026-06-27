import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { requireUser } from "@/server/auth/guard";
import { listNotifications } from "@/server/repositories/misc";
import { PageHeader } from "@/components/common/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { MarkAllRead } from "@/features/notifications/mark-all-read";
import { NotificationItem } from "@/features/notifications/notification-item";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireUser();
  const items = listNotifications(user.id);
  const unread = items.filter((n) => !n.read).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Task assignments and application updates. Click one to open it."
        actions={items.length > 0 ? <MarkAllRead disabled={unread === 0} /> : undefined}
      />
      <Card>
        {items.length === 0 ? (
          <EmptyState title="You're all caught up" icon={Bell} />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((n) => (
              <li key={n.id}>
                <NotificationItem notification={n} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
