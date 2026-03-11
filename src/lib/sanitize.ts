export const LIMITS = {
  TITLE_MAX: 200,
  BODY_MAX: 5000,
  BIO_MAX: 500,
  NAME_MAX: 50,
  BOARD_NAME_MAX: 100,
  BOARD_DESC_MAX: 500,
  TAG_MAX: 30,
  TAGS_MAX_COUNT: 10,
  FILE_SIZE_IMAGE: 10 * 1024 * 1024, // 10MB
  FILE_SIZE_VIDEO: 100 * 1024 * 1024, // 100MB
} as const;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export function sanitizeString(input: string, maxLength: number): string {
  return input.trim().slice(0, maxLength);
}

export function validateFileUpload(file: File, type: "image" | "video"): string | null {
  const allowedTypes = type === "video" ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;
  if (!allowedTypes.includes(file.type)) {
    return type === "video" ? "סוג קובץ וידאו לא נתמך" : "סוג קובץ תמונה לא נתמך";
  }
  const maxSize = type === "video" ? LIMITS.FILE_SIZE_VIDEO : LIMITS.FILE_SIZE_IMAGE;
  if (file.size > maxSize) {
    const sizeMB = Math.round(maxSize / (1024 * 1024));
    return `הקובץ גדול מדי (מקסימום ${sizeMB}MB)`;
  }
  return null;
}
