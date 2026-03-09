"use client";

import Link from "next/link";
import { Post } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import styles from "./ContentCard.module.css";

interface ContentCardProps {
  post: Post;
  index: number;
  isLiked: boolean;
  isSaved: boolean;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
}

const TYPE_CONFIG = {
  note: { label: "פתק", bg: "#FFF3E8", color: "#C17B4A" },
  quote: { label: "ציטוט", bg: "#F0E8FF", color: "#9B7ED8" },
  image: { label: "תמונה", bg: "#E8F5ED", color: "#5DA87E" },
  video: { label: "וידאו", bg: "#E8F0F5", color: "#6B8FA3" },
};

function isNewPost(createdAt: { toMillis: () => number }): boolean {
  return Date.now() - createdAt.toMillis() < 86400000;
}

export default function ContentCard({ post, index, isLiked, isSaved, onLike, onSave }: ContentCardProps) {
  const typeConfig = TYPE_CONFIG[post.type];
  const isNew = isNewPost(post.createdAt);

  return (
    <div
      className={styles.card}
      style={{
        backgroundColor: post.color || "#FFFFFF",
        animationDelay: `${index * 0.06}s`,
      }}
    >
      {isNew && (
        <div className={styles.newBadge}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" /></svg>
          חדש
        </div>
      )}

      {post.mediaURL && (post.type === "image" || post.type === "video") && (
        <div style={{ position: "relative" }}>
          <img
            className={styles.cardImage}
            src={post.thumbnailURL || post.mediaURL}
            alt={post.title}
            loading="lazy"
          />
          {post.type === "video" && (
            <div className={styles.videoOverlay}>
              <div className={styles.playBtn}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="none">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={styles.cardBody}>
        <span
          className={styles.typeBadge}
          style={{ background: typeConfig.bg, color: typeConfig.color }}
        >
          {typeConfig.label}
        </span>

        <h3 className={styles.cardTitle}>{post.title}</h3>

        {post.type === "quote" ? (
          <p className={styles.quoteBody}>{post.body}</p>
        ) : (
          <p className={styles.cardText}>{post.body}</p>
        )}

        {post.tags.length > 0 && (
          <div className={styles.tags}>
            {post.tags.map((tag) => (
              <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`} className={styles.tag} onClick={(e) => e.stopPropagation()}>#{tag}</Link>
            ))}
          </div>
        )}

        <div className={styles.cardFooter}>
          <span className={styles.author}>{post.authorName}</span>
          <div className={styles.actions}>
            <button
              className={`${styles.actionBtn} ${isLiked ? styles.liked : ""}`}
              onClick={(e) => { e.stopPropagation(); onLike(post.id); }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={isLiked ? "#E85D75" : "none"} stroke={isLiked ? "#E85D75" : "currentColor"} strokeWidth="2" strokeLinecap="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{formatNumber(post.likeCount + (isLiked ? 1 : 0))}</span>
            </button>
            <button
              className={`${styles.actionBtn} ${isSaved ? styles.saved : ""}`}
              onClick={(e) => { e.stopPropagation(); onSave(post.id); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
