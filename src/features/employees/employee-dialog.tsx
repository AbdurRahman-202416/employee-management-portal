"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Select, Field } from "@/components/ui/input";

interface Option {
  id: string;
  name: string;
}

export interface EmployeeFormValues {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: string;
  designation: string;
  roleId: string;
  joiningDate: string;
  employmentStatus: string;
}

const empty: EmployeeFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  departmentId: "",
  designation: "",
  roleId: "",
  joiningDate: "",
  employmentStatus: "active",
};

export function EmployeeDialog({
  departments,
  roles,
  mode = "add",
  initial,
}: {
  departments: Option[];
  roles: Option[];
  mode?: "add" | "edit";
  initial?: EmployeeFormValues;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<EmployeeFormValues>(initial ?? { ...empty, departmentId: departments[0]?.id ?? "", roleId: roles[0]?.id ?? "" });
  const [tempPassword, setTempPassword] = useState("");

  const set = (k: keyof EmployeeFormValues, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const url = mode === "edit" ? `/api/employees/${form.id}` : "/api/employees";
      const method = mode === "edit" ? "PATCH" : "POST";
      const payload = mode === "edit" ? form : { ...form, tempPassword };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Could not save");
        return;
      }
      toast.success(mode === "edit" ? "Employee updated" : "Employee added");
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {mode === "edit" ? (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Pencil className="h-4 w-4" /> Edit
        </Button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <UserPlus className="h-4 w-4" /> Add Employee
        </Button>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={mode === "edit" ? "Edit employee" : "Add employee"}
        description={mode === "edit" ? "Update this person's details." : "Create a new employee account."}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" form="employee-form" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "edit" ? "Save changes" : "Add employee"}
            </Button>
          </>
        }
      >
        <form id="employee-form" onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name"><Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required /></Field>
            <Field label="Last name"><Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required /></Field>
            <Field label="Email"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} required /></Field>
            <Field label="Department">
              <Select value={form.departmentId} onChange={(e) => set("departmentId", e.target.value)} required>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </Field>
            <Field label="Designation"><Input value={form.designation} onChange={(e) => set("designation", e.target.value)} required /></Field>
            <Field label="Role">
              <Select value={form.roleId} onChange={(e) => set("roleId", e.target.value)} required>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </Select>
            </Field>
            <Field label="Joining date"><Input type="date" value={form.joiningDate} onChange={(e) => set("joiningDate", e.target.value)} required /></Field>
            {mode === "edit" ? (
              <Field label="Employment status">
                <Select value={form.employmentStatus} onChange={(e) => set("employmentStatus", e.target.value)}>
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </Field>
            ) : (
              <Field label="Temporary password">
                <Input type="text" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} placeholder="Min 6 characters" required />
              </Field>
            )}
          </div>
          {mode === "add" && (
            <p className="text-xs text-muted-foreground">
              The employee signs in with this password and is asked to change it on first login.
            </p>
          )}
          {error && <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        </form>
      </Dialog>
    </>
  );
}
