"use client";

import { useState } from "react";
import { saveConcept } from "@/lib/firestore";
import { parseConceptList } from "@/lib/wikilinks";
import { invalidateConceptCache } from "@/hooks/useConceptPreview";
import { useAuth } from "@/contexts/AuthContext";
import { Tag } from "@/lib/types";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import formStyles from "@/components/content/CreateContentModal.module.css";
import styles from "./Concepts.module.css";

interface ConceptEditModalProps {
  name: string;
  concept: Tag | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ConceptEditModal({ name, concept, onClose, onSaved }: ConceptEditModalProps) {
  const { user, profile } = useAuth();
  const [description, setDescription] = useState(concept?.description ?? "");
  const [aliases, setAliases] = useState((concept?.aliases ?? []).join(", "));
  const [related, setRelated] = useState((concept?.related ?? []).join(", "));
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!user) {
      toast("יש להתחבר כדי לערוך");
      return;
    }
    setSubmitting(true);
    try {
      await saveConcept(
        concept?.name ?? name,
        {
          description: description.trim().slice(0, 3000),
          aliases: parseConceptList(aliases, 10),
          related: parseConceptList(related, 15),
        },
        { uid: user.uid, displayName: profile?.displayName ?? user.displayName ?? "משתמש" }
      );
      invalidateConceptCache(name);
      toast.success("העמוד עודכן");
      onSaved();
      onClose();
    } catch {
      toast.error("שגיאה בשמירה");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={`עריכת המושג: ${concept?.name ?? name}`} onClose={onClose}>
      <p className={styles.editHint}>
        העמוד משותף לכולם וכל מי שמחובר יכול לערוך אותו. כתבו מכמה נקודות מבט, לא רק מאחת.
      </p>

      <div className={formStyles.formGroup}>
        <label htmlFor="concept-description">תיאור</label>
        <textarea
          id="concept-description"
          placeholder="מה המושג הזה? איך מסורות שונות רואות אותו? אפשר לקשר למושגים אחרים עם [[שם המושג]]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={3000}
          rows={8}
        />
      </div>

      <div className={formStyles.formGroup}>
        <label htmlFor="concept-aliases">שמות נרדפים</label>
        <input
          id="concept-aliases"
          placeholder="למשל: אנאהטה, Heart Chakra, הצ׳אקרה הרביעית"
          value={aliases}
          onChange={(e) => setAliases(e.target.value)}
        />
        <span className={styles.fieldHint}>מופרדים בפסיקים. קישור לשם נרדף יוביל לעמוד הזה.</span>
      </div>

      <div className={formStyles.formGroup}>
        <label htmlFor="concept-related">מושגים קשורים</label>
        <input
          id="concept-related"
          placeholder="למשל: אהבה, ספירת תפארת, נשימה"
          value={related}
          onChange={(e) => setRelated(e.target.value)}
        />
        <span className={styles.fieldHint}>מופרדים בפסיקים. יופיעו במפת הקשרים.</span>
      </div>

      <button className={formStyles.submitBtn} onClick={handleSubmit} disabled={submitting}>
        {submitting ? "שומר…" : "שמירה"}
      </button>
    </Modal>
  );
}
