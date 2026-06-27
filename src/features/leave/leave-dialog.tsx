"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Field } from "@/components/ui/input";

export function LeaveDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ type: "sick", fromDate: "", toDate: "", reason: "" });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leave", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Could not submit");
        return;
      }
      toast.success("Leave application submitted");
      setForm({ type: "sick", fromDate: "", toDate: "", reason: "" });
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Apply for Leave
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Apply for leave"
        description="Submit a leave request for approval."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" form="leave-form" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Submit
            </Button>
          </>
        }
      >
        <form id="leave-form" onSubmit={submit} className="space-y-4">
          <Field label="Leave type">
            <Select value={form.type} onChange={(e) => set("type", e.target.value)}>
              <option value="sick">Sick Leave</option>
              <option value="annual">Annual Leave</option>
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="From"><Input type="date" value={form.fromDate} onChange={(e) => set("fromDate", e.target.value)} required /></Field>
            <Field label="To"><Input type="date" value={form.toDate} onChange={(e) => set("toDate", e.target.value)} required /></Field>
          </div>
          <Field label="Reason"><Textarea value={form.reason} onChange={(e) => set("reason", e.target.value)} required /></Field>
          {error && <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        </form>
      </Dialog>
    </>
  );
}
