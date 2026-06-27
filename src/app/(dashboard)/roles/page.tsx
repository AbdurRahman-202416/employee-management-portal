import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { requirePermission } from "@/server/auth/guard";
import { can } from "@/lib/permissions";
import { listRoles } from "@/server/repositories/lookups";
import { ALL_PERMISSIONS } from "@/config/permissions.config";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleDialog } from "@/features/roles/role-dialog";
import { DeleteButton } from "@/components/common/delete-button";

export const metadata: Metadata = { title: "Roles" };

export default async function RolesPage() {
  const user = await requirePermission("role.manage");
  const roles = listRoles();

  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        description="Roles are dynamic — create new ones and toggle permissions without code changes."
        actions={<RoleDialog />}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {roles.map((r) => {
          const total = ALL_PERMISSIONS.length;
          const pct = Math.round((r.permissions.length / total) * 100);
          return (
            <Card key={r.id} className="flex flex-col transition-colors hover:border-primary/50">
              <CardContent className="flex flex-1 flex-col gap-4 p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                    <div className="space-y-0.5">
                      <h3 className="font-semibold leading-tight text-foreground">{r.name}</h3>
                      <Badge tone={r.isSystem ? "neutral" : "success"}>
                        {r.isSystem ? "System" : "Custom"}
                      </Badge>
                    </div>
                  </div>
                  {can(user, "role.delete") && !r.isSystem && (
                    <DeleteButton
                      variant="icon"
                      endpoint={`/api/roles/${r.id}`}
                      title="Delete role?"
                      subtitle={`The "${r.name}" role will be removed.`}
                    />
                  )}
                </div>

                <p className="text-sm text-muted-foreground">{r.description}</p>

                {/* Coverage */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">Access coverage</span>
                    <span className="tabular text-muted-foreground">
                      {r.permissions.length} of {total}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {/* Permission chips */}
                <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                  {r.permissions.slice(0, 5).map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-[11px] font-medium text-muted-foreground"
                    >
                      {p}
                    </span>
                  ))}
                  {r.permissions.length > 5 && (
                    <span className="inline-flex items-center rounded-md bg-primary-soft px-2 py-1 text-[11px] font-semibold text-primary">
                      +{r.permissions.length - 5} more
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
