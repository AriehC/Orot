"use client";

import { useState, useEffect } from "react";
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

interface BoardDetailClientProps {
  boardId: string;
  initialBoard: Board | null;
  initialPosts: Post[];
}

export default function BoardDetailClient({ boardId, initialBoard, initialPosts }: BoardDetailClientProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [board, setBoard] = useState<Board | null>(initialBoard);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(!initialBoard);

  const { isLiked, handleLike } = useLike();
  const { isSaved, handleSave } = useSave();

  useEffect(() => {
    // If we got server-rendered data, still refresh client-side for real-time accuracy
    async function load() {
      try {
        const b = await getBoard(boardId);
        if (!b) {
          if (!initialBoard) router.push("/");
          return;
        }
        setBoard(b);
        const p = await getBoardPosts(boardId);
        setPosts(p);
        setLoading(false);
      } catch (error) {
        console.error("BoardDetailClient: failed to load board:", error);
        toast.error("שגיאה בטעינת הלוח");
        setLoading(false);
      }
    }
    load();
  }, [boardId, router, initialBoard]);

  if (!board && loading) return <Spinner fullPage />;
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
              <span aria-label={board.isPublic ? "ציבורי" : "פרטי"}>{board.isPublic ? "\uD83C\uDF10" : "\uD83D\uDD12"}</span>
            </div>
            {board.description && <p className={styles.description}>{board.description}</p>}
          </div>
        </div>

        <MasonryFeed
          posts={posts}
          loading={loading && initialPosts.length === 0}
          isLiked={isLiked}
          isSaved={isSaved}
          onLike={(id) => user ? handleLike(id) : toast("יש להתחבר")}
          onSave={(id) => user ? handleSave(id) : toast("יש להתחבר")}
        />
      </main>
    </>
  );
}
