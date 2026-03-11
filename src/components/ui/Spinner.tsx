"use client";

import styles from "./Spinner.module.css";

export default function Spinner({ fullPage = false }: { fullPage?: boolean }) {
  return (
    <div className={`${styles.wrapper} ${fullPage ? styles.fullPage : ""}`} role="status" aria-label="טוען">
      <div className={styles.spinner} />
    </div>
  );
}
