"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * An employee's name. If the viewer is allowed to see employee profiles
 * (HR / Admin / Super Admin), the name links to that person's details page.
 * Otherwise it renders as plain text. Stops row-click propagation so it works
 * inside clickable table rows.
 */
export function EmployeeLink({
  id,
  name,
  canView,
  className,
}: {
  id: string;
  name: string;
  canView: boolean;
  className?: string;
}) {
  if (!canView) return <span className={cn("font-medium text-foreground", className)}>{name}</span>;
  return (
    <Link
      href={`/employees/${id}`}
      onClick={(e) => e.stopPropagation()}
      className={cn("font-medium text-foreground hover:text-primary hover:underline", className)}
    >
      {name}
    </Link>
  );
}
