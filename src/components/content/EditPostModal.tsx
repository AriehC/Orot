"use client";

import { useState, KeyboardEvent } from "react";
import { updatePost } from "@/lib/firestore";
import { Post, PostType } from "@/lib/types";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import styles from "./CreateContentModal.module.css";

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onSaved: (data: Partial<Post>) => void;
}

const COLORS = ["#FFF8F0", "#F0F4F8", "#F5F0FF", "#F0FFF5", "#FFF5F5", "#FFFBF0"];

const TYPE_OPTIONS: { key: PostType; label: string }[] = [
  { key: "note", label: "פתק" },
  { key: "quote", label: "ציטוט" },
  { key: "image", label: "תמונה" },
  { key: "video", label: "וידאו" },
];

export default function EditPostModal({ post, onClose, onSaved }: EditPostModalProps) {
  const [type, setType] = useState<PostType>(post.type);
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const [tags, setTags] = useState<string[]>(post.tags);
  const [tagInput, setTagInput] = useState("");
  const [color, setColor] = useState(post.color || COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(",", "");
      if (newTag && !tags.includes(newTag) && tags.length < 10) {
        setTags([...tags, newTag.slice(0, 30)]);
      }
      setTagInput("");
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  }

  async function handleSubmit() {
    if (!title.trim()) return;
    setSubmitting(true);

    try {
      const data = {
        type,
        title: title.trim(),
        body: body.trim(),
        tags,
        color,
      };
      await updatePost(post.id, data);
      toast("הפוסט עודכן");
      onSaved(data);
    } catch {
      toast.error("שגיאה בעדכון הפוסט");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="עריכת פוסט" onClose={onClose}>
      <div className={styles.formGroup}>
        <label>סוג תוכן</label>
        <div className={styles.typeSelector}>
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t.key}
              className={type === t.key ? styles.typeBtnActive : styles.typeBtn}
              onClick={() => setType(t.key)}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>כותרת</label>
        <input
          placeholder="מה ההשראה?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
        />
      </div>

      <div className={styles.formGroup}>
        <label>תוכן</label>
        <textarea
          placeholder="שתפו את המחשבה, הציטוט, או התובנה שלכם..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={5000}
        />
      </div>

      <div className={styles.formGroup}>
        <label>תגיות</label>
        <div className={styles.tagsContainer} onClick={() => document.getElementById("editTagInput")?.focus()}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tagChip}>
              #{tag}
              <button className={styles.tagRemove} onClick={() => setTags(tags.filter((t) => t !== tag))} type="button" aria-label={`הסר תגית ${tag}`}>
                ×
              </button>
            </span>
          ))}
          <input
            id="editTagInput"
            className={styles.tagInput}
            placeholder={tags.length === 0 ? "הוסיפו תגיות (Enter להוספה)" : ""}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>צבע</label>
        <div className={styles.colorPicker}>
          {COLORS.map((c) => (
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
        disabled={submitting || !title.trim()}
      >
        {submitting ? "שומר..." : "שמירה"}
      </button>
    </Modal>
  );
}
