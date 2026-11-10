"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import MasonryFeed from "@/components/feed/MasonryFeed";
import ConceptGraph, { buildGraphNodes } from "@/components/concepts/ConceptGraph";
import ConceptEditModal from "@/components/concepts/ConceptEditModal";
import WikiText from "@/components/concepts/WikiText";
import { useFeed } from "@/hooks/useFeed";
import { useLike } from "@/hooks/useLike";
import { useSave } from "@/hooks/useSave";
import { useConceptPage } from "@/hooks/useConceptPage";
import { useAuth } from "@/contexts/AuthContext";
import { conceptHref, normalizeConcept } from "@/lib/wikilinks";
import { Post } from "@/lib/types";
import toast from "react-hot-toast";
import styles from "./TagPage.module.css";

// The feed shares the row with a 300px sidebar, so it needs fewer columns than the home feed
const CONCEPT_FEED_COLS = { default: 3, 1400: 2, 500: 1 };

interface TagClientProps {
  tagName: string;
  initialPosts: Post[];
  initialPostCount: number;
}

export default function TagClient({ tagName, initialPosts, initialPostCount }: TagClientProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  // Real-time subscription overrides SSR data once loaded
  const { posts: livePosts, loading } = useFeed({ tag: tagName });
  const { isLiked, handleLike } = useLike();
  const { isSaved, handleSave } = useSave();
  const { concept, backlinks, mentions, loading: conceptLoading, reload } = useConceptPage(tagName);

  const centerKey = normalizeConcept(tagName);
  const displayName = concept?.name ?? tagName;

  // An alias was opened (e.g. /tags/אנאהטה) — move to the canonical concept page
  useEffect(() => {
    if (concept && normalizeConcept(concept.name) !== centerKey && concept.aliases?.includes(centerKey)) {
      router.replace(conceptHref(concept.name));
    }
  }, [concept, centerKey, router]);

  // Use live posts once available, fall back to server-rendered initial data
  const taggedPosts = livePosts.length > 0 || !loading ? livePosts : initialPosts;

  // Tagged posts first, then posts that only mention the concept with [[ ]]
  const posts = useMemo(() => {
    const seen = new Set(taggedPosts.map((p) => p.id));
    return [...taggedPosts, ...mentions.filter((p) => !seen.has(p.id))];
  }, [taggedPosts, mentions]);
  const postCount = posts.length > 0 ? posts.length : initialPostCount;

  const graphNodes = useMemo(() => {
    const cooccur = new Map<string, number>();
    for (const p of posts) {
      for (const t of [...p.tags, ...(p.links ?? [])]) {
        const key = normalizeConcept(t);
        if (key !== centerKey) cooccur.set(t, (cooccur.get(t) ?? 0) + 1);
      }
    }
    const topCooccur = [...cooccur.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t]) => t);
    return buildGraphNodes(centerKey, [
      { kind: "cooccur", weight: 1, labels: topCooccur },
      { kind: "backlink", weight: 2, labels: backlinks.map((b) => b.name) },
      { kind: "link", weight: 2, labels: concept?.links ?? [] },
      { kind: "related", weight: 3, labels: concept?.related ?? [] },
    ]);
  }, [posts, backlinks, concept, centerKey]);

  function openEditor() {
    if (!user) {
      toast("יש להתחבר כדי לערוך");
      return;
    }
    setEditing(true);
  }

  return (
    <>
      <Navbar searchQuery="" onSearchChange={() => {}} onCreateClick={() => {}} />

      <main id="main-content" className={styles.page}>
        <div className={styles.header}>
          <Link href="/" className={styles.back}>
            ← חזרה
          </Link>
          <div className={styles.tagInfo}>
            <h1 className={styles.tagTitle}>{displayName}</h1>
            <p className={styles.tagCount}>
              {postCount} פוסטים
              {(concept?.aliases?.length ?? 0) > 0 && <> · נקרא גם: {concept!.aliases!.join(", ")}</>}
            </p>
          </div>
        </div>

        <div className={styles.layout}>
          <section className={styles.conceptCard} aria-label="תיאור המושג">
            {conceptLoading ? (
              <p className={styles.muted}>טוען…</p>
            ) : concept?.description ? (
              <p className={styles.description}>
                <WikiText text={concept.description} />
              </p>
            ) : (
              <p className={styles.muted}>
                לעמוד הזה עוד אין תיאור משותף. אפשר להיות הראשונים לכתוב מה המושג הזה אומר לכם.
              </p>
            )}
            <div className={styles.conceptFooter}>
              {concept?.updatedByName && (
                <span className={styles.muted}>עודכן לאחרונה על ידי {concept.updatedByName}</span>
              )}
              <button className={styles.editBtn} onClick={openEditor}>
                {concept?.description ? "עריכת העמוד" : "כתיבת תיאור"}
              </button>
            </div>
          </section>

          <div className={styles.feedWrap}>
            <MasonryFeed
              breakpointCols={CONCEPT_FEED_COLS}
              posts={posts}
              loading={loading && initialPosts.length === 0}
              isLiked={isLiked}
              isSaved={isSaved}
              onLike={(id) => user ? handleLike(id) : toast("יש להתחבר")}
              onSave={(id) => user ? handleSave(id) : toast("יש להתחבר")}
            />
          </div>

          <aside className={styles.sideCol}>
            <ConceptGraph centerLabel={displayName} nodes={graphNodes} />

            {(concept?.related?.length ?? 0) > 0 && (
              <section className={styles.sideBox}>
                <h2 className={styles.sideTitle}>מושגים קשורים</h2>
                <div className={styles.chips}>
                  {concept!.related!.map((r) => (
                    <Link key={r} href={conceptHref(r)} className={styles.chip}>{r}</Link>
                  ))}
                </div>
              </section>
            )}

            {backlinks.length > 0 && (
              <section className={styles.sideBox}>
                <h2 className={styles.sideTitle}>מושגים שמקשרים לכאן</h2>
                <div className={styles.chips}>
                  {backlinks.map((b) => (
                    <Link key={b.name} href={conceptHref(b.name)} className={styles.chip}>{b.name}</Link>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </main>

      {editing && (
        <ConceptEditModal
          name={displayName}
          concept={concept}
          onClose={() => setEditing(false)}
          onSaved={reload}
        />
      )}
    </>
  );
}
