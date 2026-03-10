"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tag } from "@/lib/types";
import { getTrendingTags } from "@/lib/firestore";
import styles from "./FeedFilters.module.css";

interface FeedFiltersProps {
  onDiscover?: () => void;
}

export default function FeedFilters({ onDiscover }: FeedFiltersProps) {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    getTrendingTags(12).then(setTags).catch(() => {});
  }, []);

  if (tags.length === 0 && !onDiscover) return null;

  return (
    <div className={styles.bar}>
      {onDiscover && (
        <button className={styles.discoverChip} onClick={onDiscover}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
          גלה חדש
        </button>
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
