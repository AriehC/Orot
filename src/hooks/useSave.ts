"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toggleSave, getUserSavedPostIds } from "@/lib/firestore";
import toast from "react-hot-toast";

export function useSave() {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const savedIdsRef = useRef(savedIds);
  savedIdsRef.current = savedIds;

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }
    getUserSavedPostIds(user.uid).then(setSavedIds).catch(console.error);
  }, [user]);

  const handleSave = useCallback(
    async (postId: string) => {
      if (!user) return;

      const wasSaved = savedIdsRef.current.has(postId);

      // Optimistic update
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (next.has(postId)) next.delete(postId);
        else next.add(postId);
        return next;
      });

      try {
        await toggleSave(postId, user.uid);
        toast(wasSaved ? "הוסר מהשמורים" : "נשמר בהצלחה ✨");
      } catch {
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (next.has(postId)) next.delete(postId);
          else next.add(postId);
          return next;
        });
      }
    },
    [user]
  );

  const isSaved = useCallback(
    (postId: string) => savedIds.has(postId),
    [savedIds]
  );

  return { isSaved, handleSave };
}
