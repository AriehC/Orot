import { Timestamp } from "firebase/firestore";

/**
 * Milliseconds from a Firestore Timestamp — or from the plain { seconds, nanoseconds }
 * object that server-rendered (firestore-server) data arrives as.
 */
export function timestampMillis(ts: Timestamp | { seconds: number; nanoseconds: number } | null | undefined): number {
  if (!ts) return 0;
  if (typeof (ts as Timestamp).toMillis === "function") return (ts as Timestamp).toMillis();
  return ts.seconds * 1000 + Math.floor(ts.nanoseconds / 1e6);
}

export function formatRelativeTime(timestamp: Timestamp): string {
  const now = Date.now();
  const time = timestampMillis(timestamp);
  const diff = now - time;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "עכשיו";
  if (minutes < 60) return `לפני ${minutes} דקות`;
  if (hours < 24) return `לפני ${hours} שעות`;
  if (days < 7) return `לפני ${days} ימים`;
  if (days < 30) return `לפני ${Math.floor(days / 7)} שבועות`;
  return new Date(time).toLocaleDateString("he-IL");
}

export function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + "...";
}
