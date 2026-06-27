/** Small, dependency-free formatting helpers used across the UI. */

export function fullName(first: string, last: string) {
  return `${first} ${last}`.trim();
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function titleCase(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function percent(used: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((used / total) * 100);
}

/** Deterministic accent color for an avatar based on a name. */
export function avatarTint(name: string) {
  const tints = [
    "bg-emerald-100 text-emerald-700",
    "bg-sky-100 text-sky-700",
    "bg-violet-100 text-violet-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-teal-100 text-teal-700",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return tints[Math.abs(hash) % tints.length];
}
