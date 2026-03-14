"use client";

import Link from "next/link";
import { Board } from "@/lib/types";
import styles from "./ProfileFeaturedBoards.module.css";

interface ProfileFeaturedBoardsProps {
  boards: Board[];
  isOwnProfile?: boolean;
  onEditClick?: () => void;
}

export default function ProfileFeaturedBoards({ boards, isOwnProfile, onEditClick }: ProfileFeaturedBoardsProps) {
  if (boards.length === 0) {
    if (isOwnProfile && onEditClick) {
      return (
        <section className={styles.section}>
          <h2 className={styles.heading}>לוחות מומלצים</h2>
          <button className={styles.emptyState} onClick={onEditClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            הוסיפו לוחות מומלצים לפרופיל
          </button>
        </section>
      );
    }
    return null;
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>לוחות מומלצים</h2>
      <div className={styles.grid}>
        {boards.map((board) => (
          <Link
            key={board.id}
            href={`/boards/${board.id}`}
            className={styles.card}
          >
            <div
              className={styles.accentBar}
              style={{ background: `linear-gradient(135deg, ${board.color}, color-mix(in srgb, ${board.color} 60%, white))` }}
            />
            <div className={styles.cardContent}>
              <h3 className={styles.cardName} style={{ color: board.color }}>
                {board.name}
              </h3>
              {board.description && (
                <p className={styles.cardDesc}>{board.description}</p>
              )}
              <div className={styles.cardMetaRow}>
                <span className={styles.cardMeta}>
                  {board.itemCount} פריטים
                </span>
                {(board.followerCount > 0 || board.likeCount > 0) && (
                  <div className={styles.badges}>
                    {board.followerCount > 0 && (
                      <span className={styles.badge}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                        {board.followerCount}
                      </span>
                    )}
                    {board.likeCount > 0 && (
                      <span className={styles.badge}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                        {board.likeCount}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
