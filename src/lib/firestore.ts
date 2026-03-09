import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  increment,
  Timestamp,
  DocumentSnapshot,
  QueryConstraint,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile, Post, Board, BoardItem, Tag } from "./types";

// ─── Users ────────────────────────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", userId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as UserProfile;
}

export async function updateUserProfile(userId: string, data: Partial<Omit<UserProfile, "id">>) {
  await updateDoc(doc(db, "users", userId), { ...data, updatedAt: Timestamp.now() });
}

// ─── Posts ────────────────────────────────────────────────────────────────

export function subscribeToPosts(
  callback: (posts: Post[]) => void,
  options?: { tag?: string; authorId?: string; limitCount?: number }
) {
  const constraints: QueryConstraint[] = [];

  if (options?.authorId) {
    constraints.push(where("authorId", "==", options.authorId));
  }
  if (options?.tag) {
    constraints.push(where("tags", "array-contains", options.tag));
  }

  constraints.push(orderBy("createdAt", "desc"));

  if (options?.limitCount) {
    constraints.push(limit(options.limitCount));
  }

  const q = query(collection(db, "posts"), ...constraints);

  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Post);
    callback(posts);
  });
}

export async function getPostsPaginated(
  lastDoc?: DocumentSnapshot,
  pageSize = 20,
  tag?: string
): Promise<{ posts: Post[]; lastDoc: DocumentSnapshot | null }> {
  const constraints: QueryConstraint[] = [];

  if (tag) {
    constraints.push(where("tags", "array-contains", tag));
  }

  constraints.push(orderBy("createdAt", "desc"));

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  constraints.push(limit(pageSize));

  const q = query(collection(db, "posts"), ...constraints);
  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Post);
  const last = snapshot.docs[snapshot.docs.length - 1] || null;

  return { posts, lastDoc: last };
}

export async function getPost(postId: string): Promise<Post | null> {
  const snap = await getDoc(doc(db, "posts", postId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Post;
}

export async function createPost(data: Omit<Post, "id" | "createdAt" | "updatedAt" | "likeCount" | "saveCount">) {
  const postData = {
    ...data,
    likeCount: 0,
    saveCount: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, "posts"), postData);

  // Update tag counts
  if (data.tags.length > 0) {
    const batch = writeBatch(db);
    for (const tag of data.tags) {
      const tagRef = doc(db, "tags", tag.toLowerCase());
      batch.set(tagRef, {
        name: tag,
        postCount: increment(1),
        lastUsedAt: Timestamp.now(),
      }, { merge: true });
    }
    await batch.commit();
  }

  return docRef.id;
}

export async function deletePost(postId: string) {
  await deleteDoc(doc(db, "posts", postId));
}

// ─── Likes ────────────────────────────────────────────────────────────────

export async function toggleLike(postId: string, userId: string): Promise<boolean> {
  const q = query(
    collection(db, "likes"),
    where("postId", "==", postId),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);

  if (snap.empty) {
    await addDoc(collection(db, "likes"), {
      postId,
      userId,
      createdAt: Timestamp.now(),
    });
    await updateDoc(doc(db, "posts", postId), { likeCount: increment(1) });
    return true;
  } else {
    await deleteDoc(snap.docs[0].ref);
    await updateDoc(doc(db, "posts", postId), { likeCount: increment(-1) });
    return false;
  }
}

export async function getUserLikedPostIds(userId: string): Promise<Set<string>> {
  const q = query(collection(db, "likes"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return new Set(snap.docs.map((d) => d.data().postId));
}

// ─── Saves ────────────────────────────────────────────────────────────────

export async function toggleSave(postId: string, userId: string): Promise<boolean> {
  const q = query(
    collection(db, "saves"),
    where("postId", "==", postId),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);

  if (snap.empty) {
    await addDoc(collection(db, "saves"), {
      postId,
      userId,
      createdAt: Timestamp.now(),
    });
    await updateDoc(doc(db, "posts", postId), { saveCount: increment(1) });
    return true;
  } else {
    await deleteDoc(snap.docs[0].ref);
    await updateDoc(doc(db, "posts", postId), { saveCount: increment(-1) });
    return false;
  }
}

export async function getUserSavedPostIds(userId: string): Promise<Set<string>> {
  const q = query(collection(db, "saves"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return new Set(snap.docs.map((d) => d.data().postId));
}

export async function getUserSavedPosts(userId: string): Promise<Post[]> {
  const q = query(
    collection(db, "saves"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  const postIds = snap.docs.map((d) => d.data().postId);

  const posts: Post[] = [];
  for (const id of postIds) {
    const post = await getPost(id);
    if (post) posts.push(post);
  }
  return posts;
}

// ─── Boards ───────────────────────────────────────────────────────────────

export async function createBoard(data: Omit<Board, "id" | "createdAt" | "updatedAt" | "itemCount" | "coverImageURL">) {
  const boardData = {
    ...data,
    itemCount: 0,
    coverImageURL: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  const docRef = await addDoc(collection(db, "boards"), boardData);
  return docRef.id;
}

export async function getUserBoards(userId: string): Promise<Board[]> {
  const q = query(
    collection(db, "boards"),
    where("ownerId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Board);
}

export async function getBoard(boardId: string): Promise<Board | null> {
  const snap = await getDoc(doc(db, "boards", boardId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Board;
}

export async function updateBoard(boardId: string, data: Partial<Omit<Board, "id">>) {
  await updateDoc(doc(db, "boards", boardId), { ...data, updatedAt: Timestamp.now() });
}

export async function deleteBoard(boardId: string) {
  // Delete all board items first
  const q = query(collection(db, "boardItems"), where("boardId", "==", boardId));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, "boards", boardId));
  await batch.commit();
}

export async function addToBoard(boardId: string, postId: string, userId: string) {
  // Check if already in board
  const q = query(
    collection(db, "boardItems"),
    where("boardId", "==", boardId),
    where("postId", "==", postId)
  );
  const existing = await getDocs(q);
  if (!existing.empty) return;

  await addDoc(collection(db, "boardItems"), {
    boardId,
    postId,
    addedBy: userId,
    addedAt: Timestamp.now(),
  });
  await updateDoc(doc(db, "boards", boardId), { itemCount: increment(1) });
}

export async function removeFromBoard(boardId: string, postId: string) {
  const q = query(
    collection(db, "boardItems"),
    where("boardId", "==", boardId),
    where("postId", "==", postId)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    await deleteDoc(snap.docs[0].ref);
    await updateDoc(doc(db, "boards", boardId), { itemCount: increment(-1) });
  }
}

export async function getBoardPosts(boardId: string): Promise<Post[]> {
  const q = query(
    collection(db, "boardItems"),
    where("boardId", "==", boardId),
    orderBy("addedAt", "desc")
  );
  const snap = await getDocs(q);
  const posts: Post[] = [];
  for (const d of snap.docs) {
    const post = await getPost(d.data().postId);
    if (post) posts.push(post);
  }
  return posts;
}

export async function getBoardItemPostIds(boardId: string): Promise<Set<string>> {
  const q = query(collection(db, "boardItems"), where("boardId", "==", boardId));
  const snap = await getDocs(q);
  return new Set(snap.docs.map((d) => d.data().postId));
}

// ─── Tags ─────────────────────────────────────────────────────────────────

export async function searchTags(prefix: string, maxResults = 10): Promise<Tag[]> {
  const q = query(
    collection(db, "tags"),
    where("name", ">=", prefix),
    where("name", "<=", prefix + "\uf8ff"),
    orderBy("name"),
    limit(maxResults)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Tag);
}

export async function getTrendingTags(maxResults = 15): Promise<Tag[]> {
  const q = query(
    collection(db, "tags"),
    orderBy("postCount", "desc"),
    limit(maxResults)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Tag);
}

// ─── Stats ────────────────────────────────────────────────────────────────

export async function getFeedStats(): Promise<{ postCount: number; newCount: number; boardCount: number; totalLikes: number }> {
  const postsSnap = await getDocs(collection(db, "posts"));
  const boardsSnap = await getDocs(collection(db, "boards"));

  let totalLikes = 0;
  let newCount = 0;
  const oneDayAgo = Date.now() - 86400000;

  postsSnap.docs.forEach((d) => {
    const data = d.data();
    totalLikes += data.likeCount || 0;
    if (data.createdAt?.toMillis() > oneDayAgo) newCount++;
  });

  return {
    postCount: postsSnap.size,
    newCount,
    boardCount: boardsSnap.size,
    totalLikes,
  };
}
