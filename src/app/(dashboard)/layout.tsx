import { requireUser } from "@/server/auth/guard";
import { unreadCount } from "@/server/repositories/misc";
import { SessionProvider } from "@/components/providers/session-provider";
import { AppShell } from "@/components/layout/app-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const unread = unreadCount(user.id);

  return (
    <SessionProvider user={user}>
      <AppShell unread={unread}>{children}</AppShell>
    </SessionProvider>
  );
}
