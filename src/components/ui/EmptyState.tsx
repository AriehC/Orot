import styles from "./EmptyState.module.css";

export default function EmptyState({ icon = "🌿", text }: { icon?: string; text: string }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.icon}>{icon}</div>
      <p className={styles.text}>{text}</p>
    </div>
  );
}
