"use client";

import Link from "next/link";
import styles from "../../error.module.css";

export default function BoardDetailError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>✦</div>
        <h1 className={styles.title}>שגיאה בטעינת הלוח</h1>
        <p className={styles.subtitle}>
          לא הצלחנו לטעון את הלוח. ייתכן שהוא נמחק או שאין לכם הרשאה לצפות בו.
        </p>
        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={reset}>
            נסו שוב
          </button>
          <Link href="/boards" className={styles.secondaryBtn}>
            חזרה ללוחות
          </Link>
        </div>
      </div>
    </div>
  );
}
