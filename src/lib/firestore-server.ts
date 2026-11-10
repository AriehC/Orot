/**
 * Server-side Firestore reads for SSR pages and the sitemap.
 *
 * Uses the Firebase *client* SDK in its "lite" (REST) flavour, unauthenticated:
 * the server sees exactly what an anonymous visitor may read under firestore.rules.
 * (firebase-admin is not used here — Turbopack externalises it under a hashed alias
 * in .next/node_modules, which Firebase Functions deploys drop, so it never loaded.)
 *
 * Every function returns a safe fallback (null / []) on failure so pages still
 * render and hydrate from the client.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
} from "firebase/firestore/lite";
import type { Post, Board, UserProfile, Tag } from "./types";

const APP_NAME = "orot-server";

let _db: Firestore | null = null;
let _initAttempted = false;

function getServerDb(): Firestore | null {
  if (_initAttempted) return _db;
  _initAttempted = true;

  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  if (!config.apiKey || !config.projectId) return null;

  try {
    const app: FirebaseApp = getApps().some((a) => a.name === APP_NAME)
      ? getApp(APP_NAME)
      : initializeApp(config, APP_NAME);
    _db = getFirestore(app);
    if (process.env.NEXT_PUBLIC_USE_EMULATORS === "true") {
      connectFirestoreEmulator(_db, "127.0.0.1", 8080);
    }
    return _db;
  } catch (error) {
    console.warn("firestore-server: failed to initialize:", error);
    return null;
  }
}

export const isServerDbConfigured: boolean = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Firestore Timestamps → plain { seconds, nanoseconds } so they can cross into client components. */
function serialiseTimestamps<T>(data: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === "object" && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
      const ts = value as unknown as { seconds: number; nanoseconds: number };
      result[key] = { seconds: ts.seconds, nanoseconds: ts.nanoseconds };
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

function docToPost(id: string, data: Record<string, unknown>): Post {
  return serialiseTimestamps<Post>({ id, boardCount: 0, ...data });
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

function docToUserProfile(id: string, raw: Record<string, unknown>): UserProfile {
  // Drop the legacy email field so it never reaches SSR HTML
  const { email: _legacyEmail, ...data } = raw;
  void _legacyEmail;
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

async function safely<T>(name: string, fallback: T, fn: (db: Firestore) => Promise<T>): Promise<T> {
  const db = getServerDb();
  if (!db) return fallback;
  try {
    return await fn(db);
  } catch (error) {
    // Permission denials are expected for private data (e.g. private boards)
    console.error(`${name} failed:`, (error as Error).message);
    return fallback;
  }
}

async function runQuery(db: Firestore, path: string, ...constraints: QueryConstraint[]) {
  return getDocs(query(collection(db, path), ...constraints));
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function getPostServer(postId: string): Promise<Post | null> {
  return safely("getPostServer", null, async (db) => {
    const snap = await getDoc(doc(db, "posts", postId));
    return snap.exists() ? docToPost(snap.id, snap.data()) : null;
  });
}

export function getTagPostsServer(tagName: string, limitCount = 50): Promise<Post[]> {
  return safely("getTagPostsServer", [], async (db) => {
    const snap = await runQuery(
      db,
      "posts",
      where("tags", "array-contains", tagName),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    return snap.docs.map((d) => docToPost(d.id, d.data()));
  });
}

export function getPublicBoardsServer(sortBy: "popular" | "recent" = "popular", limitCount = 20): Promise<Board[]> {
  return safely("getPublicBoardsServer", [], async (db) => {
    const snap = await runQuery(
      db,
      "boards",
      where("isPublic", "==", true),
      orderBy(sortBy === "popular" ? "followerCount" : "createdAt", "desc"),
      limit(limitCount)
    );
    return snap.docs.map((d) => docToBoard(d.id, d.data()));
  });
}

/** Returns null for private boards (rules deny anonymous reads). */
export function getBoardServer(boardId: string): Promise<Board | null> {
  return safely("getBoardServer", null, async (db) => {
    const snap = await getDoc(doc(db, "boards", boardId));
    return snap.exists() ? docToBoard(snap.id, snap.data()) : null;
  });
}

/** Board items are readable only by signed-in users, so this is usually [] — the client loads them. */
export function getBoardPostsServer(boardId: string): Promise<Post[]> {
  return safely("getBoardPostsServer", [], async (db) => {
    const itemsSnap = await runQuery(db, "boardItems", where("boardId", "==", boardId), orderBy("addedAt", "desc"));
    const snaps = await Promise.all(itemsSnap.docs.map((item) => getDoc(doc(db, "posts", item.data().postId))));
    return snaps.filter((s) => s.exists()).map((s) => docToPost(s.id, s.data()!));
  });
}

export function getUserProfileServer(userId: string): Promise<UserProfile | null> {
  return safely("getUserProfileServer", null, async (db) => {
    const snap = await getDoc(doc(db, "users", userId));
    return snap.exists() ? docToUserProfile(snap.id, snap.data()) : null;
  });
}

export function getUserPublicBoardsServer(userId: string): Promise<Board[]> {
  return safely("getUserPublicBoardsServer", [], async (db) => {
    const snap = await runQuery(
      db,
      "boards",
      where("ownerId", "==", userId),
      where("isPublic", "==", true),
      orderBy("createdAt", "desc")
    );
    return snap.docs.map((d) => docToBoard(d.id, d.data()));
  });
}

export function getTrendingTagsServer(limitCount = 15): Promise<Tag[]> {
  return safely("getTrendingTagsServer", [], async (db) => {
    const snap = await runQuery(db, "tags", orderBy("postCount", "desc"), limit(limitCount));
    return snap.docs.map((d) => docToTag(d.data()));
  });
}

export function getAllPublicBoardIdsServer(): Promise<string[]> {
  return safely("getAllPublicBoardIdsServer", [], async (db) => {
    const snap = await runQuery(db, "boards", where("isPublic", "==", true));
    return snap.docs.map((d) => d.id);
  });
}

export function getAllTagNamesServer(): Promise<string[]> {
  return safely("getAllTagNamesServer", [], async (db) => {
    const snap = await runQuery(db, "tags");
    return snap.docs.map((d) => d.data().name as string).filter(Boolean);
  });
}

export function getAllUserIdsServer(): Promise<string[]> {
  return safely("getAllUserIdsServer", [], async (db) => {
    const snap = await runQuery(db, "users");
    return snap.docs.map((d) => d.id);
  });
}
