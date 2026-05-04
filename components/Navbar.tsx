"use client";

import type { User } from "@supabase/supabase-js";
import { Area } from "@/types";

interface NavbarProps {
  selectedArea: Area | null;
  onAreaClick: () => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export default function Navbar({ selectedArea, onAreaClick, user, onSignIn, onSignOut }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-bold text-white tracking-tight">
            Your<span className="text-emerald-400">Hood</span>
          </span>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          {/* Area picker */}
          <button
            onClick={onAreaClick}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors border border-zinc-700 min-w-0"
          >
            <span className="text-base shrink-0">📍</span>
            {selectedArea ? (
              <span className="flex flex-col items-start leading-tight min-w-0">
                <span className="max-w-[110px] truncate font-medium">{selectedArea.name}</span>
                <span className="text-zinc-500 text-[10px] max-w-[110px] truncate">{selectedArea.province_name}</span>
              </span>
            ) : (
              <span className="whitespace-nowrap">Select area</span>
            )}
            <svg className="w-3 h-3 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-2 shrink-0">
              <div
                title={user.email}
                className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs cursor-default"
              >
                {user.email?.[0].toUpperCase() ?? "U"}
              </div>
              <button
                onClick={onSignOut}
                className="text-zinc-400 hover:text-white text-xs transition-colors hidden sm:block whitespace-nowrap"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="shrink-0 text-sm px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition-colors whitespace-nowrap"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
