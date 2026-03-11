"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Post } from "@/lib/types";
import { subscribeToPosts } from "@/lib/firestore";
import { rankPosts } from "@/lib/ranking";

interface UseFeedOptions {
  tag?: string;
  authorId?: string;
  search?: string;
}

export function useFeed(options?: UseFeedOptions) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Track ranked order by post ids — only re-rank when posts are added/removed
  const rankedOrderRef = useRef<string[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToPosts(
      (fetchedPosts) => {
        setPosts(fetchedPosts);
        setLoading(false);
        setError(null);
      },
      {
        tag: options?.tag,
        authorId: options?.authorId,
        limitCount: 50,
      },
      (firestoreError) => {
        console.error("useFeed: subscription error:", firestoreError);
        setError("שגיאה בטעינת התוכן");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [options?.tag, options?.authorId]);

  // Apply client-side search filtering
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (!options?.search) return true;
      const q = options.search.toLowerCase();
      return (
        post.title.toLowerCase().includes(q) ||
        post.body.toLowerCase().includes(q) ||
        post.authorName.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [posts, options?.search]);

  // Only re-rank when the set of post ids changes (add/remove), not on field updates (likes)
  const sortedPosts = useMemo(() => {
    const currentIds = new Set(filteredPosts.map((p) => p.id));
    const prevIds = new Set(rankedOrderRef.current);

    const sameSet =
      currentIds.size === prevIds.size &&
      [...currentIds].every((id) => prevIds.has(id));

    if (sameSet && rankedOrderRef.current.length > 0) {
      // Keep existing order, just update post data
      const postMap = new Map(filteredPosts.map((p) => [p.id, p]));
      return rankedOrderRef.current
        .map((id) => postMap.get(id))
        .filter((p): p is Post => p !== undefined);
    }

    // New set of posts — compute fresh ranking
    const ranked = rankPosts(filteredPosts);
    rankedOrderRef.current = ranked.map((p) => p.id);
    return ranked;
  }, [filteredPosts]);

  return { posts: sortedPosts, loading, error };
}
