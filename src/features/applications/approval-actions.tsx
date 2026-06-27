"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Approve / Reject buttons used by both leave and late-entry tables. */
export function ApprovalActions({ endpoint }: { endpoint: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function decide(status: "approved" | "rejected") {
    setBusy(true);
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error ?? "Action failed");
        return;
      }
      toast.success(status === "approved" ? "Approved" : "Rejected");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" variant="outline" disabled={busy} onClick={() => decide("approved")}>
        <Check className="h-4 w-4 text-success" /> Approve
      </Button>
      <Button size="sm" variant="outline" disabled={busy} onClick={() => decide("rejected")}>
        <X className="h-4 w-4 text-danger" /> Reject
      </Button>
    </div>
  );
}
