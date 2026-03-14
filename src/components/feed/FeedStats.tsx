"use client";

import { useState, useEffect } from "react";
import { getFeedStats } from "@/lib/firestore";
import styles from "./FeedStats.module.css";

export default function FeedStats() {
  const [stats, setStats] = useState<{ postCount: number; newCount: number; boardCount: number; totalLikes: number } | null>(null);

  useEffect(() => {
    getFeedStats()
      .then(setStats)
      .catch((error) => {
        console.error("FeedStats: failed to load stats:", error);
      });
  }, []);

  if (!stats) {
    return (
      <div className={styles.bar}>
        <div className={`${styles.item} ${styles.skeleton}`}><span className={styles.skeletonNumber} /> פתקים</div>
        <div className={`${styles.item} ${styles.skeleton}`}><span className={styles.skeletonNumber} /> חדשים</div>
        <div className={`${styles.item} ${styles.skeleton}`}><span className={styles.skeletonNumber} /> לוחות</div>
        <div className={`${styles.item} ${styles.skeleton}`}><span className={styles.skeletonNumber} /> לייקים</div>
      </div>
    );
  }

  return (
    <div className={styles.bar}>
      <div className={styles.item}>
        <span className={styles.number}>{stats.postCount}</span> פתקים
      </div>
      <div className={styles.item}>
        <span className={styles.number}>{stats.newCount}</span> חדשים
      </div>
      <div className={styles.item}>
        <span className={styles.number}>{stats.boardCount}</span> לוחות
      </div>
      <div className={styles.item}>
        <span className={styles.number}>{stats.totalLikes.toLocaleString()}</span> לייקים
      </div>
    </div>
  );
}
