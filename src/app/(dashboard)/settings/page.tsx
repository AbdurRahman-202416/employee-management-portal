import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/guard";
import { getSettings } from "@/server/repositories/lookups";
import { PageHeader } from "@/components/common/page-header";
import { SettingsForm } from "@/features/settings/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requirePermission("settings.manage");
  const settings = getSettings();

  return (
    <>
      <PageHeader
        title="System Settings"
        description="Company-wide policy. These values drive attendance and leave calculations."
      />
      <SettingsForm initial={settings} />
    </>
  );
}
