"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import MasonryFeed from "@/components/feed/MasonryFeed";
import { useFeed } from "@/hooks/useFeed";
import { useLike } from "@/hooks/useLike";
import { useSave } from "@/hooks/useSave";
import { useAuth } from "@/contexts/AuthContext";
import { Post } from "@/lib/types";
import toast from "react-hot-toast";
import styles from "./TagPage.module.css";

interface TagClientProps {
  tagName: string;
  initialPosts: Post[];
  initialPostCount: number;
}

export default function TagClient({ tagName, initialPosts, initialPostCount }: TagClientProps) {
  const { user } = useAuth();

  // Real-time subscription overrides SSR data once loaded
  const { posts: livePosts, loading } = useFeed({ tag: tagName });
  const { isLiked, handleLike } = useLike();
  const { isSaved, handleSave } = useSave();

  // Use live posts once available, fall back to server-rendered initial data
  const posts = livePosts.length > 0 || !loading ? livePosts : initialPosts;
  const postCount = posts.length > 0 ? posts.length : initialPostCount;

  return (
    <>
      <Navbar searchQuery="" onSearchChange={() => {}} onCreateClick={() => {}} />

      <main id="main-content">
        <div className={styles.header}>
          <Link href="/" className={styles.back}>
            ← חזרה
          </Link>
          <div className={styles.tagInfo}>
            <h1 className={styles.tagTitle}>#{tagName}</h1>
            <p className={styles.tagCount}>
              {postCount} פוסטים
            </p>
          </div>
        </div>

        <MasonryFeed
          posts={posts}
          loading={loading && initialPosts.length === 0}
          isLiked={isLiked}
          isSaved={isSaved}
          onLike={(id) => user ? handleLike(id) : toast("יש להתחבר")}
          onSave={(id) => user ? handleSave(id) : toast("יש להתחבר")}
        />
      </main>
    </>
  );
}
