"use client";

import Link from "next/link";
import styles from "./error.module.css";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>✦</div>
        <h1 className={styles.title}>אופס, משהו השתבש</h1>
        <p className={styles.subtitle}>
          נתקלנו בבעיה בלתי צפויה. אפשר לנסות שוב או לחזור לדף הבית.
        </p>
        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={reset}>
            נסו שוב
          </button>
          <Link href="/" className={styles.secondaryBtn}>
            חזרה לדף הבית
          </Link>
        </div>
      </div>
    </div>
  );
}
