"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import FeedFilters, { FeedMode } from "@/components/feed/FeedFilters";
import FeedStats from "@/components/feed/FeedStats";
import FeaturedBoards from "@/components/boards/FeaturedBoards";
import MasonryFeed from "@/components/feed/MasonryFeed";
import { useFeed } from "@/hooks/useFeed";

const CreateContentModal = dynamic(() => import("@/components/content/CreateContentModal"));
const PostDetailModal = dynamic(() => import("@/components/content/PostDetailModal"));
const BoardsSidebar = dynamic(() => import("@/components/boards/BoardsSidebar"));
const AddToBoardModal = dynamic(() => import("@/components/boards/AddToBoardModal"));
const ShareModal = dynamic(() => import("@/components/content/ShareModal"));
import { useLike } from "@/hooks/useLike";
import { useSave } from "@/hooks/useSave";
import { useAuth } from "@/contexts/AuthContext";
import { getRandomPost, getFollowingUserIds } from "@/lib/firestore";
import { Post, PostType } from "@/lib/types";
import toast from "react-hot-toast";

export default function HomePage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showBoards, setShowBoards] = useState(false);
  const [addToBoardPostId, setAddToBoardPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [sharePost, setSharePost] = useState<Post | null>(null);

  const [seenRandomIds, setSeenRandomIds] = useState<Set<string>>(new Set());
  const [selectedType, setSelectedType] = useState<PostType | null>(null);
  const [feedMode, setFeedMode] = useState<FeedMode>("all");
  const [followingIds, setFollowingIds] = useState<string[] | null>(null);

  // Load following user IDs when user is authenticated and feed mode is "following"
  useEffect(() => {
    if (!user || feedMode !== "following") {
      setFollowingIds(null);
      return;
    }
    getFollowingUserIds(user.uid)
      .then(setFollowingIds)
      .catch(() => {
        toast.error("שגיאה בטעינת רשימת העוקבים");
        setFollowingIds([]);
      });
  }, [user, feedMode]);

  const isFollowingMode = feedMode === "following" && followingIds !== null;

  const { posts, loading } = useFeed({
    search: searchQuery || undefined,
    type: selectedType || undefined,
    followingUserIds: isFollowingMode ? followingIds : undefined,
  });

  const { isLiked, handleLike } = useLike();
  const { isSaved, handleSave } = useSave();

  function handleCreateClick() {
    if (!user) {
      toast("יש להתחבר כדי ליצור תוכן");
      return;
    }
    setShowCreate(true);
  }

  function handleBoardsClick() {
    if (!user) {
      toast("יש להתחבר כדי לראות לוחות");
      return;
    }
    setShowBoards(true);
  }

  function handleLikeClick(postId: string) {
    if (!user) {
      toast("יש להתחבר כדי לתת לייק");
      return;
    }
    handleLike(postId);
  }

  function handleSaveClick(postId: string) {
    if (!user) {
      toast("יש להתחבר כדי לשמור");
      return;
    }
    handleSave(postId);
  }

  async function handleDiscover() {
    try {
      const post = await getRandomPost(seenRandomIds);
      if (post) {
        setSeenRandomIds((prev) => new Set(prev).add(post.id));
        setSelectedPost(post);
      } else {
        toast("אין עוד תוכן לגלות");
      }
    } catch (error) {
      console.error("handleDiscover failed:", error);
      toast.error("שגיאה בטעינת תוכן אקראי");
    }
  }

  function handleAddToBoard(postId: string) {
    if (!user) {
      toast("יש להתחבר כדי להוסיף ללוח");
      return;
    }
    setAddToBoardPostId(postId);
  }

  function handleFeedModeChange(mode: FeedMode) {
    if (mode === "following" && !user) {
      toast("יש להתחבר כדי לראות פיד עוקבים");
      return;
    }
    setFeedMode(mode);
  }

  // Show loading while fetching following IDs
  const isLoading = loading || (feedMode === "following" && followingIds === null && !!user);

  return (
    <>
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateClick={handleCreateClick}
        onBoardsClick={handleBoardsClick}
      />

      <main id="main-content">
        <FeedFilters
          onDiscover={handleDiscover}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          feedMode={feedMode}
          onFeedModeChange={handleFeedModeChange}
          showFeedMode={!!user}
        />
        {feedMode === "all" && (
          <>
            <FeedStats />
            <FeaturedBoards />
          </>
        )}

        {feedMode === "following" && followingIds?.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
            <p style={{ fontSize: 16, marginBottom: 8, color: "var(--text-secondary)" }}>
              עדיין לא עוקבים אחרי אף אחד
            </p>
            <p style={{ fontSize: 14 }}>
              גלשו בפיד ועקבו אחרי יוצרים שמעניינים אתכם
            </p>
          </div>
        ) : (
          <MasonryFeed
            posts={posts}
            loading={isLoading}
            isLiked={isLiked}
            isSaved={isSaved}
            onLike={handleLikeClick}
            onSave={handleSaveClick}
            onAddToBoard={handleAddToBoard}
            onPostClick={setSelectedPost}
            onShare={setSharePost}
          />
        )}
      </main>

      {showCreate && <CreateContentModal onClose={() => setShowCreate(false)} />}
      {showBoards && <BoardsSidebar onClose={() => setShowBoards(false)} />}
      {addToBoardPostId && (
        <AddToBoardModal postId={addToBoardPostId} onClose={() => setAddToBoardPostId(null)} />
      )}
      {sharePost && (
        <ShareModal post={sharePost} onClose={() => setSharePost(null)} />
      )}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          currentUserId={user?.uid}
          isLiked={isLiked(selectedPost.id)}
          isSaved={isSaved(selectedPost.id)}
          onLike={handleLikeClick}
          onSave={handleSaveClick}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </>
  );
}
