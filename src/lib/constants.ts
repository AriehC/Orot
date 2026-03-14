import { PostType } from "./types";

/** Saturated counterparts for dark mode — light pastels are too close to white
 *  to produce visible color variety when mixed into a dark base */
export const DARK_CARD_COLORS: Record<string, string> = {
  "#FFF8F0": "#D4935E", // warm amber
  "#F0F4F8": "#6088C0", // blue
  "#F5F0FF": "#9070D8", // purple
  "#F0FFF5": "#50B878", // green
  "#FFF5F5": "#D47070", // rose
  "#FFFBF0": "#C8B048", // gold
  // CreateContentModal deeper pastels
  "#EFE3D4": "#D4935E",
  "#D9E3EE": "#6088C0",
  "#E0D4F6": "#9070D8",
  "#D2EDDC": "#50B878",
  "#F4D8D8": "#D47070",
  "#EFE5CD": "#C8B048",
};

export const TYPE_CONFIG: Record<PostType, { label: string; bg: string; color: string }> = {
  note: { label: "פתק", bg: "#FFF3E8", color: "#C17B4A" },
  quote: { label: "ציטוט", bg: "#F0E8FF", color: "#9B7ED8" },
  image: { label: "תמונה", bg: "#E8F5ED", color: "#5DA87E" },
  video: { label: "וידאו", bg: "#E8F0F5", color: "#6B8FA3" },
};

export const TYPE_OPTIONS: { key: PostType; label: string }[] = [
  { key: "note", label: "פתק" },
  { key: "quote", label: "ציטוט" },
  { key: "image", label: "תמונה" },
  { key: "video", label: "וידאו" },
];

export const CARD_COLORS = ["#FFF8F0", "#F0F4F8", "#F5F0FF", "#F0FFF5", "#FFF5F5", "#FFFBF0"];

export const CREATE_CARD_COLORS = ["#EFE3D4", "#D9E3EE", "#E0D4F6", "#D2EDDC", "#F4D8D8", "#EFE5CD"];

/** Brand colors for social platform hover effects */
export const PLATFORM_BRAND_COLORS: Record<string, string> = {
  instagram: "#E1306C",
  twitter: "#1DA1F2",
  youtube: "#FF0000",
  tiktok: "#000000",
  spotify: "#1DB954",
  telegram: "#0088CC",
  facebook: "#1877F2",
  threads: "#000000",
  linkedin: "#0A66C2",
  whatsapp: "#25D366",
  website: "#C17B4A",
};
