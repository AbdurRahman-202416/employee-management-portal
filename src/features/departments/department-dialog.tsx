"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Field } from "@/components/ui/input";

export function DepartmentDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", description: "" });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/departments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Could not save");
        return;
      }
      toast.success("Department added");
      setForm({ name: "", code: "", description: "" });
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add Department
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Add department"
        description="Create a new team."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" form="dept-form" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Add department
            </Button>
          </>
        }
      >
        <form id="dept-form" onSubmit={submit} className="space-y-4">
          <Field label="Name"><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Engineering" required /></Field>
          <Field label="Code"><Input value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="e.g. IT" maxLength={6} required /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What this team does" required /></Field>
          {error && <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        </form>
      </Dialog>
    </>
  );
}
