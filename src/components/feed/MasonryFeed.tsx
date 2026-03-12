"use client";

import Masonry from "react-masonry-css";
import { Post } from "@/lib/types";
import ContentCard from "./ContentCard";
import EmptyState from "@/components/ui/EmptyState";
import styles from "./MasonryFeed.module.css";

interface MasonryFeedProps {
  posts: Post[];
  loading: boolean;
  isLiked: (postId: string) => boolean;
  isSaved: (postId: string) => boolean;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onAddToBoard?: (postId: string) => void;
  onRemoveFromBoard?: (postId: string) => void;
  onShowBoards?: (postId: string) => void;
  onPostClick?: (post: Post) => void;
}

const SKELETON_HEIGHTS = [140, 180, 160, 200, 150, 190, 170, 210];

const BREAKPOINT_COLS = {
  default: 4,
  1200: 3,
  800: 2,
  500: 1,
};

function SkeletonCard({ height }: { height: number }) {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonImage} style={{ height }} />
      <div className={styles.skeletonBody}>
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} />
      </div>
    </div>
  );
}

export default function MasonryFeed({
  posts,
  loading,
  isLiked,
  isSaved,
  onLike,
  onSave,
  onAddToBoard,
  onRemoveFromBoard,
  onShowBoards,
  onPostClick,
}: MasonryFeedProps) {
  if (loading) {
    return (
      <div className={styles.container}>
        <Masonry
          breakpointCols={BREAKPOINT_COLS}
          className={styles.masonry}
          columnClassName={styles.masonryColumn}
        >
          {SKELETON_HEIGHTS.map((h, i) => (
            <SkeletonCard key={i} height={h} />
          ))}
        </Masonry>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={styles.container}>
        <EmptyState
          icon="🌿"
          text="אין תוכן כרגע. נסו לשנות את הסינון או ליצור פתק חדש."
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Masonry
        breakpointCols={BREAKPOINT_COLS}
        className={styles.masonry}
        columnClassName={styles.masonryColumn}
      >
        {posts.map((post, i) => (
          <ContentCard
            key={post.id}
            post={post}
            index={i}
            isLiked={isLiked(post.id)}
            isSaved={isSaved(post.id)}
            onLike={onLike}
            onSave={onSave}
            onAddToBoard={onAddToBoard}
            onRemoveFromBoard={onRemoveFromBoard}
            onShowBoards={onShowBoards}
            onClick={onPostClick}
          />
        ))}
      </Masonry>
    </div>
  );
}
