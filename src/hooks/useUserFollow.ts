"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toggleUserFollow, isFollowingUser } from "@/lib/firestore";
import toast from "react-hot-toast";

export function useUserFollow(targetUserId: string) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.uid === targetUserId) {
      setLoading(false);
      return;
    }
    isFollowingUser(targetUserId, user.uid).then((v) => {
      setFollowing(v);
      setLoading(false);
    });
  }, [user, targetUserId]);

  const handleToggleFollow = useCallback(async () => {
    if (!user) {
      toast("יש להתחבר כדי לעקוב");
      return;
    }

    const wasFollowing = following;
    setFollowing(!wasFollowing);

    try {
      await toggleUserFollow(targetUserId, user.uid);
      toast(wasFollowing ? "הפסקת לעקוב" : "עוקב!");
    } catch {
      setFollowing(wasFollowing);
      toast.error("שגיאה");
    }
  }, [user, targetUserId, following]);

  return { following, loading, handleToggleFollow };
}
