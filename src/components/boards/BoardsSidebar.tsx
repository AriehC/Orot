"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getUserBoards } from "@/lib/firestore";
import { Board } from "@/lib/types";
import CreateBoardModal from "./CreateBoardModal";
import styles from "./BoardsSidebar.module.css";

interface BoardsSidebarProps {
  onClose: () => void;
}

export default function BoardsSidebar({ onClose }: BoardsSidebarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserBoards(user.uid).then(setBoards);
  }, [user]);

  function handleBoardClick(boardId: string) {
    router.push(`/boards/${boardId}`);
    onClose();
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h2>הלוחות שלי</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className={styles.body}>
          {boards.map((board) => (
            <div
              key={board.id}
              className={styles.boardCard}
              style={{ backgroundColor: board.color + "15", borderColor: board.color + "30" }}
              onClick={() => handleBoardClick(board.id)}
            >
              <h3 style={{ color: board.color }}>{board.name}</h3>
              <p>{board.description}</p>
              <div className={styles.boardMeta}>
                <span>{board.isPublic ? "🌐 ציבורי" : "🔒 פרטי"}</span>
                <span>• {board.itemCount} פריטים</span>
              </div>
            </div>
          ))}
          <button className={styles.newBoardBtn} onClick={() => setShowCreate(true)}>
            + לוח חדש
          </button>
        </div>
      </div>
      {showCreate && (
        <CreateBoardModal
          onClose={() => setShowCreate(false)}
          onCreated={(board) => {
            setBoards((prev) => [board, ...prev]);
            setShowCreate(false);
          }}
        />
      )}
    </>
  );
}
