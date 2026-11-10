"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useConceptPreview } from "@/hooks/useConceptPreview";
import { conceptHref, stripWikiMarkup } from "@/lib/wikilinks";
import styles from "./Concepts.module.css";

interface WikiLinkProps {
  concept: string;
  label: string;
  onNavigate?: () => void;
}

const PREVIEW_WIDTH = 280;

export default function WikiLink({ concept, label, onNavigate }: WikiLinkProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; above: boolean }>({ top: 0, left: 0, above: false });
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { concept: data, loaded } = useConceptPreview(concept, open);

  function show() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (open) return;
    showTimer.current = setTimeout(() => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      const above = rect.bottom + 180 > window.innerHeight;
      // RTL: align the preview's right edge with the link, clamped to the viewport
      const left = Math.min(
        Math.max(8, rect.right - PREVIEW_WIDTH),
        window.innerWidth - PREVIEW_WIDTH - 8
      );
      setPos({ top: above ? rect.top - 8 : rect.bottom + 8, left, above });
      setOpen(true);
    }, 250);
  }

  function hide() {
    if (showTimer.current) clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => setOpen(false), 150);
  }

  const description = data?.description ? stripWikiMarkup(data.description) : "";

  return (
    <>
      <Link
        ref={anchorRef}
        href={conceptHref(concept)}
        className={styles.wikiLink}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(false);
          onNavigate?.();
        }}
      >
        {label}
      </Link>
      {/* Portal: cards use CSS transforms, which would trap position:fixed inside them */}
      {open && createPortal(
        <span
          role="tooltip"
          className={styles.preview}
          style={{
            top: pos.top,
            left: pos.left,
            width: PREVIEW_WIDTH,
            transform: pos.above ? "translateY(-100%)" : undefined,
          }}
          onMouseEnter={show}
          onMouseLeave={hide}
          // React events bubble through portals — keep clicks from opening the card underneath
          onClick={(e) => e.stopPropagation()}
        >
          <span className={styles.previewTitle}>{data?.name ?? concept}</span>
          {!loaded ? (
            <span className={styles.previewMuted}>טוען…</span>
          ) : description ? (
            <span className={styles.previewText}>
              {description.length > 220 ? description.slice(0, 220) + "…" : description}
            </span>
          ) : (
            <span className={styles.previewMuted}>
              {data ? "לעמוד הזה עוד אין תיאור. אפשר להיות הראשונים לכתוב." : "מושג חדש — העמוד מחכה שימלאו אותו."}
            </span>
          )}
          {data && (data.postCount > 0 || (data.aliases?.length ?? 0) > 0) && (
            <span className={styles.previewMeta}>
              {data.postCount > 0 && <>{data.postCount} פוסטים</>}
              {data.postCount > 0 && (data.aliases?.length ?? 0) > 0 && " · "}
              {(data.aliases?.length ?? 0) > 0 && <>גם: {data.aliases!.slice(0, 3).join(", ")}</>}
            </span>
          )}
        </span>,
        document.body
      )}
    </>
  );
}
