"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Comment } from "@/lib/types";
import { subscribeToComments, addComment, deleteComment } from "@/lib/firestore";
import { Timestamp } from "firebase/firestore";

export function useComments(postId: string) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToComments(
      postId,
      (data) => {
        setComments(data);
        setLoading(false);
      },
      (error) => {
        console.error("useComments subscription error:", error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [postId]);

  const handleAddComment = useCallback(
    async (body: string) => {
      if (!user || !profile || !body.trim()) return;

      // Optimistic comment
      const tempId = `temp-${Date.now()}`;
      const optimisticComment: Comment = {
        id: tempId,
        postId,
        authorId: user.uid,
        authorName: profile.displayName,
        authorPhotoURL: profile.photoURL,
        body: body.trim(),
        createdAt: Timestamp.now(),
      };

      setComments((prev) => [...prev, optimisticComment]);

      try {
        await addComment(postId, {
          authorId: user.uid,
          authorName: profile.displayName,
          authorPhotoURL: profile.photoURL,
          body: body.trim(),
        });
        // Real-time listener will replace the optimistic comment
      } catch {
        // Revert on error
        setComments((prev) => prev.filter((c) => c.id !== tempId));
      }
    },
    [user, profile, postId]
  );

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      // Optimistic removal
      const removed = comments.find((c) => c.id === commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));

      try {
        await deleteComment(commentId, postId);
      } catch {
        // Revert on error
        if (removed) {
          setComments((prev) => [...prev, removed].sort(
            (a, b) => a.createdAt.toMillis() - b.createdAt.toMillis()
          ));
        }
      }
    },
    [comments, postId]
  );

  return { comments, loading, addComment: handleAddComment, deleteComment: handleDeleteComment };
}
