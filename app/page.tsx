"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import AreaSelector from "@/components/AreaSelector";
import AuthModal from "@/components/AuthModal";
import PostCreator from "@/components/PostCreator";
import Feed from "@/components/Feed";
import ReportModal from "@/components/ReportModal";
import Footer from "@/components/Footer";
import { Area, Post, NewPost, Category } from "@/types";
import { supabase } from "@/lib/supabase";

// ── localStorage helpers (keyed by userId so multi-user devices work) ──
function readStoredArea(userId: string): Area | null {
  try {
    const raw = localStorage.getItem(`yourhood_area_${userId}`);
    return raw ? (JSON.parse(raw) as Area) : null;
  } catch { return null; }
}
function writeStoredArea(userId: string, area: Area) {
  try { localStorage.setItem(`yourhood_area_${userId}`, JSON.stringify(area)); } catch {}
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [showAreaSelector, setShowAreaSelector] = useState(false);
  const [areaSelectorRequired, setAreaSelectorRequired] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Category | "all">("all");
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const profileCheckedRef = useRef(false);

  // Load the user's area — localStorage first (instant), then Supabase (cross-device sync)
  const loadArea = useCallback(async (sessionUser: User) => {
    // 1. Check localStorage immediately so UI doesn't flash
    const stored = readStoredArea(sessionUser.id);
    if (stored) {
      setSelectedArea(stored);
    }

    // 2. Try Supabase profile (may override stored if different device)
    try {
      type ProfileRow = {
        area_id: string; area_name: string; province_id: string; province_name: string;
        municipality_id: string | null; ward_number: number | null; ward_places: string[] | null;
        username: string | null;
      };
      const { data: _data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .single();
      const data = _data as ProfileRow | null;

      if (data) {
        const area: Area = {
          id: data.area_id,
          name: data.area_name,
          province_id: data.province_id,
          province_name: data.province_name,
          municipality_id: data.municipality_id ?? undefined,
          ward_number: data.ward_number ?? undefined,
          ward_places: data.ward_places ?? undefined,
        };
        setSelectedArea(area);
        writeStoredArea(sessionUser.id, area); // keep localStorage in sync
        setUsername(data.username ?? sessionUser.user_metadata?.username ?? null);
        return true;
      }

      // Supabase returned no row (PGRST116 = no rows found)
      if (!error || error.code === "PGRST116") {
        setUsername(sessionUser.user_metadata?.username ?? null);
        if (stored) return true;
        return false; // genuinely new user — show area selector
      }

      console.error("[YourHood] profile load error:", error);
    } catch {
      // AbortError thrown when the auth lock is stolen during page reload — not fatal
    }

    setUsername(sessionUser.user_metadata?.username ?? null);
    return !!stored;
  }, []);

  // Auth listener — profile checked exactly once per sign-in cycle
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);

        if (event === "SIGNED_OUT") {
          profileCheckedRef.current = false;
          setSelectedArea(null);
          setUsername(null);
          setAreaSelectorRequired(false);
          setShowAreaSelector(false);
          return;
        }

        if (sessionUser && !profileCheckedRef.current) {
          profileCheckedRef.current = true;
          const hasArea = await loadArea(sessionUser);
          if (!hasArea) {
            setAreaSelectorRequired(true);
            setShowAreaSelector(true);
          }
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [loadArea]);

  async function handleAreaSelect(area: Area) {
    setSelectedArea(area);
    setShowAreaSelector(false);
    setAreaSelectorRequired(false);

    if (user) {
      // Save to localStorage immediately (reliable)
      writeStoredArea(user.id, area);

      // Sync to Supabase in background
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        area_id: area.id,
        area_name: area.name,
        province_id: area.province_id,
        province_name: area.province_name,
        municipality_id: area.municipality_id ?? null,
        ward_number: area.ward_number ?? null,
        ward_places: area.ward_places ?? null,
        username: username ?? user.user_metadata?.username ?? null,
        updated_at: new Date().toISOString(),
      } as never);
      if (error) console.error("[YourHood] profile save error:", error);
    }
  }

  // Posts
  const fetchPosts = useCallback(async (areaId?: string) => {
    setLoading(true);
    let query = supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (areaId) query = query.eq("area_id", areaId);

    const { data, error } = await query;
    if (!error && data) setPosts(data as Post[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts(selectedArea?.id);
  }, [selectedArea, fetchPosts]);

  const visiblePosts = useMemo(() => {
    if (activeFilter === "all") return posts;
    return posts.filter((p) => p.category === activeFilter);
  }, [posts, activeFilter]);

  async function handlePost(newPost: NewPost) {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        ...newPost,
        area_name: selectedArea?.name,
        province_name: selectedArea?.province_name,
        user_id: user?.id ?? "anon",
        posted_by: username ?? user?.email?.split("@")[0] ?? "Anonymous",
      } as never)
      .select()
      .single();

    if (!error && data) setPosts((prev) => [data as Post, ...prev]);
  }

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

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <>
      <Navbar
        selectedArea={selectedArea}
        onAreaClick={() => setShowAreaSelector(true)}
        user={user}
        onSignIn={() => setShowAuthModal(true)}
        onSignOut={handleSignOut}
      />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5 animate-fade-in">
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

        <PostCreator
          selectedArea={selectedArea}
          user={user}
          onPost={handlePost}
          onSelectArea={() => setShowAreaSelector(true)}
          onAuthRequired={() => setShowAuthModal(true)}
        />

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

      <Footer />

      {showAreaSelector && (
        <AreaSelector
          onSelect={handleAreaSelect}
          onClose={() => setShowAreaSelector(false)}
          required={areaSelectorRequired}
        />
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
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
