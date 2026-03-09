"use client";

import { useState, useEffect, useCallback } from "react";
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

  useEffect(() => {
    setLoading(true);

    const unsubscribe = subscribeToPosts(
      (fetchedPosts) => {
        setPosts(fetchedPosts);
        setLoading(false);
      },
      {
        tag: options?.tag,
        authorId: options?.authorId,
        limitCount: 50,
      }
    );

    return unsubscribe;
  }, [options?.tag, options?.authorId]);

  // Apply client-side search filtering and ranking
  const filteredPosts = posts.filter((post) => {
    if (!options?.search) return true;
    const q = options.search.toLowerCase();
    return (
      post.title.toLowerCase().includes(q) ||
      post.body.toLowerCase().includes(q) ||
      post.authorName.toLowerCase().includes(q) ||
      post.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const rankedPosts = rankPosts(filteredPosts);

  return { posts: rankedPosts, loading };
}
