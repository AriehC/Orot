"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toggleBoardFollow, getUserFollowedBoardIds } from "@/lib/firestore";
import toast from "react-hot-toast";

export function useBoardFollow() {
  const { user } = useAuth();
  const [followedBoardIds, setFollowedBoardIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setFollowedBoardIds(new Set());
      return;
    }
    getUserFollowedBoardIds(user.uid).then(setFollowedBoardIds);
  }, [user]);

  const isBoardFollowed = useCallback(
    (boardId: string) => followedBoardIds.has(boardId),
    [followedBoardIds]
  );

  const handleBoardFollow = useCallback(
    async (boardId: string) => {
      if (!user) {
        toast("יש להתחבר כדי לעקוב");
        return;
      }

      const wasFollowed = followedBoardIds.has(boardId);
      setFollowedBoardIds((prev) => {
        const next = new Set(prev);
        wasFollowed ? next.delete(boardId) : next.add(boardId);
        return next;
      });

      try {
        await toggleBoardFollow(boardId, user.uid);
        toast(wasFollowed ? "הפסקת לעקוב" : "עוקב אחרי הלוח");
      } catch {
        setFollowedBoardIds((prev) => {
          const next = new Set(prev);
          wasFollowed ? next.add(boardId) : next.delete(boardId);
          return next;
        });
        toast.error("שגיאה");
      }
    },
    [user, followedBoardIds]
  );

  return { isBoardFollowed, handleBoardFollow };
}
