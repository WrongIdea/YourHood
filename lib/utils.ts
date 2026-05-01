import { Category } from "@/types";

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const CATEGORY_CONFIG: Record<
  Category,
  { label: string; emoji: string; color: string; bg: string; border: string }
> = {
  alert: {
    label: "Safety Alert",
    emoji: "🚨",
    color: "text-red-400",
    bg: "bg-red-950/50",
    border: "border-red-800/60",
  },
  outage: {
    label: "Service Issue",
    emoji: "💧",
    color: "text-amber-400",
    bg: "bg-amber-950/50",
    border: "border-amber-800/60",
  },
  lost_found: {
    label: "Lost & Found",
    emoji: "🐾",
    color: "text-sky-400",
    bg: "bg-sky-950/50",
    border: "border-sky-800/60",
  },
  announcement: {
    label: "Announcement",
    emoji: "📢",
    color: "text-emerald-400",
    bg: "bg-emerald-950/50",
    border: "border-emerald-800/60",
  },
};
