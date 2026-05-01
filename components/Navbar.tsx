"use client";

import { Area } from "@/types";

interface NavbarProps {
  selectedArea: Area | null;
  onAreaClick: () => void;
}

export default function Navbar({ selectedArea, onAreaClick }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white tracking-tight">
            Your<span className="text-emerald-400">Hood</span>
          </span>
        </div>

        <button
          onClick={onAreaClick}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors border border-zinc-700"
        >
          <span className="text-base">📍</span>
          {selectedArea ? (
            <span className="flex flex-col items-start leading-tight">
              <span className="max-w-[130px] truncate font-medium">{selectedArea.name}</span>
              <span className="text-zinc-500 text-[10px] max-w-[130px] truncate">{selectedArea.province_name}</span>
            </span>
          ) : (
            <span>Select area</span>
          )}
          <svg className="w-3 h-3 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
