/**
 * Wiki-style [[concept]] links — pure helpers, safe for client and server.
 * Syntax: [[שם המושג]] or [[שם המושג|טקסט לתצוגה]]
 */

export const CONCEPT_NAME_MAX = 60;

const WIKI_LINK_RE = /\[\[([^\[\]|\n]{1,80})(?:\|([^\[\]\n]{1,80}))?\]\]/g;

export type WikiSegment =
  | { kind: "text"; text: string }
  | { kind: "link"; concept: string; label: string };

/** Canonical key for a concept: trimmed, lowercased, single spaces, no slashes (Firestore doc ids). */
export function normalizeConcept(name: string): string {
  return name.trim().replace(/\s+/g, " ").replace(/\//g, "-").toLowerCase().slice(0, CONCEPT_NAME_MAX);
}

export function conceptHref(name: string): string {
  return `/tags/${encodeURIComponent(name.trim())}`;
}

export function parseWikiText(text: string): WikiSegment[] {
  const segments: WikiSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(WIKI_LINK_RE)) {
    const concept = match[1].trim();
    if (!concept) continue;
    const index = match.index ?? 0;
    if (index > last) segments.push({ kind: "text", text: text.slice(last, index) });
    segments.push({ kind: "link", concept, label: (match[2] ?? match[1]).trim() });
    last = index + match[0].length;
  }
  if (last < text.length) segments.push({ kind: "text", text: text.slice(last) });
  return segments;
}

/** Unique normalized concept keys referenced in a text. */
export function extractLinks(text: string | null | undefined, max = 50): string[] {
  if (!text) return [];
  const keys = new Set<string>();
  for (const seg of parseWikiText(text)) {
    if (seg.kind === "link") keys.add(normalizeConcept(seg.concept));
    if (keys.size >= max) break;
  }
  return [...keys].filter(Boolean);
}

/** Strip [[ ]] markup for plain-text contexts (meta descriptions, previews). */
export function stripWikiMarkup(text: string): string {
  return parseWikiText(text)
    .map((s) => (s.kind === "text" ? s.text : s.label))
    .join("");
}

/** Split a comma/newline separated list into normalized, unique concept keys. */
export function parseConceptList(input: string, max: number): string[] {
  const keys = new Set<string>();
  for (const part of input.split(/[,\n،]/)) {
    const key = normalizeConcept(part);
    if (key) keys.add(key);
  }
  return [...keys].slice(0, max);
}
