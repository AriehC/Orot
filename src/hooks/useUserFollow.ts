"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toggleUserFollow, isFollowingUser } from "@/lib/firestore";
import toast from "react-hot-toast";

export function useUserFollow(targetUserId: string) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  // Change to the target's follower count made in this session (optimistic)
  const [followerDelta, setFollowerDelta] = useState(0);
  const followingRef = useRef(following);
  followingRef.current = following;

  useEffect(() => {
    if (!user || user.uid === targetUserId) {
      setLoading(false);
      return;
    }
    isFollowingUser(targetUserId, user.uid).then((v) => {
      setFollowing(v);
      setLoading(false);
    }).catch(console.error);
  }, [user, targetUserId]);

  const handleToggleFollow = useCallback(async () => {
    if (!user) {
      toast("יש להתחבר כדי לעקוב");
      return;
    }

    const wasFollowing = followingRef.current;
    const step = wasFollowing ? -1 : 1;
    setFollowing(!wasFollowing);
    setFollowerDelta((d) => d + step);

    try {
      await toggleUserFollow(targetUserId, user.uid);
      toast(wasFollowing ? "הפסקת לעקוב" : "עוקב!");
    } catch {
      setFollowing(wasFollowing);
      setFollowerDelta((d) => d - step);
      toast.error("שגיאה");
    }
  }, [user, targetUserId]);

  return { following, loading, followerDelta, handleToggleFollow };
}
