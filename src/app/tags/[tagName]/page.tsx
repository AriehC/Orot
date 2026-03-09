"use client";

import { use } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import MasonryFeed from "@/components/feed/MasonryFeed";
import { useFeed } from "@/hooks/useFeed";
import { useLike } from "@/hooks/useLike";
import { useSave } from "@/hooks/useSave";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import styles from "./TagPage.module.css";

export default function TagPage({ params }: { params: Promise<{ tagName: string }> }) {
  const { tagName } = use(params);
  const tag = decodeURIComponent(tagName);
  const { user } = useAuth();

  const { posts, loading } = useFeed({ tag });
  const { isLiked, handleLike } = useLike();
  const { isSaved, handleSave } = useSave();

  return (
    <>
      <Navbar searchQuery="" onSearchChange={() => {}} onCreateClick={() => {}} />

      <div className={styles.header}>
        <Link href="/" className={styles.back}>
          ← חזרה
        </Link>
        <div className={styles.tagInfo}>
          <h1 className={styles.tagTitle}>#{tag}</h1>
          <p className={styles.tagCount}>
            {!loading && `${posts.length} פוסטים`}
          </p>
        </div>
      </div>

      <MasonryFeed
        posts={posts}
        loading={loading}
        isLiked={isLiked}
        isSaved={isSaved}
        onLike={(id) => user ? handleLike(id) : toast("יש להתחבר")}
        onSave={(id) => user ? handleSave(id) : toast("יש להתחבר")}
      />
    </>
  );
}
