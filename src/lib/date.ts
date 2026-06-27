/**
 * Date & time helpers.
 * Storage rule: timestamps are stored in UTC (ISO strings).
 * Display rule: render in the company timezone via Intl.
 */

import { DEFAULT_SETTINGS } from "@/config/app.config";

const TZ = DEFAULT_SETTINGS.timezone;

/** "2026-06-27" for a given date (defaults to now), in company timezone. */
export function toDateKey(date: Date = new Date(), tz: string = TZ) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(date); // en-CA yields YYYY-MM-DD
}

/** "09:42 AM" in company timezone from an ISO string. */
export function formatTime(iso?: string, tz: string = TZ) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** "27 Jun 2026" from an ISO string or date key. */
export function formatDate(value?: string, tz: string = TZ) {
  if (!value) return "—";
  const d = value.length === 10 ? new Date(value + "T00:00:00Z") : new Date(value);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: value.length === 10 ? "UTC" : tz,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** "3h 45m" from a number of minutes. */
export function formatDuration(minutes: number) {
  if (!minutes || minutes < 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/** Inclusive whole-day difference between two date keys (YYYY-MM-DD). */
export function dayCount(from: string, to: string) {
  const a = new Date(from + "T00:00:00Z").getTime();
  const b = new Date(to + "T00:00:00Z").getTime();
  return Math.max(1, Math.round((b - a) / 86_400_000) + 1);
}

/** Minutes since midnight for a "HH:mm" string. */
export function minutesOfDay(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
