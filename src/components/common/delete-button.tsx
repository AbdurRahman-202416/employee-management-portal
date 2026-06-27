"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteButtonProps {
  endpoint: string;
  title: string;
  subtitle: string;
  /** Where to go after a successful delete. Omit to just refresh in place. */
  redirectTo?: string;
  /** "button" shows a labelled button; "icon" shows a compact trash icon. */
  variant?: "button" | "icon";
  label?: string;
}

/** Trash trigger + centered confirmation dialog. Used for all delete actions. */
export function DeleteButton({
  endpoint,
  title,
  subtitle,
  redirectTo,
  variant = "button",
  label = "Delete",
}: DeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error ?? "Could not delete");
        return;
      }
      toast.success("Deleted");
      setOpen(false);
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {variant === "icon" ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setOpen(true);
          }}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
          aria-label={label}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : (
        <Button variant="outline" onClick={() => setOpen(true)} className="text-danger hover:bg-danger-soft">
          <Trash2 className="h-4 w-4" /> {label}
        </Button>
      )}

      <Dialog
        open={open}
        onClose={() => !loading && setOpen(false)}
        size="sm"
        centered
        icon={<Trash2 className="h-7 w-7" />}
        iconTone="danger"
        title={title}
        description={subtitle}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={confirm} disabled={loading} className="bg-danger text-white hover:opacity-90">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} {label}
            </Button>
          </>
        }
      >
        <p className="text-center text-sm text-muted-foreground">This action cannot be undone.</p>
      </Dialog>
    </>
  );
}
