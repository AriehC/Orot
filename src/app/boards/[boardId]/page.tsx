"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBoard, getBoardPosts } from "@/lib/firestore";
import { Board, Post } from "@/lib/types";
import { useLike } from "@/hooks/useLike";
import { useSave } from "@/hooks/useSave";
import { useAuth } from "@/contexts/AuthContext";
import MasonryFeed from "@/components/feed/MasonryFeed";
import Navbar from "@/components/layout/Navbar";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";

export default function BoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [board, setBoard] = useState<Board | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const { isLiked, handleLike } = useLike();
  const { isSaved, handleSave } = useSave();

  useEffect(() => {
    async function load() {
      const b = await getBoard(boardId);
      if (!b) {
        router.push("/");
        return;
      }
      setBoard(b);
      const p = await getBoardPosts(boardId);
      setPosts(p);
      setLoading(false);
    }
    load();
  }, [boardId, router]);

  if (!board) return <Spinner fullPage />;

  return (
    <>
      <Navbar searchQuery="" onSearchChange={() => {}} onCreateClick={() => {}} />

      <div style={{ maxWidth: "var(--content-max-width)", margin: "0 auto", padding: "24px var(--page-padding)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <Link
            href="/"
            style={{
              padding: "8px 12px",
              border: "1.5px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              background: "white",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "var(--text-secondary)",
            }}
          >
            ← חזרה
          </Link>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24 }}>{board.name}</h2>
              <span style={{ fontSize: 14 }}>{board.isPublic ? "🌐" : "🔒"}</span>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>{board.description}</p>
          </div>
        </div>
      </div>

      <MasonryFeed
        posts={posts}
        loading={loading}
        isLiked={isLiked}
        isSaved={isSaved}
        onLike={(id) => user ? handleLike(id) : toast("יש להתחבר")}
        onSave={(id) => user ? handleSave(id) : toast("יש להתחבר")}
      />
    </>
  );
}
