"use client";

import toast from "react-hot-toast";
import styles from "./ShareProfileButton.module.css";

interface ShareProfileButtonProps {
  userId: string;
}

export default function ShareProfileButton({ userId }: ShareProfileButtonProps) {
  async function handleShare() {
    const url = `${window.location.origin}/profile/${userId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("הקישור הועתק!");
    } catch {
      toast.error("לא ניתן להעתיק");
    }
  }

  return (
    <button
      className={styles.shareBtn}
      onClick={handleShare}
      aria-label="שתף פרופיל"
      title="שתף פרופיל"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      שתף פרופיל
    </button>
  );
}
