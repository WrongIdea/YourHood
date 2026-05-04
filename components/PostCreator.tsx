"use client";

import { useState, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { Category, NewPost, Area } from "@/types";
import { CATEGORY_CONFIG } from "@/lib/utils";

interface PostCreatorProps {
  selectedArea: Area | null;
  user: User | null;
  onPost: (post: NewPost) => void;
  onSelectArea: () => void;
  onAuthRequired: () => void;
}

const CATEGORIES: Category[] = ["alert", "outage", "lost_found", "announcement"];

export default function PostCreator({ selectedArea, user, onPost, onSelectArea, onAuthRequired }: PostCreatorProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Category>("announcement");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleOpen() {
    if (!user) { onAuthRequired(); return; }
    if (!selectedArea) { onSelectArea(); return; }
    setOpen(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  async function handleSubmit() {
    if (!content.trim() || !selectedArea) return;
    setSubmitting(true);
    await onPost({ area_id: selectedArea.id, category, content: content.trim() });
    setContent("");
    setCategory("announcement");
    setSubmitting(false);
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="w-full bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 rounded-2xl px-4 py-3.5 text-left text-zinc-500 text-sm transition-colors flex items-center gap-3"
      >
        <span className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-base shrink-0">📣</span>
        <span>
          {!user
            ? "Sign in to post in your community"
            : `What's happening in ${selectedArea ? selectedArea.name : "your area"}?`}
        </span>
      </button>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-xl">
      {/* Category picker */}
      <div className="flex gap-1.5 p-3 border-b border-zinc-800 overflow-x-auto">
        {CATEGORIES.map((cat) => {
          const cfg = CATEGORY_CONFIG[cat];
          const active = category === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                active
                  ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              <span>{cfg.emoji}</span>
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Text area */}
      <div className="p-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Share a ${CATEGORY_CONFIG[category].label.toLowerCase()} in ${selectedArea?.name ?? "your area"}...`}
          rows={4}
          maxLength={500}
          className="w-full bg-transparent text-white placeholder-zinc-500 text-sm resize-none outline-none leading-relaxed"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-zinc-600">{content.length}/500</span>
          <div className="flex gap-2">
            <button
              onClick={() => { setOpen(false); setContent(""); }}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || submitting}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
