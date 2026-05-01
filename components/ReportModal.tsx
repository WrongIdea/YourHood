"use client";

import { useState } from "react";

interface ReportModalProps {
  postId: string;
  onClose: () => void;
  onReport: (postId: string, reason: string) => void;
}

const REASONS = [
  "False information",
  "Spam or irrelevant",
  "Offensive content",
  "Misleading safety alert",
  "Other",
];

export default function ReportModal({ postId, onClose, onReport }: ReportModalProps) {
  const [selected, setSelected] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleReport() {
    if (!selected) return;
    onReport(postId, selected);
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden">
        {submitted ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-white font-semibold mb-1">Report submitted</p>
            <p className="text-zinc-400 text-sm mb-5">Thanks for helping keep YourHood safe.</p>
            <button onClick={onClose} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-colors">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-white font-semibold">Report post</h2>
              <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <p className="text-zinc-400 text-sm mb-3">Why are you reporting this post?</p>
              <ul className="space-y-2">
                {REASONS.map((reason) => (
                  <li key={reason}>
                    <button
                      onClick={() => setSelected(reason)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors border ${
                        selected === reason
                          ? "bg-emerald-900/40 border-emerald-600 text-emerald-300"
                          : "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
                      }`}
                    >
                      {reason}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleReport}
                disabled={!selected}
                className="mt-4 w-full py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Submit report
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
