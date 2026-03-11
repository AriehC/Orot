"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserBoards, addToBoard, getBoardItemPostIds } from "@/lib/firestore";
import { Board } from "@/lib/types";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import styles from "./BoardsSidebar.module.css";

interface AddToBoardModalProps {
  postId: string;
  onClose: () => void;
}

export default function AddToBoardModal({ postId, onClose }: AddToBoardModalProps) {
  const { user } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardsWithPost, setBoardsWithPost] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    getUserBoards(user.uid).then(async (userBoards) => {
      setBoards(userBoards);
      const inBoards = new Set<string>();
      for (const board of userBoards) {
        const postIds = await getBoardItemPostIds(board.id);
        if (postIds.has(postId)) inBoards.add(board.id);
      }
      setBoardsWithPost(inBoards);
    });
  }, [user, postId]);

  async function handleAdd(boardId: string) {
    if (!user || boardsWithPost.has(boardId)) return;
    try {
      await addToBoard(boardId, postId, user.uid);
      setBoardsWithPost((prev) => new Set([...prev, boardId]));
      toast("נוסף ללוח ✨");
    } catch {
      toast.error("שגיאה בהוספה ללוח");
    }
  }

  return (
    <Modal title="הוספה ללוח" onClose={onClose}>
      {boards.length === 0 ? (
        <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "20px" }}>
          עדיין אין לך לוחות. צרו לוח חדש מהתפריט.
        </p>
      ) : (
        boards.map((board) => (
          <div
            key={board.id}
            className={styles.boardCard}
            style={{
              backgroundColor: board.color + "15",
              borderColor: boardsWithPost.has(board.id) ? board.color : "var(--border)",
              opacity: boardsWithPost.has(board.id) ? 0.7 : 1,
            }}
            role="button"
            tabIndex={0}
            aria-label={boardsWithPost.has(board.id) ? `${board.name} - כבר נוסף` : `הוסף ללוח ${board.name}`}
            aria-disabled={boardsWithPost.has(board.id)}
            onClick={() => handleAdd(board.id)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleAdd(board.id); } }}
          >
            <h3 style={{ color: board.color }}>
              {boardsWithPost.has(board.id) ? "✓ " : ""}{board.name}
            </h3>
            <p>{board.description}</p>
          </div>
        ))
      )}
    </Modal>
  );
}
