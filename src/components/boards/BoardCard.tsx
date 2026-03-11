"use client";

import Link from "next/link";
import { Board } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import styles from "./BoardCard.module.css";

interface BoardCardProps {
  board: Board;
  isLiked?: boolean;
  isFollowed?: boolean;
  onLike?: (boardId: string) => void;
  onFollow?: (boardId: string) => void;
  isMainBoard?: boolean;
}

export default function BoardCard({ board, isLiked, isFollowed, onLike, onFollow, isMainBoard }: BoardCardProps) {
  return (
    <div className={styles.card} style={{ borderColor: board.color + "40" }}>
      <Link href={`/boards/${board.id}`} className={styles.cardLink}>
        <div className={styles.colorBar} style={{ background: board.color }} />
        <div className={styles.body}>
          <div className={styles.titleRow}>
            <h3 className={styles.name} style={{ color: board.color }}>{board.name}</h3>
            {isMainBoard && <span className={styles.mainBadge}>ראשי</span>}
            {!board.isPublic && <span className={styles.privateBadge}>פרטי</span>}
          </div>
          {board.description && (
            <p className={styles.description}>{board.description}</p>
          )}
          <div className={styles.meta}>
            {board.ownerName && (
              <span className={styles.owner}>{board.ownerName}</span>
            )}
            <span>{board.itemCount} פריטים</span>
            <span>{formatNumber(board.followerCount)} עוקבים</span>
          </div>
        </div>
      </Link>
      {(onLike || onFollow) && (
        <div className={styles.actions}>
          {onLike && (
            <button
              className={`${styles.actionBtn} ${isLiked ? styles.liked : ""}`}
              onClick={(e) => { e.preventDefault(); onLike(board.id); }}
              aria-label={isLiked ? `הסר לייק מ${board.name}` : `לייק ל${board.name}`}
              aria-pressed={isLiked}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{formatNumber(board.likeCount + (isLiked ? 1 : 0))}</span>
            </button>
          )}
          {onFollow && (
            <button
              className={`${styles.followBtn} ${isFollowed ? styles.following : ""}`}
              onClick={(e) => { e.preventDefault(); onFollow(board.id); }}
              aria-label={isFollowed ? `הפסק לעקוב אחרי ${board.name}` : `עקוב אחרי ${board.name}`}
              aria-pressed={isFollowed}
            >
              {isFollowed ? "עוקב" : "עקוב"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
