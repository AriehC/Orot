"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Post, PostType } from "@/lib/types";
import { subscribeToPosts, subscribeToFollowingPosts } from "@/lib/firestore";
import { rankPosts } from "@/lib/ranking";

interface UseFeedOptions {
  tag?: string;
  authorId?: string;
  search?: string;
  type?: PostType;
  followingUserIds?: string[];
}

export function useFeed(options?: UseFeedOptions) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Track ranked order by post ids — only re-rank when posts are added/removed
  const rankedOrderRef = useRef<string[]>([]);

  // Stable reference for followingUserIds to avoid re-subscribing on every render
  const followingIdsKey = options?.followingUserIds?.join(",") ?? "";

  useEffect(() => {
    setLoading(true);
    setError(null);

    const onPosts = (fetchedPosts: Post[]) => {
      setPosts(fetchedPosts);
      setLoading(false);
      setError(null);
    };

    const onErr = (firestoreError: { message: string }) => {
      console.error("useFeed: subscription error:", firestoreError);
      setError("שגיאה בטעינת התוכן");
      setLoading(false);
    };

    let unsubscribe: () => void;

    if (options?.followingUserIds) {
      unsubscribe = subscribeToFollowingPosts(
        options.followingUserIds,
        onPosts,
        { type: options?.type, limitCount: 50 },
        onErr
      );
    } else {
      unsubscribe = subscribeToPosts(
        onPosts,
        {
          tag: options?.tag,
          authorId: options?.authorId,
          type: options?.type,
          limitCount: 50,
        },
        onErr
      );
    }

    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.tag, options?.authorId, options?.type, followingIdsKey]);

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
