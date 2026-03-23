/**
 * Server-side Firestore access using firebase-admin.
 * Used by SSR pages and sitemap generation.
 *
 * Supports two auth modes:
 *   1. FIREBASE_SERVICE_ACCOUNT_KEY env var (JSON string)
 *   2. Individual env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 *
 * When neither is available (e.g. build without env vars), all functions return
 * safe fallback values (null / empty arrays).
 */

import type { Post, Board, UserProfile, Tag } from "./types";
import type { firestore } from "firebase-admin";

// ─── Lazy singleton ─────────────────────────────────────────────────────────

let _db: firestore.Firestore | null = null;
let _initAttempted = false;

function getAdminDb(): firestore.Firestore | null {
  if (_initAttempted) return _db;
  _initAttempted = true;

  try {
    // Dynamic import is not needed here — firebase-admin is a server-only
    // dependency and this file is never imported by client components.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const admin = require("firebase-admin");

    if (admin.apps.length > 0) {
      _db = admin.firestore();
      return _db;
    }

    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      _db = admin.firestore();
      return _db;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
      _db = admin.firestore();
      return _db;
    }

    // Fallback: try default credentials (works with `gcloud auth` or GCE metadata)
    if (projectId) {
      admin.initializeApp({ projectId });
      _db = admin.firestore();
      return _db;
    }

    return null;
  } catch (error) {
    console.warn("firestore-admin: failed to initialize:", error);
    return null;
  }
}

export const isAdminConfigured: boolean = (() => {
  return !!(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    (process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
  );
})();

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convert Firestore Timestamp fields to plain serialisable objects. */
function serialiseTimestamps<T>(data: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === "object" && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
      // Convert admin Timestamp → { seconds, nanoseconds } so it matches client Timestamp shape
      const ts = value as unknown as { seconds: number; nanoseconds: number };
      result[key] = { seconds: ts.seconds, nanoseconds: ts.nanoseconds };
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

function docToPost(id: string, data: Record<string, unknown>): Post {
  return serialiseTimestamps<Post>({
    id,
    boardCount: 0,
    ...data,
  });
}

function docToBoard(id: string, data: Record<string, unknown>): Board {
  return serialiseTimestamps<Board>({
    id,
    likeCount: 0,
    followerCount: 0,
    ownerName: "",
    ownerPhotoURL: null,
    ...data,
  });
}

function docToUserProfile(id: string, data: Record<string, unknown>): UserProfile {
  return serialiseTimestamps<UserProfile>({
    id,
    followerCount: (data.followerCount as number) ?? 0,
    followingCount: (data.followingCount as number) ?? 0,
    mainBoardId: (data.mainBoardId as string) ?? null,
    tagline: (data.tagline as string) ?? "",
    coverImageURL: (data.coverImageURL as string) ?? null,
    socialLinks: (data.socialLinks as unknown[]) ?? [],
    pinnedBoardIds: (data.pinnedBoardIds as string[]) ?? [],
    ...data,
  });
}

function docToTag(data: Record<string, unknown>): Tag {
  return serialiseTimestamps<Tag>(data);
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function getPostAdmin(postId: string): Promise<Post | null> {
  const db = getAdminDb();
  if (!db) return null;
  try {
    const snap = await db.collection("posts").doc(postId).get();
    if (!snap.exists) return null;
    return docToPost(snap.id, snap.data()!);
  } catch (error) {
    console.error("getPostAdmin failed:", error);
    return null;
  }
}

export async function getTagPostsAdmin(tagName: string, limitCount = 50): Promise<Post[]> {
  const db = getAdminDb();
  if (!db) return [];
  try {
    const snap = await db
      .collection("posts")
      .where("tags", "array-contains", tagName)
      .orderBy("createdAt", "desc")
      .limit(limitCount)
      .get();
    return snap.docs.map((d) => docToPost(d.id, d.data()));
  } catch (error) {
    console.error("getTagPostsAdmin failed:", error);
    return [];
  }
}

export async function getPublicBoardsAdmin(
  sortBy: "popular" | "recent" = "popular",
  limitCount = 20
): Promise<Board[]> {
  const db = getAdminDb();
  if (!db) return [];
  try {
    let q = db.collection("boards").where("isPublic", "==", true);
    if (sortBy === "popular") {
      q = q.orderBy("followerCount", "desc");
    } else {
      q = q.orderBy("createdAt", "desc");
    }
    const snap = await q.limit(limitCount).get();
    return snap.docs.map((d) => docToBoard(d.id, d.data()));
  } catch (error) {
    console.error("getPublicBoardsAdmin failed:", error);
    return [];
  }
}

export async function getBoardAdmin(boardId: string): Promise<Board | null> {
  const db = getAdminDb();
  if (!db) return null;
  try {
    const snap = await db.collection("boards").doc(boardId).get();
    if (!snap.exists) return null;
    return docToBoard(snap.id, snap.data()!);
  } catch (error) {
    console.error("getBoardAdmin failed:", error);
    return null;
  }
}

export async function getBoardPostsAdmin(boardId: string): Promise<Post[]> {
  const db = getAdminDb();
  if (!db) return [];
  try {
    const itemsSnap = await db
      .collection("boardItems")
      .where("boardId", "==", boardId)
      .orderBy("addedAt", "desc")
      .get();
    const posts: Post[] = [];
    for (const item of itemsSnap.docs) {
      const postSnap = await db.collection("posts").doc(item.data().postId).get();
      if (postSnap.exists) {
        posts.push(docToPost(postSnap.id, postSnap.data()!));
      }
    }
    return posts;
  } catch (error) {
    console.error("getBoardPostsAdmin failed:", error);
    return [];
  }
}

export async function getUserProfileAdmin(userId: string): Promise<UserProfile | null> {
  const db = getAdminDb();
  if (!db) return null;
  try {
    const snap = await db.collection("users").doc(userId).get();
    if (!snap.exists) return null;
    return docToUserProfile(snap.id, snap.data()!);
  } catch (error) {
    console.error("getUserProfileAdmin failed:", error);
    return null;
  }
}

export async function getUserPublicBoardsAdmin(userId: string): Promise<Board[]> {
  const db = getAdminDb();
  if (!db) return [];
  try {
    const snap = await db
      .collection("boards")
      .where("ownerId", "==", userId)
      .where("isPublic", "==", true)
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map((d) => docToBoard(d.id, d.data()));
  } catch (error) {
    console.error("getUserPublicBoardsAdmin failed:", error);
    return [];
  }
}

export async function getTrendingTagsAdmin(limitCount = 15): Promise<Tag[]> {
  const db = getAdminDb();
  if (!db) return [];
  try {
    const snap = await db
      .collection("tags")
      .orderBy("postCount", "desc")
      .limit(limitCount)
      .get();
    return snap.docs.map((d) => docToTag(d.data()));
  } catch (error) {
    console.error("getTrendingTagsAdmin failed:", error);
    return [];
  }
}

export async function getAllPublicBoardIdsAdmin(): Promise<string[]> {
  const db = getAdminDb();
  if (!db) return [];
  try {
    const snap = await db
      .collection("boards")
      .where("isPublic", "==", true)
      .select()
      .get();
    return snap.docs.map((d) => d.id);
  } catch (error) {
    console.error("getAllPublicBoardIdsAdmin failed:", error);
    return [];
  }
}

export async function getAllTagNamesAdmin(): Promise<string[]> {
  const db = getAdminDb();
  if (!db) return [];
  try {
    const snap = await db.collection("tags").select("name").get();
    return snap.docs.map((d) => d.data().name as string).filter(Boolean);
  } catch (error) {
    console.error("getAllTagNamesAdmin failed:", error);
    return [];
  }
}

export async function getAllUserIdsAdmin(): Promise<string[]> {
  const db = getAdminDb();
  if (!db) return [];
  try {
    const snap = await db.collection("users").select().get();
    return snap.docs.map((d) => d.id);
  } catch (error) {
    console.error("getAllUserIdsAdmin failed:", error);
    return [];
  }
}
