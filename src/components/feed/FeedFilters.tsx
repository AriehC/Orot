"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tag, PostType } from "@/lib/types";
import { getTrendingTags } from "@/lib/firestore";
import { TYPE_OPTIONS } from "@/lib/constants";
import styles from "./FeedFilters.module.css";

export type FeedMode = "all" | "following";

interface FeedFiltersProps {
  onDiscover?: () => void;
  selectedType?: PostType | null;
  onTypeChange?: (type: PostType | null) => void;
  feedMode?: FeedMode;
  onFeedModeChange?: (mode: FeedMode) => void;
  showFeedMode?: boolean;
}

export default function FeedFilters({ onDiscover, selectedType, onTypeChange, feedMode, onFeedModeChange, showFeedMode }: FeedFiltersProps) {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    getTrendingTags(12).then(setTags).catch(() => {});
  }, []);

  if (tags.length === 0 && !onDiscover && !onTypeChange && !showFeedMode) return null;

  return (
    <div className={styles.bar}>
      {showFeedMode && onFeedModeChange && (
        <>
          <button
            className={`${styles.modeChip} ${feedMode === "all" ? styles.modeChipActive : ""}`}
            onClick={() => onFeedModeChange("all")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
            הכל
          </button>
          <button
            className={`${styles.modeChip} ${feedMode === "following" ? styles.modeChipActive : ""}`}
            onClick={() => onFeedModeChange("following")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            עוקבים
          </button>
          <div className={styles.separator} />
        </>
      )}
      {onDiscover && (
        <button className={styles.discoverChip} onClick={onDiscover}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
          פתק אקראי
        </button>
      )}
      {onTypeChange && (
        <>
          <button
            className={`${styles.typeChip} ${selectedType === null ? styles.typeChipActive : ""}`}
            onClick={() => onTypeChange(null)}
          >
            הכל
          </button>
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className={`${styles.typeChip} ${selectedType === opt.key ? styles.typeChipActive : ""}`}
              onClick={() => onTypeChange(opt.key)}
            >
              {opt.label}
            </button>
          ))}
          <div className={styles.separator} />
        </>
      )}
      {tags.map((tag) => (
        <Link
          key={tag.name}
          href={`/tags/${encodeURIComponent(tag.name)}`}
          className={styles.chip}
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  );
}
