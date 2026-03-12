"use client";

import Link from "next/link";
import { Board } from "@/lib/types";
import styles from "./ProfileFeaturedBoards.module.css";

interface ProfileFeaturedBoardsProps {
  boards: Board[];
}

export default function ProfileFeaturedBoards({ boards }: ProfileFeaturedBoardsProps) {
  if (boards.length === 0) return null;

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
              style={{ background: board.color }}
            />
            <div className={styles.cardContent}>
              <h3 className={styles.cardName} style={{ color: board.color }}>
                {board.name}
              </h3>
              {board.description && (
                <p className={styles.cardDesc}>{board.description}</p>
              )}
              <span className={styles.cardMeta}>
                {board.itemCount} פריטים
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
