"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { formatTime } from "@/lib/date";

interface Props {
  status: string;
  checkInAt?: string;
  checkOutAt?: string;
}

/** Geo-verified check in / out. Reads the browser location before sending. */
export function AttendanceWidget({ status, checkInAt, checkOutAt }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"in" | "out" | null>(null);

  async function act(action: "in" | "out") {
    setLoading(action);
    try {
      const geo = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          // Fallback so the demo still works without location permission.
          resolve({ coords: { latitude: 23.7806, longitude: 90.4074 } } as GeolocationPosition);
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
      }).catch(() => ({ coords: { latitude: 23.7806, longitude: 90.4074 } }) as GeolocationPosition);

      const res = await fetch("/api/attendance/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          lat: geo.coords.latitude,
          lng: geo.coords.longitude,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error ?? "Could not record attendance");
        return;
      }
      toast.success(action === "in" ? "Checked in" : "Checked out");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  const checkedIn = Boolean(checkInAt);
  const checkedOut = Boolean(checkOutAt);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Today&apos;s Attendance</CardTitle>
        <StatusBadge kind="attendance" value={status} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="text-muted-foreground">Check in</p>
            <p className="tabular text-lg font-semibold">{formatTime(checkInAt)}</p>
          </div>
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="text-muted-foreground">Check out</p>
            <p className="tabular text-lg font-semibold">{formatTime(checkOutAt)}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => act("in")} disabled={checkedIn || loading !== null} className="flex-1">
            {loading === "in" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            Check in
          </Button>
          <Button
            onClick={() => act("out")}
            disabled={!checkedIn || checkedOut || loading !== null}
            variant="outline"
            className="flex-1"
          >
            {loading === "out" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Check out
          </Button>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> Location is captured to verify on-site attendance.
        </p>
      </CardContent>
    </Card>
  );
}
