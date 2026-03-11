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
import styles from "./BoardDetail.module.css";

export default function BoardClient({ params }: { params: Promise<{ boardId: string }> }) {
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
      try {
        const b = await getBoard(boardId);
        if (!b) {
          router.push("/");
          return;
        }
        setBoard(b);
        const p = await getBoardPosts(boardId);
        setPosts(p);
        setLoading(false);
      } catch (error) {
        console.error("BoardClient: failed to load board:", error);
        toast.error("שגיאה בטעינת הלוח");
        setLoading(false);
      }
    }
    load();
  }, [boardId, router]);

  if (!board) return <Spinner fullPage />;

  return (
    <>
      <Navbar searchQuery="" onSearchChange={() => {}} onCreateClick={() => {}} />

      <main id="main-content">
        <div className={styles.container}>
          <div className={styles.header}>
            <Link href="/" className={styles.backBtn}>
              ← חזרה
            </Link>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{board.name}</h1>
              <span aria-label={board.isPublic ? "ציבורי" : "פרטי"}>{board.isPublic ? "🌐" : "🔒"}</span>
            </div>
            {board.description && <p className={styles.description}>{board.description}</p>}
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
      </main>
    </>
  );
}
