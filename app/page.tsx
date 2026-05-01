"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import AreaSelector from "@/components/AreaSelector";
import PostCreator from "@/components/PostCreator";
import Feed from "@/components/Feed";
import ReportModal from "@/components/ReportModal";
import Footer from "@/components/Footer";
import { Area, Post, NewPost, Category } from "@/types";
import { MOCK_POSTS, MUNICIPALITIES } from "@/lib/mock-data";

export default function Home() {
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [showAreaSelector, setShowAreaSelector] = useState(false);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [activeFilter, setActiveFilter] = useState<Category | "all">("all");
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);

  const visiblePosts = useMemo(() => {
    let filtered = [...posts].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    if (selectedArea) {
      filtered = filtered.filter((p) => p.area_id === selectedArea.id);
    }
    if (activeFilter !== "all") {
      filtered = filtered.filter((p) => p.category === activeFilter);
    }
    return filtered;
  }, [posts, selectedArea, activeFilter]);

  function handlePost(newPost: NewPost) {
    const area = MUNICIPALITIES.find((a) => a.id === newPost.area_id);
    const post: Post = {
      id: crypto.randomUUID(),
      ...newPost,
      area_name: area?.name,
      province_name: area?.province_name,
      user_id: "anon",
      created_at: new Date().toISOString(),
    };
    setPosts((prev) => [post, ...prev]);
  }

  function handleReport(postId: string, _reason: string) {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, reported: true } : p))
    );
  }

  return (
    <>
      <Navbar selectedArea={selectedArea} onAreaClick={() => setShowAreaSelector(true)} />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5 animate-fade-in">
        {/* Tagline */}
        {!selectedArea && (
          <div className="text-center py-8 animate-fade-up">
            <h1 className="text-2xl font-bold text-white mb-2">
              Your digital <span className="text-emerald-400">neighbourhood</span> board
            </h1>
            <p className="text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed">
              Safety alerts, service outages, lost &amp; found, and community events — all in one place.
            </p>
            <button
              onClick={() => setShowAreaSelector(true)}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <span>📍</span>
              <span>Pick your area</span>
            </button>
          </div>
        )}

        {/* Post creator */}
        <PostCreator
          selectedArea={selectedArea}
          onPost={handlePost}
          onSelectArea={() => setShowAreaSelector(true)}
        />

        {/* Feed */}
        <Feed
          posts={visiblePosts}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onReport={(postId) => setReportingPostId(postId)}
        />
      </main>

      <Footer />

      {/* Modals */}
      {showAreaSelector && (
        <AreaSelector
          onSelect={setSelectedArea}
          onClose={() => setShowAreaSelector(false)}
        />
      )}

      {reportingPostId && (
        <ReportModal
          postId={reportingPostId}
          onClose={() => setReportingPostId(null)}
          onReport={handleReport}
        />
      )}
    </>
  );
}
