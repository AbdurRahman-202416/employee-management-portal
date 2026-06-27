import { Badge } from "@/components/ui/badge";
import { STATUS_MAPS, type StatusKind } from "@/config/status.config";
import { titleCase } from "@/lib/format";

/**
 * One badge for every status in the app.
 * Usage: <StatusBadge kind="attendance" value="late" />
 */
export function StatusBadge({ kind, value }: { kind: StatusKind; value: string }) {
  const meta = STATUS_MAPS[kind][value];
  if (!meta) return <Badge tone="neutral">{titleCase(value)}</Badge>;
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
