"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import BoardCard from "@/components/boards/BoardCard";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import { getPublicBoards } from "@/lib/firestore";
import { Board } from "@/lib/types";
import { useBoardLike } from "@/hooks/useBoardLike";
import { useBoardFollow } from "@/hooks/useBoardFollow";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import styles from "./boards.module.css";

export default function BoardsDiscoverPage() {
  const { user } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"popular" | "recent">("popular");
  const { isBoardLiked, handleBoardLike } = useBoardLike();
  const { isBoardFollowed, handleBoardFollow } = useBoardFollow();

  useEffect(() => {
    setLoading(true);
    getPublicBoards(sortBy, 30).then((b) => {
      setBoards(b);
      setLoading(false);
    });
  }, [sortBy]);

  function handleLike(boardId: string) {
    if (!user) { toast("יש להתחבר"); return; }
    handleBoardLike(boardId);
  }

  function handleFollow(boardId: string) {
    if (!user) { toast("יש להתחבר"); return; }
    handleBoardFollow(boardId);
  }

  return (
    <>
      <Navbar searchQuery="" onSearchChange={() => {}} onCreateClick={() => {}} />

      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>גלו לוחות</h1>
            <p className={styles.subtitle}>אוספים ציבוריים של תוכן רוחני מכל הקהילה</p>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={sortBy === "popular" ? styles.tabActive : styles.tab}
            onClick={() => setSortBy("popular")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            פופולרי
          </button>
          <button
            className={sortBy === "recent" ? styles.tabActive : styles.tab}
            onClick={() => setSortBy("recent")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            חדשים
          </button>
        </div>

        {loading ? (
          <Spinner />
        ) : boards.length === 0 ? (
          <EmptyState icon="📋" text="עדיין אין לוחות ציבוריים" />
        ) : (
          <div className={styles.grid}>
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                isLiked={isBoardLiked(board.id)}
                isFollowed={isBoardFollowed(board.id)}
                onLike={handleLike}
                onFollow={handleFollow}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
