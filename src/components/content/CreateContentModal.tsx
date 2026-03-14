"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createPost, addToBoard } from "@/lib/firestore";
import { uploadMedia } from "@/lib/storage";
import { PostType } from "@/lib/types";
import { CREATE_CARD_COLORS, TYPE_OPTIONS } from "@/lib/constants";
import { isInstagramURL, parseCaption, extractHashtags } from "@/lib/instagram";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import styles from "./CreateContentModal.module.css";

interface CreateContentModalProps {
  onClose: () => void;
}

export default function CreateContentModal({ onClose }: CreateContentModalProps) {
  const { user, profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<PostType>("note");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [color, setColor] = useState(CREATE_CARD_COLORS[0]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Instagram import state
  const [igURL, setIgURL] = useState("");
  const [igLoading, setIgLoading] = useState(false);
  const [sourceURL, setSourceURL] = useState<string | null>(null);

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

  async function handleInstagramImport() {
    if (!igURL.trim() || !isInstagramURL(igURL)) {
      toast.error("קישור אינסטגרם לא תקין");
      return;
    }
    setIgLoading(true);
    try {
      const res = await fetch(`/api/instagram-oembed?url=${encodeURIComponent(igURL.trim())}`);
      if (!res.ok) throw new Error("oEmbed failed");
      const data = await res.json();

      // Parse caption into title + body
      const { title: parsedTitle, body: parsedBody } = parseCaption(data.title || "");
      const hashtags = extractHashtags(data.title || "");

      setTitle(parsedTitle || data.author_name || "");
      setBody(parsedBody);
      if (hashtags.length > 0) setTags(hashtags);
      setType("note");
      setSourceURL(igURL.trim());

      // If there's a thumbnail, set it as preview (won't be uploaded, just for display)
      if (data.thumbnail_url) {
        setMediaPreview(data.thumbnail_url);
      }

      toast("תוכן יובא מאינסטגרם ✨");
    } catch {
      toast.error("לא ניתן לייבא מהקישור הזה");
    } finally {
      setIgLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  }

  function removeMedia() {
    setMediaFile(null);
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(null);
  }

  async function handleSubmit() {
    if (!user || !profile || !title.trim()) return;
    setSubmitting(true);

    try {
      let mediaURL: string | null = null;
      let mediaType: "image" | "video" | null = null;

      if (mediaFile) {
        mediaURL = await uploadMedia(user.uid, mediaFile);
        mediaType = mediaFile.type.startsWith("video/") ? "video" : "image";
      }

      const postId = await createPost({
        type,
        title: title.trim(),
        body: body.trim(),
        authorId: user.uid,
        authorName: profile.displayName,
        authorPhotoURL: profile.photoURL,
        tags,
        color,
        mediaURL,
        thumbnailURL: mediaURL,
        mediaType,
        sourceURL: sourceURL,
        sourceType: sourceURL ? "instagram" : null,
      });

      // Auto-add to main board
      if (profile.mainBoardId) {
        try {
          await addToBoard(profile.mainBoardId, postId, user.uid);
        } catch (err) {
          console.error("Auto-add to main board failed:", err);
        }
      }

      toast("הפתק נוצר בהצלחה ✨");
      onClose();
    } catch {
      toast.error("שגיאה ביצירת הפתק");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="יצירת תוכן חדש" onClose={onClose}>
      <div className={styles.importSection}>
        <label>ייבוא מאינסטגרם</label>
        <div className={styles.importRow}>
          <input
            className={styles.importInput}
            placeholder="הדביקו קישור לפוסט באינסטגרם..."
            value={igURL}
            onChange={(e) => setIgURL(e.target.value)}
            dir="ltr"
          />
          <button
            className={styles.importBtn}
            onClick={handleInstagramImport}
            disabled={igLoading || !igURL.trim()}
            type="button"
          >
            {igLoading ? "מייבא..." : "ייבוא"}
          </button>
        </div>
        {sourceURL && (
          <span className={styles.instagramBadge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            יובא מאינסטגרם
            <button type="button" onClick={() => { setSourceURL(null); }} className={styles.badgeRemove}>×</button>
          </span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="contentType">סוג תוכן</label>
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
        <label htmlFor="postTitle">כותרת</label>
        <input
          id="postTitle"
          placeholder="מה ההשראה?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="postBody">תוכן</label>
        <textarea
          id="postBody"
          placeholder="שתפו את המחשבה, הציטוט, או התובנה שלכם..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={5000}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="tagInput">תגיות</label>
        <div className={styles.tagsContainer} onClick={() => document.getElementById("tagInput")?.focus()}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tagChip}>
              #{tag}
              <button className={styles.tagRemove} onClick={() => setTags(tags.filter((t) => t !== tag))} type="button" aria-label={`הסר תגית ${tag}`}>
                ×
              </button>
            </span>
          ))}
          <input
            id="tagInput"
            className={styles.tagInput}
            placeholder={tags.length === 0 ? "הוסיפו תגיות (Enter להוספה)" : ""}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>תמונה {type !== "image" && type !== "video" ? "(אופציונלי)" : ""}</label>
        {mediaPreview ? (
          <div className={styles.uploadPreview}>
            <img src={mediaPreview} alt="תצוגה מקדימה" />
            <button className={styles.removeMedia} onClick={removeMedia} type="button" aria-label="הסר מדיה">×</button>
          </div>
        ) : (
          <div
            className={styles.uploadZone}
            role="button"
            tabIndex={0}
            aria-label={`העלאת ${type === "video" ? "וידאו" : "תמונה"}`}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
          >
            לחצו להעלאת {type === "video" ? "וידאו" : "תמונה"}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={type === "video" ? "video/*" : "image/*"}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      <div className={styles.formGroup}>
        <label>צבע</label>
        <div className={styles.colorPicker}>
          {CREATE_CARD_COLORS.map((c) => (
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
        {submitting ? "מפרסם..." : "✨ פרסום"}
      </button>
    </Modal>
  );
}
