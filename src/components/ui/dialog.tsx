"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

const sizes = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

const iconTones = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
};

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: keyof typeof sizes;
  /** Optional icon shown in a tinted circle. */
  icon?: React.ReactNode;
  iconTone?: keyof typeof iconTones;
  /** Centered layout: big icon on top → title → subtitle → content → actions. */
  centered?: boolean;
}

/** Accessible modal: closes on Escape or backdrop click, locks body scroll. */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  icon,
  iconTone = "primary",
  centered = false,
}: DialogProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        className={cn(
          "animate-in relative z-10 flex max-h-[92vh] w-full flex-col rounded-t-xl border border-border bg-card shadow-xl sm:rounded-xl",
          sizes[size]
        )}
      >
        {/* Always-present close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-md p-1 text-muted-foreground hover:bg-muted"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {centered ? (
          <div className="flex flex-col items-center gap-3 px-6 pb-2 pt-9 text-center">
            {icon && (
              <span className={cn("flex h-16 w-16 items-center justify-center rounded-full", iconTones[iconTone])}>
                {icon}
              </span>
            )}
            <div className="space-y-1.5">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
              {description && <p className="mx-auto max-w-xs text-sm text-muted-foreground">{description}</p>}
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 border-b border-border p-5 pr-12">
            {icon && (
              <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", iconTones[iconTone])}>
                {icon}
              </span>
            )}
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
          </div>
        )}

        <div className={cn("flex-1 overflow-y-auto", centered ? "px-6 py-4" : "p-5")}>{children}</div>

        {footer &&
          (centered ? (
            <div className="flex gap-2 px-6 pb-6 pt-1 [&>*]:flex-1">{footer}</div>
          ) : (
            <div className="flex justify-end gap-2 border-t border-border p-5">{footer}</div>
          ))}
      </div>
    </div>
  );
}
