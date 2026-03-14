"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getUserSavedPosts, getBoardPosts, removeFromBoard } from "@/lib/firestore";
import { useFeed } from "@/hooks/useFeed";
import { useLike } from "@/hooks/useLike";
import { useSave } from "@/hooks/useSave";
import { Board, Post } from "@/lib/types";
import MasonryFeed from "@/components/feed/MasonryFeed";
import EmptyState from "@/components/ui/EmptyState";
import toast from "react-hot-toast";
import styles from "./ProfileTabs.module.css";

type TabKey = "myboard" | "content" | "saved" | "boards";

interface ProfileTabsProps {
  userId: string;
  boards: Board[];
  mainBoardId: string | null;
  isOwnProfile: boolean;
}

export default function ProfileTabs({ userId, boards, mainBoardId, isOwnProfile }: ProfileTabsProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("myboard");
  const [boardPosts, setBoardPosts] = useState<Post[]>([]);
  const [boardLoading, setBoardLoading] = useState(true);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  const { posts: userPosts, loading: postsLoading } = useFeed({ authorId: userId });
  const { isLiked, handleLike } = useLike();
  const { isSaved, handleSave } = useSave();

  // Load main board posts
  useEffect(() => {
    if (mainBoardId) {
      setBoardLoading(true);
      getBoardPosts(mainBoardId)
        .then((posts) => {
          setBoardPosts(posts);
          setBoardLoading(false);
        })
        .catch((error) => {
          console.error("ProfileTabs: failed to load board posts:", error);
          setBoardLoading(false);
        });
    } else {
      setBoardLoading(false);
    }
  }, [mainBoardId]);

  // Load saved posts on demand
  useEffect(() => {
    if (activeTab === "saved" && isOwnProfile && user) {
      setSavedLoading(true);
      getUserSavedPosts(user.uid)
        .then((posts) => {
          setSavedPosts(posts);
          setSavedLoading(false);
        })
        .catch((error) => {
          console.error("ProfileTabs: failed to load saved posts:", error);
          toast.error("שגיאה בטעינת הפוסטים השמורים");
          setSavedLoading(false);
        });
    }
  }, [activeTab, isOwnProfile, user]);

  const handleRemoveFromBoard = useCallback(async (postId: string) => {
    if (!mainBoardId) return;
    try {
      await removeFromBoard(mainBoardId, postId);
      setBoardPosts((prev) => prev.filter((p) => p.id !== postId));
      toast("הוסר מהלוח");
    } catch {
      toast.error("שגיאה בהסרה מהלוח");
    }
  }, [mainBoardId]);

  // Filter boards for non-owner: show only public, exclude main board
  const visibleBoards = (isOwnProfile ? boards : boards.filter((b) => b.isPublic))
    .filter((b) => b.id !== mainBoardId);

  return (
    <>
      <div className={styles.tabsWrapper}>
        <div className={styles.tabs} role="tablist" aria-label="תוכן פרופיל">
          <button
            className={activeTab === "myboard" ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab("myboard")}
            role="tab"
            aria-selected={activeTab === "myboard"}
            aria-controls="tabpanel-myboard"
            id="tab-myboard"
          >
            הלוח שלי
          </button>
          {isOwnProfile && (
            <button
              className={activeTab === "content" ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab("content")}
              role="tab"
              aria-selected={activeTab === "content"}
              aria-controls="tabpanel-content"
              id="tab-content"
            >
              התוכן שלי
            </button>
          )}
          {isOwnProfile && (
            <button
              className={activeTab === "saved" ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab("saved")}
              role="tab"
              aria-selected={activeTab === "saved"}
              aria-controls="tabpanel-saved"
              id="tab-saved"
            >
              שמורים
            </button>
          )}
          <button
            className={activeTab === "boards" ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab("boards")}
            role="tab"
            aria-selected={activeTab === "boards"}
            aria-controls="tabpanel-boards"
            id="tab-boards"
          >
            לוחות
          </button>
        </div>
      </div>

      {activeTab === "myboard" && (
        <div role="tabpanel" id="tabpanel-myboard" aria-labelledby="tab-myboard" className={styles.tabContent}>
          <MasonryFeed
            posts={boardPosts}
            loading={boardLoading}
            isLiked={isLiked}
            isSaved={isSaved}
            onLike={handleLike}
            onSave={handleSave}
            onRemoveFromBoard={isOwnProfile ? handleRemoveFromBoard : undefined}
          />
        </div>
      )}

      {activeTab === "content" && isOwnProfile && (
        <div role="tabpanel" id="tabpanel-content" aria-labelledby="tab-content" className={styles.tabContent}>
          <MasonryFeed
            posts={userPosts}
            loading={postsLoading}
            isLiked={isLiked}
            isSaved={isSaved}
            onLike={handleLike}
            onSave={handleSave}
          />
        </div>
      )}

      {activeTab === "saved" && isOwnProfile && (
        <div role="tabpanel" id="tabpanel-saved" aria-labelledby="tab-saved" className={styles.tabContent}>
          <MasonryFeed
            posts={savedPosts}
            loading={savedLoading}
            isLiked={isLiked}
            isSaved={isSaved}
            onLike={handleLike}
            onSave={handleSave}
          />
        </div>
      )}

      {activeTab === "boards" && (
        <div
          role="tabpanel"
          id="tabpanel-boards"
          aria-labelledby="tab-boards"
          className={`${styles.boardsContainer} ${styles.tabContent}`}
        >
          {visibleBoards.length === 0 ? (
            <EmptyState text="עדיין אין לוחות נוספים" />
          ) : (
            <div className={styles.boardsGrid}>
              {visibleBoards.map((board) => (
                <Link
                  key={board.id}
                  href={`/boards/${board.id}`}
                  className={styles.boardCard}
                  style={{ backgroundColor: `color-mix(in srgb, ${board.color} 8%, transparent)` }}
                >
                  <h3 style={{ color: board.color }}>{board.name}</h3>
                  <p>{board.description}</p>
                  <span className={styles.boardCardMeta}>
                    {board.itemCount} פריטים • {board.isPublic ? "ציבורי" : "פרטי"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
