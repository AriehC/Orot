import Link from "next/link";
import styles from "./error.module.css";

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>הדף לא נמצא</h1>
        <p className={styles.subtitle}>
          הדף שחיפשתם לא קיים, או שהוסר. אולי תמצאו השראה בדף הבית?
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.primaryBtn}>
            חזרה לדף הבית
          </Link>
        </div>
      </div>
    </div>
  );
}
