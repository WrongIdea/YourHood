"use client";

import { Post, Category } from "@/types";
import PostCard from "./PostCard";
import { CATEGORY_CONFIG } from "@/lib/utils";

interface FeedProps {
  posts: Post[];
  activeFilter: Category | "all";
  onFilterChange: (f: Category | "all") => void;
  onReport: (postId: string) => void;
  onDelete: (postId: string) => void;
  currentUserId?: string | null;
  loading?: boolean;
}

const FILTERS: Array<{ key: Category | "all"; label: string; emoji: string }> = [
  { key: "all", label: "All", emoji: "🏘️" },
  { key: "alert", label: "Alerts", emoji: CATEGORY_CONFIG.alert.emoji },
  { key: "outage", label: "Outages", emoji: CATEGORY_CONFIG.outage.emoji },
  { key: "lost_found", label: "Lost & Found", emoji: CATEGORY_CONFIG.lost_found.emoji },
  { key: "announcement", label: "Events", emoji: CATEGORY_CONFIG.announcement.emoji },
];

export default function Feed({ posts, activeFilter, onFilterChange, onReport, onDelete, currentUserId, loading }: FeedProps) {
  return (
    <section>
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mb-4">
        {FILTERS.map((f) => {
          const active = activeFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
                active
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200"
              }`}
            >
              <span>{f.emoji}</span>
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-zinc-800/50 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🏘️</p>
          <p className="text-zinc-400 text-sm">No posts in this area yet.</p>
          <p className="text-zinc-600 text-xs mt-1">Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} onReport={onReport} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  );
}
