"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import FeedFilters from "@/components/feed/FeedFilters";
import FeedStats from "@/components/feed/FeedStats";
import FeaturedBoards from "@/components/boards/FeaturedBoards";
import MasonryFeed from "@/components/feed/MasonryFeed";
import CreateContentModal from "@/components/content/CreateContentModal";
import PostDetailModal from "@/components/content/PostDetailModal";
import BoardsSidebar from "@/components/boards/BoardsSidebar";
import AddToBoardModal from "@/components/boards/AddToBoardModal";
import BoardsContainingPostModal from "@/components/boards/BoardsContainingPostModal";
import { useFeed } from "@/hooks/useFeed";
import { useLike } from "@/hooks/useLike";
import { useSave } from "@/hooks/useSave";
import { useAuth } from "@/contexts/AuthContext";
import { Post } from "@/lib/types";
import toast from "react-hot-toast";

export default function HomePage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showBoards, setShowBoards] = useState(false);
  const [addToBoardPostId, setAddToBoardPostId] = useState<string | null>(null);
  const [showBoardsForPostId, setShowBoardsForPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const { posts, loading } = useFeed({
    search: searchQuery || undefined,
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

  function handleAddToBoard(postId: string) {
    if (!user) {
      toast("יש להתחבר כדי להוסיף ללוח");
      return;
    }
    setAddToBoardPostId(postId);
  }

  return (
    <>
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateClick={handleCreateClick}
        onBoardsClick={handleBoardsClick}
      />

      <FeedFilters />
      <FeedStats />
      <FeaturedBoards />

      <MasonryFeed
        posts={posts}
        loading={loading}
        isLiked={isLiked}
        isSaved={isSaved}
        onLike={handleLikeClick}
        onSave={handleSaveClick}
        onAddToBoard={handleAddToBoard}
        onShowBoards={setShowBoardsForPostId}
        onPostClick={setSelectedPost}
      />

      {showCreate && <CreateContentModal onClose={() => setShowCreate(false)} />}
      {showBoards && <BoardsSidebar onClose={() => setShowBoards(false)} />}
      {addToBoardPostId && (
        <AddToBoardModal postId={addToBoardPostId} onClose={() => setAddToBoardPostId(null)} />
      )}
      {showBoardsForPostId && (
        <BoardsContainingPostModal postId={showBoardsForPostId} onClose={() => setShowBoardsForPostId(null)} />
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
