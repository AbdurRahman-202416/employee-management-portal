"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Field } from "@/components/ui/input";

export function LateEntryDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ date: "", reason: "" });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/late-entry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Could not submit");
        return;
      }
      toast.success("Late-entry application submitted");
      setForm({ date: "", reason: "" });
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Apply for Late Entry
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Apply for late entry"
        description="Explain why you'll arrive late."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" form="late-form" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Submit
            </Button>
          </>
        }
      >
        <form id="late-form" onSubmit={submit} className="space-y-4">
          <Field label="Date"><Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} required /></Field>
          <Field label="Reason"><Textarea value={form.reason} onChange={(e) => set("reason", e.target.value)} required /></Field>
          {error && <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        </form>
      </Dialog>
    </>
  );
}
