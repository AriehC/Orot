import { Timestamp } from "firebase/firestore";

export type PostType = "note" | "quote" | "image" | "video";
export type FeedSort = "trending" | "recent" | "random";
export type SocialPlatform =
  | "instagram"
  | "twitter"
  | "youtube"
  | "tiktok"
  | "spotify"
  | "telegram"
  | "facebook"
  | "threads"
  | "linkedin"
  | "whatsapp"
  | "website";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  handle?: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  photoURL: string | null;
  bio: string;
  tagline: string;
  coverImageURL: string | null;
  socialLinks: SocialLink[];
  pinnedBoardIds: string[];
  mainBoardId: string | null;
  followerCount: number;
  followingCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Post {
  id: string;
  type: PostType;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;
  tags: string[];
  color: string | null;
  mediaURL: string | null;
  thumbnailURL: string | null;
  mediaType: "image" | "video" | null;
  likeCount: number;
  saveCount: number;
  boardCount: number;
  commentCount: number;
  sourceURL: string | null;
  sourceType: "instagram" | null;
  /** Concepts referenced via [[ ]] in the body (normalized). Missing on older posts. */
  links?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Board {
  id: string;
  name: string;
  description: string;
  color: string;
  ownerId: string;
  ownerName: string;
  ownerPhotoURL: string | null;
  isPublic: boolean;
  itemCount: number;
  likeCount: number;
  followerCount: number;
  coverImageURL: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BoardItem {
  id: string;
  boardId: string;
  postId: string;
  addedBy: string;
  addedAt: Timestamp;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: Timestamp;
}

export interface Save {
  id: string;
  postId: string;
  userId: string;
  createdAt: Timestamp;
}

export interface BoardLike {
  id: string;
  boardId: string;
  userId: string;
  createdAt: Timestamp;
}

export interface BoardFollow {
  id: string;
  boardId: string;
  userId: string;
  createdAt: Timestamp;
}

export interface UserFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Timestamp;
}

/**
 * A tag doubles as a shared "concept page" (wiki-style).
 * Doc id = normalizeConcept(name). Concept fields are optional because
 * tags created implicitly by posts start empty and get filled in later.
 */
export interface Tag {
  name: string;
  postCount: number;
  lastUsedAt: Timestamp;
  /** Shared description; may contain [[wiki links]] */
  description?: string;
  /** Alternative names, normalized (lowercase, trimmed) */
  aliases?: string[];
  /** Explicitly related concept names (normalized) */
  related?: string[];
  /** Concepts linked via [[ ]] inside the description (normalized) */
  links?: string[];
  updatedBy?: string;
  updatedByName?: string;
  updatedAt?: Timestamp;
}

export interface ConceptGraphNode {
  id: string;
  label: string;
  /** strength of connection to the center, 1..3 */
  weight: number;
  kind: "center" | "related" | "link" | "backlink" | "cooccur";
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;
  body: string;
  createdAt: Timestamp;
}

export type NotificationType = "like" | "comment" | "follow" | "board_add";

export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  actorId: string;
  actorName: string;
  actorPhotoURL: string | null;
  postId: string | null;
  postTitle: string | null;
  boardId: string | null;
  boardName: string | null;
  read: boolean;
  createdAt: Timestamp;
}
