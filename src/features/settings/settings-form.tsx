"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AppSettings } from "@/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function SettingsForm({ initial }: { initial: AppSettings }) {
  const router = useRouter();
  const [s, setS] = useState<AppSettings>(initial);
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) => setS((p) => ({ ...p, [k]: v }));

  function toggleDay(i: number) {
    setS((p) => ({
      ...p,
      workdays: p.workdays.includes(i) ? p.workdays.filter((d) => d !== i) : [...p.workdays, i].sort(),
    }));
  }

  async function save() {
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error ?? "Could not save");
        return;
      }
      toast.success("Settings saved");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Office Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start time"><Input type="time" value={s.officeStart} onChange={(e) => set("officeStart", e.target.value)} /></Field>
              <Field label="End time"><Input type="time" value={s.officeEnd} onChange={(e) => set("officeEnd", e.target.value)} /></Field>
            </div>
            <Field label="Late grace period (minutes)">
              <Input type="number" value={s.lateGraceMinutes} onChange={(e) => set("lateGraceMinutes", Number(e.target.value))} />
            </Field>
            <div className="space-y-2">
              <Label>Working days</Label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((d, i) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm transition-colors",
                      s.workdays.includes(i)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Allocation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Sick leave (days / year)">
              <Input type="number" value={s.leaveAllocation.sick} onChange={(e) => set("leaveAllocation", { ...s.leaveAllocation, sick: Number(e.target.value) })} />
            </Field>
            <Field label="Annual leave (days / year)">
              <Input type="number" value={s.leaveAllocation.annual} onChange={(e) => set("leaveAllocation", { ...s.leaveAllocation, annual: Number(e.target.value) })} />
            </Field>
            <Field label="Timezone"><Input value={s.timezone} onChange={(e) => set("timezone", e.target.value)} /></Field>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
        </Button>
      </div>
    </>
  );
}
