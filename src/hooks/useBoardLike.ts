"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toggleBoardLike, getUserLikedBoardIds } from "@/lib/firestore";
import toast from "react-hot-toast";

export function useBoardLike() {
  const { user } = useAuth();
  const [likedBoardIds, setLikedBoardIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setLikedBoardIds(new Set());
      return;
    }
    getUserLikedBoardIds(user.uid).then(setLikedBoardIds);
  }, [user]);

  const isBoardLiked = useCallback(
    (boardId: string) => likedBoardIds.has(boardId),
    [likedBoardIds]
  );

  const handleBoardLike = useCallback(
    async (boardId: string) => {
      if (!user) {
        toast("יש להתחבר כדי לתת לייק");
        return;
      }

      const wasLiked = likedBoardIds.has(boardId);
      setLikedBoardIds((prev) => {
        const next = new Set(prev);
        wasLiked ? next.delete(boardId) : next.add(boardId);
        return next;
      });

      try {
        await toggleBoardLike(boardId, user.uid);
      } catch {
        setLikedBoardIds((prev) => {
          const next = new Set(prev);
          wasLiked ? next.add(boardId) : next.delete(boardId);
          return next;
        });
        toast.error("שגיאה");
      }
    },
    [user, likedBoardIds]
  );

  return { isBoardLiked, handleBoardLike };
}
