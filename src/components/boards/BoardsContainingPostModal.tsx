"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPublicBoardsContainingPost } from "@/lib/firestore";
import { Board } from "@/lib/types";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import styles from "./BoardCard.module.css";

interface BoardsContainingPostModalProps {
  postId: string;
  onClose: () => void;
}

export default function BoardsContainingPostModal({ postId, onClose }: BoardsContainingPostModalProps) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicBoardsContainingPost(postId).then((b) => {
      setBoards(b);
      setLoading(false);
    });
  }, [postId]);

  return (
    <Modal title="נוסף ללוחות" onClose={onClose}>
      {loading ? (
        <Spinner />
      ) : boards.length === 0 ? (
        <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: 20 }}>
          אין לוחות ציבוריים שמכילים פוסט זה
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {boards.map((board) => (
            <Link
              key={board.id}
              href={`/boards/${board.id}`}
              onClick={onClose}
              className={styles.cardLink}
            >
              <div
                style={{
                  padding: 14,
                  borderRadius: "var(--radius-sm)",
                  border: "1.5px solid var(--border)",
                  transition: "var(--transition)",
                  backgroundColor: board.color + "08",
                }}
              >
                <h4 style={{ fontFamily: "var(--font-heading)", fontSize: 14, color: board.color, marginBottom: 4 }}>
                  {board.name}
                </h4>
                {board.description && (
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>{board.description}</p>
                )}
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {board.ownerName} • {board.itemCount} פריטים • {board.followerCount} עוקבים
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Modal>
  );
}
