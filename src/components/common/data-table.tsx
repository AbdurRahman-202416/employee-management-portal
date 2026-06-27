"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./empty-state";

/**
 * A column description. `render` lets you show anything (badges, avatars);
 * if omitted, the raw value at `key` is shown.
 */
export interface ColumnDef<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  /** value used for sorting & search; defaults to row[key] */
  value?: (row: T) => string | number;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  className?: string;
  /** Hide this column on small screens (shown from the `md` breakpoint up). */
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  /** keys to match against the search box */
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  /** When set, ONLY the first column links to this URL (not the whole row). */
  rowHref?: (row: T) => string;
  toolbar?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
}

function cellValue<T>(row: T, col: ColumnDef<T>): string | number {
  if (col.value) return col.value(row);
  const raw = (row as Record<string, unknown>)[col.key as string];
  return raw == null ? "" : (raw as string | number);
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  searchKeys,
  searchPlaceholder = "Search…",
  pageSize = 10,
  onRowClick,
  rowHref,
  toolbar,
  emptyTitle = "Nothing here yet",
  emptyDescription = "Records will appear here once they exist.",
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const filtered = useMemo(() => {
    let rows = data;
    if (query && searchKeys?.length) {
      const q = query.toLowerCase();
      rows = rows.filter((r) =>
        searchKeys.some((k) => String((r as Record<string, unknown>)[k as string] ?? "").toLowerCase().includes(q))
      );
    }
    if (sort) {
      const col = columns.find((c) => String(c.key) === sort.key);
      if (col) {
        rows = [...rows].sort((a, b) => {
          const av = cellValue(a, col);
          const bv = cellValue(b, col);
          const cmp = typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv));
          return sort.dir === "asc" ? cmp : -cmp;
        });
      }
    }
    return rows;
  }, [data, query, searchKeys, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const rows = filtered.slice(current * pageSize, current * pageSize + pageSize);

  function toggleSort(key: string) {
    setPage(0);
    setSort((s) =>
      s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {(searchKeys?.length || toolbar) && (
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
          {searchKeys?.length ? (
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
          ) : (
            <div />
          )}
          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className={cn(
                      "px-4 py-3 font-medium",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.hideOnMobile && "hidden md:table-cell"
                    )}
                  >
                    {col.sortable ? (
                      <button
                        onClick={() => toggleSort(String(col.key))}
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        {col.header}
                        <ChevronsUpDown className="h-3 w-3" />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "border-b border-border last:border-0 transition-colors",
                    (onRowClick || rowHref) && "hover:bg-muted/40",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col, colIndex) => {
                    const content = col.render ? col.render(row) : String(cellValue(row, col));
                    // Only the FIRST column links to the row's details page.
                    const cellContent =
                      rowHref && colIndex === 0 ? (
                        <Link
                          href={rowHref(row)}
                          className="font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {content}
                        </Link>
                      ) : (
                        content
                      );
                    return (
                      <td
                        key={String(col.key)}
                        className={cn(
                          "px-4 py-3 text-foreground",
                          col.align === "right" && "text-right tabular",
                          col.align === "center" && "text-center",
                          col.hideOnMobile && "hidden md:table-cell",
                          col.className
                        )}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > pageSize && (
        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <span className="tabular">
            {current * pageSize + 1}–{Math.min((current + 1) * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={current === 0} onClick={() => setPage(current - 1)}>
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <span className="tabular text-xs">
              Page {current + 1} / {pageCount}
            </span>
            <Button variant="outline" size="sm" disabled={current >= pageCount - 1} onClick={() => setPage(current + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
