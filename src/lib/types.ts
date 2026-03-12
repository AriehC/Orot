import { Timestamp } from "firebase/firestore";

export type PostType = "note" | "quote" | "image" | "video";
export type FeedSort = "trending" | "recent" | "random";
export type SocialPlatform = "instagram" | "twitter" | "youtube" | "tiktok" | "spotify" | "telegram" | "website";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
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
  sourceURL: string | null;
  sourceType: "instagram" | null;
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

export interface Tag {
  name: string;
  postCount: number;
  lastUsedAt: Timestamp;
}
