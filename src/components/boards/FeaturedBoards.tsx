"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPublicBoards } from "@/lib/firestore";
import { Board } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { useBoardLike } from "@/hooks/useBoardLike";
import { useBoardFollow } from "@/hooks/useBoardFollow";
import styles from "./FeaturedBoards.module.css";

export default function FeaturedBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const { isBoardLiked, handleBoardLike } = useBoardLike();
  const { isBoardFollowed, handleBoardFollow } = useBoardFollow();

  useEffect(() => {
    getPublicBoards("popular", 8)
      .then((b) => {
        setBoards(b);
        setLoading(false);
      })
      .catch((error) => {
        console.error("FeaturedBoards: failed to load boards:", error);
        setLoading(false);
      });
  }, []);

  if (loading || boards.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          לוחות מומלצים
        </h2>
        <Link href="/boards" className={styles.seeAll}>
          ראה הכל
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
      </div>
      <div className={styles.scrollContainer}>
        <div className={styles.scrollInner}>
          {boards.map((board) => {
            const liked = isBoardLiked(board.id);
            const followed = isBoardFollowed(board.id);
            return (
              <div key={board.id} className={styles.card}>
                <Link href={`/boards/${board.id}`} className={styles.cardLink}>
                  <div className={styles.colorAccent} style={{ background: board.color }} />
                  <h3 className={styles.cardName} style={{ color: board.color }}>{board.name}</h3>
                  {board.description && (
                    <p className={styles.cardDesc}>{board.description}</p>
                  )}
                  <div className={styles.cardMeta}>
                    <span>{board.ownerName}</span>
                    <span>{board.itemCount} פריטים</span>
                    <span>{formatNumber(board.followerCount)} עוקבים</span>
                  </div>
                </Link>
                <div className={styles.cardActions}>
                  <button
                    className={`${styles.likeBtn} ${liked ? styles.liked : ""}`}
                    onClick={() => handleBoardLike(board.id)}
                    aria-label={liked ? `הסר לייק מ${board.name}` : `לייק ל${board.name}`}
                    aria-pressed={liked}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                  <button
                    className={`${styles.followBtnSmall} ${followed ? styles.followingSmall : ""}`}
                    onClick={() => handleBoardFollow(board.id)}
                    aria-label={followed ? `הפסק לעקוב אחרי ${board.name}` : `עקוב אחרי ${board.name}`}
                    aria-pressed={followed}
                  >
                    {followed ? "עוקב" : "עקוב"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
