"use client";

import { useState, useEffect } from "react";
import { Tag } from "@/lib/types";
import { getTrendingTags } from "@/lib/firestore";
import styles from "./FeedFilters.module.css";

interface FeedFiltersProps {
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
}

export default function FeedFilters({ activeTag, onTagChange }: FeedFiltersProps) {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    getTrendingTags(12).then(setTags).catch(() => {});
  }, []);

  return (
    <div className={styles.bar}>
      <button
        className={!activeTag ? styles.chipActive : styles.chip}
        onClick={() => onTagChange(null)}
      >
        ✦ הכל
      </button>
      {tags.map((tag) => (
        <button
          key={tag.name}
          className={activeTag === tag.name ? styles.chipActive : styles.chip}
          onClick={() => onTagChange(activeTag === tag.name ? null : tag.name)}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
}
