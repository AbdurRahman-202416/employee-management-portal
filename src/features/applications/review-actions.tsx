"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea, Label } from "@/components/ui/input";

type Decision = "approve" | "reject";

interface Props {
  endpoint: string;
  /** status value sent for each decision */
  approveStatus?: string;
  rejectStatus?: string;
  approveLabel?: string;
  rejectLabel?: string;
  /** noun shown in the confirmation copy, e.g. "leave request" */
  subject?: string;
}

export function ReviewActions({
  endpoint,
  approveStatus = "approved",
  rejectStatus = "rejected",
  approveLabel = "Approve",
  rejectLabel = "Reject",
  subject = "request",
}: Props) {
  const router = useRouter();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReject = decision === "reject";
  const noteRequired = isReject;

  function close() {
    if (loading) return;
    setDecision(null);
    setNote("");
    setError(null);
  }

  async function confirm() {
    if (noteRequired && !note.trim()) {
      setError("Please provide a reason.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: isReject ? rejectStatus : approveStatus, note: note.trim() || undefined }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Action failed");
        return;
      }
      toast.success(isReject ? `${rejectLabel}ed` : `${approveLabel}d`);
      setDecision(null);
      setNote("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setDecision("approve")}
          className="inline-flex items-center gap-1 rounded-md bg-success-soft px-2.5 py-1.5 text-xs font-medium text-success transition-opacity hover:opacity-80"
        >
          <Check className="h-3.5 w-3.5" /> {approveLabel}
        </button>
        <button
          onClick={() => setDecision("reject")}
          className="inline-flex items-center gap-1 rounded-md bg-danger-soft px-2.5 py-1.5 text-xs font-medium text-danger transition-opacity hover:opacity-80"
        >
          <X className="h-3.5 w-3.5" /> {rejectLabel}
        </button>
      </div>

      <Dialog
        open={decision !== null}
        onClose={close}
        size="sm"
        centered
        icon={isReject ? <X className="h-7 w-7" /> : <Check className="h-7 w-7" />}
        iconTone={isReject ? "danger" : "success"}
        title={isReject ? `${rejectLabel} ${subject}?` : `${approveLabel} ${subject}?`}
        description={
          isReject ? "Let the applicant know why." : "Optionally add a note for the applicant."
        }
        footer={
          <>
            <Button variant="outline" onClick={close} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={confirm}
              disabled={loading}
              className={cn(isReject && "bg-danger text-white hover:opacity-90")}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isReject ? rejectLabel : approveLabel}
            </Button>
          </>
        }
      >
        <div className="space-y-1.5 text-left">
          <Label className="block">
            {isReject ? "Reason" : "Message"}
            {isReject ? (
              <span className="text-danger"> *</span>
            ) : (
              <span className="font-normal text-muted-foreground"> (optional)</span>
            )}
          </Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={isReject ? "Reason for rejection…" : "Add a note…"}
            autoFocus
          />
        </div>
        {error && <p className="mt-2 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
      </Dialog>
    </>
  );
}
