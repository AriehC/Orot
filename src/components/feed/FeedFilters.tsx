"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tag } from "@/lib/types";
import { getTrendingTags } from "@/lib/firestore";
import styles from "./FeedFilters.module.css";

export default function FeedFilters() {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    getTrendingTags(12).then(setTags).catch(() => {});
  }, []);

  if (tags.length === 0) return null;

  return (
    <div className={styles.bar}>
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
