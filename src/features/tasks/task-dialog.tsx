"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Field } from "@/components/ui/input";

export function TaskDialog({ employees }: { employees: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigneeId: employees[0]?.id ?? "",
    priority: "medium",
    dueDate: "",
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Could not create task");
        return;
      }
      toast.success(`Task ${json.data.code} created`);
      setForm({ title: "", description: "", assigneeId: employees[0]?.id ?? "", priority: "medium", dueDate: "" });
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> New Task
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Create task"
        description="Assign a task to a team member."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" form="task-form" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create task
            </Button>
          </>
        }
      >
        <form id="task-form" onSubmit={submit} className="space-y-4">
          <Field label="Title"><Input value={form.title} onChange={(e) => set("title", e.target.value)} required /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} required /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Assignee">
              <Select value={form.assigneeId} onChange={(e) => set("assigneeId", e.target.value)} required>
                {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </Field>
            <Field label="Due date"><Input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} required /></Field>
          </div>
          {error && <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        </form>
      </Dialog>
    </>
  );
}
