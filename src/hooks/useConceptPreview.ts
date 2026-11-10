"use client";

import { useEffect, useState } from "react";
import { getConcept } from "@/lib/firestore";
import { normalizeConcept } from "@/lib/wikilinks";
import { Tag } from "@/lib/types";

// Shared across all links on the page so each concept is fetched once
const cache = new Map<string, Promise<Tag | null>>();

export function loadConceptCached(name: string): Promise<Tag | null> {
  const key = normalizeConcept(name);
  let pending = cache.get(key);
  if (!pending) {
    pending = getConcept(name).catch(() => {
      cache.delete(key);
      return null;
    });
    cache.set(key, pending);
  }
  return pending;
}

export function invalidateConceptCache(name: string) {
  cache.delete(normalizeConcept(name));
}

/** Lazily loads a concept for a hover preview; only fetches once `active` turns true. */
export function useConceptPreview(name: string, active: boolean) {
  const [concept, setConcept] = useState<Tag | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!active || loaded) return;
    let cancelled = false;
    loadConceptCached(name).then((c) => {
      if (cancelled) return;
      setConcept(c);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [name, active, loaded]);

  return { concept, loaded };
}
