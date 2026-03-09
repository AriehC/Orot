"use client";

import { useState, useEffect } from "react";
import { getFeedStats } from "@/lib/firestore";
import styles from "./FeedStats.module.css";

export default function FeedStats() {
  const [stats, setStats] = useState({ postCount: 0, newCount: 0, boardCount: 0, totalLikes: 0 });

  useEffect(() => {
    getFeedStats().then(setStats).catch(() => {});
  }, []);

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
