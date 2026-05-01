"use client";

import { Post } from "@/types";
import { CATEGORY_CONFIG, timeAgo } from "@/lib/utils";
import { useState } from "react";

interface PostCardProps {
  post: Post;
  onReport: (postId: string) => void;
}

export default function PostCard({ post, onReport }: PostCardProps) {
  const cfg = CATEGORY_CONFIG[post.category];
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article className={`rounded-2xl border p-4 ${cfg.bg} ${cfg.border} relative`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
            <span>{cfg.emoji}</span>
            <span>{cfg.label}</span>
          </span>
        </div>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="text-zinc-600 hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-zinc-800/50 shrink-0"
          aria-label="Post options"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-4 top-10 z-20 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl overflow-hidden min-w-[140px]">
              <button
                onClick={() => { onReport(post.id); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                </svg>
                Report post
              </button>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <p className="text-zinc-100 text-sm leading-relaxed mb-3">{post.content}</p>

      {/* Image */}
      {post.image_url && (
        <div className="rounded-xl overflow-hidden mb-3 border border-zinc-700/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image_url} alt="Post image" className="w-full object-cover max-h-64" />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <span>📍</span>
          <span>{post.area_name}</span>
          {post.province_name && (
            <span className="text-zinc-700">· {post.province_name}</span>
          )}
        </span>
        <span>·</span>
        <span>{timeAgo(post.created_at)}</span>
      </div>
    </article>
  );
}
