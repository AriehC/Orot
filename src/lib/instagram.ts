/**
 * Instagram URL validation and content parsing utilities.
 */

const INSTAGRAM_URL_REGEX =
  /^https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[\w-]+\/?/i;

export function isInstagramURL(url: string): boolean {
  return INSTAGRAM_URL_REGEX.test(url.trim());
}

/** Extract the shortcode from an Instagram URL (e.g. "CxABC123"). */
export function extractShortcode(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([\w-]+)/i);
  return match?.[1] ?? null;
}

/**
 * Split a caption into a title (first line) and body (rest).
 * Strips leading/trailing whitespace per section.
 */
export function parseCaption(caption: string): { title: string; body: string } {
  const lines = caption.split("\n").map((l) => l.trim());
  const firstNonEmpty = lines.findIndex((l) => l.length > 0);
  if (firstNonEmpty === -1) return { title: "", body: "" };

  const title = lines[firstNonEmpty].slice(0, 200);
  const rest = lines
    .slice(firstNonEmpty + 1)
    .join("\n")
    .trim()
    .slice(0, 5000);

  return { title, body: rest };
}

/** Extract hashtags from a caption string. */
export function extractHashtags(caption: string): string[] {
  const matches = caption.match(/#[\p{L}\p{N}_]+/gu);
  if (!matches) return [];
  return [...new Set(matches.map((t) => t.slice(1).slice(0, 30)))].slice(0, 10);
}
