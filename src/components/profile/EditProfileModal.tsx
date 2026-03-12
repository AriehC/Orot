"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/lib/firestore";
import { uploadMedia } from "@/lib/storage";
import { UserProfile, SocialLink, SocialPlatform, Board } from "@/lib/types";
import { PLATFORM_CONFIG, buildSocialURL, extractHandle } from "./ProfileSocialLinks";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import styles from "./EditProfileModal.module.css";

const ALL_PLATFORMS = Object.entries(PLATFORM_CONFIG).map(([key, val]) => ({
  value: key as SocialPlatform,
  label: val.label,
  icon: val.icon,
  placeholder: val.placeholder,
}));

interface EditProfileModalProps {
  profile: UserProfile;
  boards: Board[];
  onClose: () => void;
  onSaved: (updated: UserProfile) => void;
}

export default function EditProfileModal({
  profile,
  boards,
  onClose,
  onSaved,
}: EditProfileModalProps) {
  const { user } = useAuth();

  // Basic info
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [tagline, setTagline] = useState(profile.tagline || "");
  const [bio, setBio] = useState(profile.bio || "");

  // Photos
  const [photoURL, setPhotoURL] = useState(profile.photoURL);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [coverURL, setCoverURL] = useState(profile.coverImageURL);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // Social links — store as map of platform → handle for editing
  const [socialHandles, setSocialHandles] = useState<Partial<Record<SocialPlatform, string>>>(() => {
    const map: Partial<Record<SocialPlatform, string>> = {};
    for (const link of profile.socialLinks || []) {
      map[link.platform] = extractHandle(link.platform, link.url);
    }
    return map;
  });

  // Pinned boards
  const [pinnedBoardIds, setPinnedBoardIds] = useState<string[]>(
    profile.pinnedBoardIds || []
  );

  const [saving, setSaving] = useState(false);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function togglePlatform(platform: SocialPlatform) {
    setSocialHandles((prev) => {
      if (platform in prev) {
        const next = { ...prev };
        delete next[platform];
        return next;
      }
      return { ...prev, [platform]: "" };
    });
  }

  function updateHandle(platform: SocialPlatform, value: string) {
    setSocialHandles((prev) => ({ ...prev, [platform]: value }));
  }

  function togglePinnedBoard(boardId: string) {
    if (pinnedBoardIds.includes(boardId)) {
      setPinnedBoardIds(pinnedBoardIds.filter((id) => id !== boardId));
    } else if (pinnedBoardIds.length < 3) {
      setPinnedBoardIds([...pinnedBoardIds, boardId]);
    }
  }

  async function handleSave() {
    if (!user || !displayName.trim()) return;
    setSaving(true);
    try {
      let newPhotoURL = photoURL;
      let newCoverURL = coverURL;

      if (photoFile) {
        newPhotoURL = await uploadMedia(user.uid, photoFile);
      }
      if (coverFile) {
        newCoverURL = await uploadMedia(user.uid, coverFile);
      }

      // Build social links from handles
      const validLinks: SocialLink[] = Object.entries(socialHandles)
        .filter(([, handle]) => handle && handle.trim())
        .map(([platform, handle]) => ({
          platform: platform as SocialPlatform,
          url: buildSocialURL(platform as SocialPlatform, handle!),
          handle: handle!.replace(/^@/, "").trim(),
        }));

      await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        tagline: tagline.trim(),
        bio: bio.trim(),
        photoURL: newPhotoURL,
        coverImageURL: newCoverURL,
        socialLinks: validLinks,
        pinnedBoardIds,
      });

      toast("הפרופיל עודכן");
      onSaved({
        ...profile,
        displayName: displayName.trim(),
        tagline: tagline.trim(),
        bio: bio.trim(),
        photoURL: newPhotoURL,
        coverImageURL: newCoverURL,
        socialLinks: validLinks,
        pinnedBoardIds,
      });
    } catch {
      toast.error("שגיאה בעדכון הפרופיל");
    } finally {
      setSaving(false);
    }
  }

  const displayPhoto = photoPreview || photoURL;
  const displayCover = coverPreview || coverURL;
  const initials = displayName?.charAt(0) || "א";

  return (
    <Modal title="עריכת פרופיל" onClose={onClose}>
      <div className={styles.form}>
        {/* Cover Image */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>תמונת קאבר</label>
          <label className={styles.coverUpload} aria-label="העלאת תמונת קאבר">
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              style={{ display: "none" }}
              aria-label="בחירת תמונת קאבר"
            />
            <div className={styles.coverPreview}>
              {displayCover ? (
                <img src={displayCover} alt="תמונת קאבר" />
              ) : (
                <div className={styles.coverPlaceholder}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>הוסיפו תמונת קאבר</span>
                </div>
              )}
              <div className={styles.coverOverlay} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </div>
          </label>
        </div>

        {/* Avatar */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>תמונת פרופיל</label>
          <div className={styles.photoSection}>
            <label className={styles.photoUpload} aria-label="העלאת תמונת פרופיל">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
                aria-label="בחירת תמונת פרופיל"
              />
              <div className={styles.photoPreview}>
                {displayPhoto ? (
                  <img src={displayPhoto} alt="תמונת פרופיל" />
                ) : (
                  <span>{initials}</span>
                )}
                <div className={styles.photoOverlay} aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
              </div>
            </label>
            <span className={styles.photoHint}>לחצו לשינוי תמונה</span>
          </div>
        </div>

        {/* Basic Info */}
        <div className={styles.section}>
          <div className={styles.field}>
            <label htmlFor="edit-display-name">שם תצוגה</label>
            <input
              id="edit-display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="השם שלך"
              autoComplete="name"
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="edit-tagline">תיאור קצר</label>
            <input
              id="edit-tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value.slice(0, 80))}
              placeholder="משפט קצר שמתאר אתכם..."
              maxLength={80}
            />
            <span className={styles.charCount}>{tagline.length}/80</span>
          </div>
          <div className={styles.field}>
            <label htmlFor="edit-bio">ביו</label>
            <textarea
              id="edit-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="ספרו משהו על עצמכם..."
            />
          </div>
        </div>

        {/* Social Links */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>קישורים חברתיים</label>
          <div className={styles.platformGrid}>
            {ALL_PLATFORMS.map((p) => {
              const isActive = p.value in socialHandles;
              return (
                <button
                  key={p.value}
                  type="button"
                  className={isActive ? styles.platformChipActive : styles.platformChip}
                  onClick={() => togglePlatform(p.value)}
                  aria-pressed={isActive}
                >
                  <span className={styles.platformIcon}>{p.icon}</span>
                  {p.label}
                </button>
              );
            })}
          </div>
          {Object.entries(socialHandles).map(([platform, handle]) => {
            const config = ALL_PLATFORMS.find((p) => p.value === platform);
            if (!config) return null;
            const isFullURL = !PLATFORM_CONFIG[platform as SocialPlatform].urlTemplate;
            return (
              <div key={platform} className={styles.handleRow}>
                <span className={styles.handleIcon}>{config.icon}</span>
                <div className={styles.handleInputWrap}>
                  {!isFullURL && <span className={styles.handleAt}>@</span>}
                  <input
                    type={isFullURL ? "url" : "text"}
                    value={handle || ""}
                    onChange={(e) => updateHandle(platform as SocialPlatform, e.target.value)}
                    placeholder={config.placeholder}
                    className={styles.handleInput}
                    dir="ltr"
                  />
                </div>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => togglePlatform(platform as SocialPlatform)}
                  aria-label="הסר"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        {/* Pinned Boards */}
        {boards.length > 0 && (
          <div className={styles.section}>
            <label className={styles.sectionLabel}>
              לוחות מומלצים (עד 3)
            </label>
            <div className={styles.boardChecklist}>
              {boards.map((board) => (
                <label key={board.id} className={styles.boardCheckItem}>
                  <input
                    type="checkbox"
                    checked={pinnedBoardIds.includes(board.id)}
                    onChange={() => togglePinnedBoard(board.id)}
                    disabled={
                      !pinnedBoardIds.includes(board.id) &&
                      pinnedBoardIds.length >= 3
                    }
                  />
                  <span
                    className={styles.boardDot}
                    style={{ background: board.color }}
                  />
                  <span>{board.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Save */}
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saving || !displayName.trim()}
        >
          {saving ? "שומר..." : "שמירה"}
        </button>
      </div>
    </Modal>
  );
}
