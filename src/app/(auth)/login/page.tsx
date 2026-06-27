"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, ListTodo, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { APP_CONFIG, DEMO_ACCOUNTS } from "@/config/app.config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Login failed");
        return;
      }
      toast.success(`Welcome, ${json.data.name.split(" ")[0]}`);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(acc: { email: string; password: string }) {
    setEmail(acc.email);
    setPassword(acc.password);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #10b981, transparent 70%)" }}
        />
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
            {APP_CONFIG.company[0]}
          </span>
          <span className="text-lg font-semibold">{APP_CONFIG.name}</span>
        </div>

        <div className="relative space-y-6">
          <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight">
            People, attendance, and tasks — managed in one calm place.
          </h1>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-center gap-3">
              <CalendarCheck className="h-5 w-5 text-primary" /> Geo-verified check-in & live attendance
            </li>
            <li className="flex items-center gap-3">
              <ListTodo className="h-5 w-5 text-primary" /> Task assignment with approval workflow
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" /> Role-based access, fully configurable
            </li>
          </ul>
        </div>

        <p className="relative text-xs text-slate-400">
          {APP_CONFIG.fullName} · © {APP_CONFIG.company}
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
            <p className="text-sm text-muted-foreground">
              Use a demo account below, or your own credentials.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Try a demo account
            </p>
            <div className="grid gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                >
                  <span className="font-medium text-foreground">{acc.label}</span>
                  <span className="text-xs text-muted-foreground">{acc.email}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground">Password for all demos: demo1234</p>
          </div>
        </div>
      </div>
    </div>
  );
}
