"use client";

import { useCallback, useEffect, useState } from "react";
import { getConcept, getConceptBacklinks, getConceptMentionPosts } from "@/lib/firestore";
import { Post, Tag } from "@/lib/types";

/** Shared concept page data: the concept doc, concepts linking here, and posts mentioning it via [[ ]]. */
export function useConceptPage(name: string) {
  const [concept, setConcept] = useState<Tag | null>(null);
  const [backlinks, setBacklinks] = useState<Tag[]>([]);
  const [mentions, setMentions] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const c = await getConcept(name);
      const canonical = c?.name ?? name;
      const [bl, mp] = await Promise.all([
        getConceptBacklinks(canonical).catch(() => []),
        getConceptMentionPosts(canonical).catch(() => []),
      ]);
      setConcept(c);
      setBacklinks(bl);
      setMentions(mp);
    } catch {
      setConcept(null);
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    load();
  }, [load]);

  return { concept, backlinks, mentions, loading, reload: load };
}
