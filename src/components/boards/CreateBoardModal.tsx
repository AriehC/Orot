"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createBoard } from "@/lib/firestore";
import type { Board } from "@/lib/types";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import styles from "@/components/content/CreateContentModal.module.css";

const BOARD_COLORS = ["#E8985E", "#6B8FA3", "#9B7ED8", "#5DA87E", "#D47B7B", "#C4A355"];

interface CreateBoardModalProps {
  onClose: () => void;
  onCreated: (board: Board) => void;
}

export default function CreateBoardModal({ onClose, onCreated }: CreateBoardModalProps) {
  const { user, profile } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [color, setColor] = useState(BOARD_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!user || !name.trim()) return;
    setSubmitting(true);

    try {
      const boardId = await createBoard({
        name: name.trim(),
        description: description.trim(),
        color,
        ownerId: user.uid,
        ownerName: profile?.displayName || "משתמש",
        ownerPhotoURL: profile?.photoURL || null,
        isPublic,
      });

      toast("הלוח נוצר בהצלחה");
      onCreated({
        id: boardId,
        name: name.trim(),
        description: description.trim(),
        color,
        ownerId: user.uid,
        ownerName: profile?.displayName || "משתמש",
        ownerPhotoURL: profile?.photoURL || null,
        isPublic,
        itemCount: 0,
        likeCount: 0,
        followerCount: 0,
        coverImageURL: null,
      } as Board);
    } catch {
      toast.error("שגיאה ביצירת הלוח");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="לוח חדש" onClose={onClose}>
      <div className={styles.formGroup}>
        <label>שם הלוח</label>
        <input
          placeholder="לדוגמה: מדיטציות בוקר"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
        />
      </div>

      <div className={styles.formGroup}>
        <label>תיאור</label>
        <textarea
          placeholder="על מה הלוח הזה?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
        />
      </div>

      <div className={styles.formGroup}>
        <label>נראות</label>
        <div className={styles.typeSelector}>
          <button
            className={isPublic ? styles.typeBtnActive : styles.typeBtn}
            onClick={() => setIsPublic(true)}
            type="button"
          >
            🌐 ציבורי
          </button>
          <button
            className={!isPublic ? styles.typeBtnActive : styles.typeBtn}
            onClick={() => setIsPublic(false)}
            type="button"
          >
            🔒 פרטי
          </button>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>צבע הלוח</label>
        <div className={styles.colorPicker}>
          {BOARD_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={color === c ? styles.colorDotActive : styles.colorDot}
              style={{ backgroundColor: c }}
              aria-label={`בחר צבע ${c}`}
              aria-pressed={color === c}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>

      <button
        className={styles.submitBtn}
        onClick={handleSubmit}
        disabled={submitting || !name.trim()}
      >
        {submitting ? "יוצר..." : "✨ יצירת לוח"}
      </button>
    </Modal>
  );
}
