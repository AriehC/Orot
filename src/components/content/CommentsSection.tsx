"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useComments } from "@/hooks/useComments";
import { useAuth } from "@/contexts/AuthContext";
import { formatRelativeTime } from "@/lib/utils";
import styles from "./CommentsSection.module.css";

interface CommentsSectionProps {
  postId: string;
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const { user } = useAuth();
  const { comments, loading, addComment, deleteComment } = useComments(postId);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(comments.length);

  // Auto-scroll to bottom when new comments arrive
  useEffect(() => {
    if (comments.length > prevCountRef.current && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
    prevCountRef.current = comments.length;
  }, [comments.length]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addComment(body);
      setBody("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.section}>
      <h4 className={styles.header}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {"\u200F"}תגובות ({comments.length})
      </h4>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
        </div>
      ) : comments.length === 0 ? (
        <p className={styles.empty}>אין תגובות עדיין. היו הראשונים להגיב!</p>
      ) : (
        <div className={styles.list} ref={listRef}>
          {comments.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <Link
                  href={`/profile/${comment.authorId}`}
                  className={styles.authorName}
                >
                  {comment.authorName}
                </Link>
                <span className={styles.commentTime}>
                  {formatRelativeTime(comment.createdAt)}
                </span>
                {user?.uid === comment.authorId && !comment.id.startsWith("temp-") && (
                  <button
                    className={styles.deleteBtn}
                    onClick={() => deleteComment(comment.id)}
                    aria-label="מחיקת תגובה"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
              <p className={styles.commentBody}>{comment.body}</p>
            </div>
          ))}
        </div>
      )}

      {user ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          <textarea
            className={styles.input}
            placeholder="כתבו תגובה..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            maxLength={1000}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!body.trim() || submitting}
          >
            {submitting ? "שולח..." : "הגיבו"}
          </button>
        </form>
      ) : (
        <p className={styles.authPrompt}>יש להתחבר כדי להגיב</p>
      )}
    </div>
  );
}
