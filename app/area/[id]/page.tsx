"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Post, Category } from "@/types";
import Feed from "@/components/Feed";
import Navbar from "@/components/Navbar";
import ReportModal from "@/components/ReportModal";

export default function AreaPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<Category | "all">("all");
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);

  const areaName = posts[0]?.area_name ?? "";
  const provinceName = posts[0]?.province_name ?? "";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_: string, session: Session | null) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("area_id", id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error && data) setPosts(data as Post[]);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const visiblePosts = useMemo(() => {
    if (activeFilter === "all") return posts;
    return posts.filter((p) => p.category === activeFilter);
  }, [posts, activeFilter]);

  async function handleDelete(postId: string) {
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", user?.id ?? "");
    if (!error) setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  async function handleReport(postId: string, _reason: string) {
    await supabase.from("posts").update({ reported: true } as never).eq("id", postId);
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, reported: true } : p)));
  }

  return (
    <>
      <Navbar
        selectedArea={null}
        onAreaClick={() => router.push("/")}
        user={user}
        onSignIn={() => router.push("/")}
        onSignOut={async () => { await supabase.auth.signOut(); }}
      />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>

        {!loading && (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
            <div className="flex items-start gap-3">
              <span className="text-3xl">📍</span>
              <div>
                <h1 className="text-xl font-bold text-white leading-tight">
                  {areaName || "Area"}
                </h1>
                {provinceName && (
                  <p className="text-zinc-400 text-sm mt-0.5">{provinceName}</p>
                )}
                <p className="text-zinc-500 text-xs mt-2">
                  {posts.length} {posts.length === 1 ? "post" : "posts"}
                </p>
              </div>
            </div>
          </div>
        )}

        <Feed
          posts={visiblePosts}
          loading={loading}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onReport={(postId) => setReportingPostId(postId)}
          onDelete={handleDelete}
          currentUserId={user?.id}
        />
      </main>

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
