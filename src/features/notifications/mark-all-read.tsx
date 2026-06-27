"use client";

import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function MarkAllRead({ disabled = false }: { disabled?: boolean }) {
  const router = useRouter();
  async function run() {
    await fetch("/api/notifications/read", { method: "POST" });
    toast.success("All notifications marked as read");
    router.refresh();
  }
  return (
    <Button variant="outline" size="sm" onClick={run} disabled={disabled}>
      <CheckCheck className="h-4 w-4" /> Mark all read
    </Button>
  );
}
