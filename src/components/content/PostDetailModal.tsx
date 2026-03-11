"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Post } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import EditPostModal from "./EditPostModal";
import MeditationTimer from "./MeditationTimer";
import toast from "react-hot-toast";
import styles from "./PostDetailModal.module.css";

interface PostDetailModalProps {
  post: Post;
  currentUserId?: string;
  isLiked: boolean;
  isSaved: boolean;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onClose: () => void;
}

const TYPE_CONFIG = {
  note: { label: "פתק", bg: "#FFF3E8", color: "#C17B4A" },
  quote: { label: "ציטוט", bg: "#F0E8FF", color: "#9B7ED8" },
  image: { label: "תמונה", bg: "#E8F5ED", color: "#5DA87E" },
  video: { label: "וידאו", bg: "#E8F0F5", color: "#6B8FA3" },
};

export default function PostDetailModal({
  post,
  currentUserId,
  isLiked,
  isSaved,
  onLike,
  onSave,
  onClose,
}: PostDetailModalProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [currentPost, setCurrentPost] = useState(post);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const typeConfig = TYPE_CONFIG[currentPost.type];
  const isOwner = currentUserId === currentPost.authorId;
  const isMeditation = currentPost.tags.some((t) =>
    ["מדיטציה", "מיינדפולנס", "נשימה", "מדיטציות"].includes(t)
  );

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input:not([type="hidden"]), select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const closeBtn = modalRef.current?.querySelector<HTMLElement>("button");
    closeBtn?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    };
  }, [onClose]);

  async function handleShare() {
    const text = `${currentPost.title}\n\n${currentPost.body}\n\n— ${currentPost.authorName}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: currentPost.title, text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast("הטקסט הועתק");
    }
  }

  if (showEdit) {
    return (
      <EditPostModal
        post={currentPost}
        onClose={() => setShowEdit(false)}
        onSaved={(updated) => {
          setCurrentPost({ ...currentPost, ...updated });
          setShowEdit(false);
        }}
      />
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={modalRef}
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-label={currentPost.title}
        style={{ backgroundColor: currentPost.color || "#FFFFFF" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={onClose} aria-label="סגור">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {isOwner && (
          <button className={styles.editBtn} onClick={() => setShowEdit(true)} aria-label="עריכת פוסט">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            עריכה
          </button>
        )}

        {currentPost.mediaURL && (currentPost.type === "image" || currentPost.type === "video") && (
          <img
            className={styles.media}
            src={currentPost.mediaURL}
            alt={currentPost.title}
          />
        )}

        <div className={styles.body}>
          <span
            className={styles.typeBadge}
            style={{ background: typeConfig.bg, color: typeConfig.color }}
          >
            {typeConfig.label}
          </span>

          <h2 className={styles.title}>{currentPost.title}</h2>

          {currentPost.type === "quote" ? (
            <p className={styles.quoteBody}>{currentPost.body}</p>
          ) : (
            <p className={styles.text}>{currentPost.body}</p>
          )}

          {currentPost.tags.length > 0 && (
            <div className={styles.tags}>
              {currentPost.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className={styles.tag}
                  onClick={onClose}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {isMeditation && <MeditationTimer />}

          <div className={styles.footer}>
            <Link
              href={`/profile/${currentPost.authorId}`}
              className={styles.author}
              onClick={onClose}
            >
              {currentPost.authorName}
            </Link>
            <div className={styles.actions}>
              <button
                className={`${styles.actionBtn} ${isLiked ? styles.liked : ""}`}
                onClick={() => onLike(currentPost.id)}
                aria-label="לייק"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span>{formatNumber(currentPost.likeCount + (isLiked ? 1 : 0))}</span>
              </button>
              <button
                className={`${styles.actionBtn} ${isSaved ? styles.saved : ""}`}
                onClick={() => onSave(currentPost.id)}
                aria-label="שמירה"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
              <button className={styles.shareBtn} onClick={handleShare} title="שיתוף" aria-label="שיתוף">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
