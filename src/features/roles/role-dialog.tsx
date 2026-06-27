"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Field } from "@/components/ui/input";
import { PERMISSION_GROUPS } from "@/config/permissions.config";

export function RoleDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [perms, setPerms] = useState<Set<string>>(new Set());

  function toggle(key: string) {
    setPerms((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, permissions: [...perms] }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Could not create role");
        return;
      }
      toast.success("Role created");
      setName("");
      setDescription("");
      setPerms(new Set());
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> New Role
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Create role"
        description="Pick exactly what this role can do. No code changes needed."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" form="role-form" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create role
            </Button>
          </>
        }
      >
        <form id="role-form" onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Team Lead" required /></Field>
            <Field label="Description"><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this role is for" required /></Field>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground">
              Permissions <span className="tabular text-muted-foreground">({perms.size} selected)</span>
            </p>
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.group} className="rounded-lg border border-border p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.group}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <label key={item.key} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={perms.has(item.key)}
                        onChange={() => toggle(item.key)}
                        className="h-4 w-4 rounded border-input accent-[var(--primary)]"
                      />
                      <span className="text-foreground">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {error && <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        </form>
      </Dialog>
    </>
  );
}
