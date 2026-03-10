"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toggleLike, getUserLikedPostIds } from "@/lib/firestore";

export function useLike() {
  const { user } = useAuth();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setLikedIds(new Set());
      return;
    }
    getUserLikedPostIds(user.uid).then(setLikedIds).catch(console.error);
  }, [user]);

  const handleLike = useCallback(
    async (postId: string) => {
      if (!user) return;

      // Optimistic update
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (next.has(postId)) next.delete(postId);
        else next.add(postId);
        return next;
      });

      try {
        await toggleLike(postId, user.uid);
      } catch {
        // Revert on error
        setLikedIds((prev) => {
          const next = new Set(prev);
          if (next.has(postId)) next.delete(postId);
          else next.add(postId);
          return next;
        });
      }
    },
    [user]
  );

  const isLiked = useCallback(
    (postId: string) => likedIds.has(postId),
    [likedIds]
  );

  return { isLiked, handleLike };
}
