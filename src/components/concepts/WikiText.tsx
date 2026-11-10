"use client";

import { Fragment } from "react";
import { parseWikiText } from "@/lib/wikilinks";
import WikiLink from "./WikiLink";

interface WikiTextProps {
  text: string;
  onNavigate?: () => void;
}

/** Renders plain text with [[concept]] links turned into previewable links. */
export default function WikiText({ text, onNavigate }: WikiTextProps) {
  return (
    <>
      {parseWikiText(text).map((seg, i) =>
        seg.kind === "text" ? (
          <Fragment key={i}>{seg.text}</Fragment>
        ) : (
          <WikiLink key={i} concept={seg.concept} label={seg.label} onNavigate={onNavigate} />
        )
      )}
    </>
  );
}
