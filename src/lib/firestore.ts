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
  FirestoreError,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "./firebase";
import { deleteMedia } from "./storage";
import { UserProfile, Post, Board, BoardItem, Tag } from "./types";

// ─── Users ────────────────────────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, "users", userId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      ...data,
      id: snap.id,
      followerCount: data.followerCount ?? 0,
      followingCount: data.followingCount ?? 0,
      mainBoardId: data.mainBoardId ?? null,
      tagline: data.tagline ?? "",
      coverImageURL: data.coverImageURL ?? null,
      socialLinks: data.socialLinks ?? [],
      pinnedBoardIds: data.pinnedBoardIds ?? [],
    } as UserProfile;
  } catch (error) {
    console.error("getUserProfile failed:", error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, data: Partial<Omit<UserProfile, "id">>) {
  try {
    await updateDoc(doc(db, "users", userId), { ...data, updatedAt: Timestamp.now() });
  } catch (error) {
    console.error("updateUserProfile failed:", error);
    throw error;
  }
}

export async function deleteUserAccount(userId: string) {
  try {
    // Delete all user's posts (each one cascade-deletes its own relations)
    const postsSnap = await getDocs(
      query(collection(db, "posts"), where("authorId", "==", userId))
    );
    for (const d of postsSnap.docs) {
      await deletePost(d.id);
    }

    // Delete all user's boards (each one cascade-deletes its own relations)
    const boardsSnap = await getDocs(
      query(collection(db, "boards"), where("ownerId", "==", userId))
    );
    for (const d of boardsSnap.docs) {
      await deleteBoard(d.id);
    }

    // Helper: commit batched operations in chunks of 249 pairs (each pair = delete + update = 2 ops, max 498)
    async function batchDeleteWithDecrement(
      snapDocs: typeof likesSnap.docs,
      targetCollection: string,
      idField: string,
      countField: string
    ) {
      const CHUNK_SIZE = 249;
      for (let i = 0; i < snapDocs.length; i += CHUNK_SIZE) {
        const chunk = snapDocs.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach((d) => {
          batch.delete(d.ref);
          batch.update(doc(db, targetCollection, d.data()[idField]), { [countField]: increment(-1) });
        });
        await batch.commit();
      }
    }

    // Delete user's likes on other posts and decrement likeCount
    const likesSnap = await getDocs(
      query(collection(db, "likes"), where("userId", "==", userId))
    );
    if (!likesSnap.empty) {
      await batchDeleteWithDecrement(likesSnap.docs, "posts", "postId", "likeCount");
    }

    // Delete user's saves on other posts and decrement saveCount
    const savesSnap = await getDocs(
      query(collection(db, "saves"), where("userId", "==", userId))
    );
    if (!savesSnap.empty) {
      await batchDeleteWithDecrement(savesSnap.docs, "posts", "postId", "saveCount");
    }

    // Delete user's board likes and decrement board likeCount
    const boardLikesSnap = await getDocs(
      query(collection(db, "boardLikes"), where("userId", "==", userId))
    );
    if (!boardLikesSnap.empty) {
      await batchDeleteWithDecrement(boardLikesSnap.docs, "boards", "boardId", "likeCount");
    }

    // Delete user's board follows and decrement board followerCount
    const boardFollowsSnap = await getDocs(
      query(collection(db, "boardFollows"), where("userId", "==", userId))
    );
    if (!boardFollowsSnap.empty) {
      await batchDeleteWithDecrement(boardFollowsSnap.docs, "boards", "boardId", "followerCount");
    }

    // Delete user follow relationships (both directions) and update counts
    const followingSnap = await getDocs(
      query(collection(db, "userFollows"), where("followerId", "==", userId))
    );
    if (!followingSnap.empty) {
      await batchDeleteWithDecrement(followingSnap.docs, "users", "followingId", "followerCount");
    }

    const followersSnap = await getDocs(
      query(collection(db, "userFollows"), where("followingId", "==", userId))
    );
    if (!followersSnap.empty) {
      await batchDeleteWithDecrement(followersSnap.docs, "users", "followerId", "followingCount");
    }

    // Delete the user profile document
    await deleteDoc(doc(db, "users", userId));
  } catch (error) {
    console.error("deleteUserAccount failed:", error);
    throw error;
  }
}

export async function getUserPostCount(userId: string): Promise<number> {
  try {
    const q = query(collection(db, "posts"), where("authorId", "==", userId));
    const snap = await getCountFromServer(q);
    return snap.data().count;
  } catch (error) {
    console.error("getUserPostCount failed:", error);
    return 0;
  }
}

// ─── Posts ────────────────────────────────────────────────────────────────

export function subscribeToPosts(
  callback: (posts: Post[]) => void,
  options?: { tag?: string; authorId?: string; limitCount?: number },
  onError?: (error: FirestoreError) => void
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

  return onSnapshot(
    q,
    (snapshot) => {
      const posts = snapshot.docs.map((d) => ({
        id: d.id,
        boardCount: 0,
        ...d.data(),
      }) as Post);
      callback(posts);
    },
    (error) => {
      console.error("subscribeToPosts listener error:", error);
      if (onError) {
        onError(error);
      }
    }
  );
}

export async function getPostsPaginated(
  lastDoc?: DocumentSnapshot,
  pageSize = 20,
  tag?: string
): Promise<{ posts: Post[]; lastDoc: DocumentSnapshot | null }> {
  try {
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
    const posts = snapshot.docs.map((d) => ({
      id: d.id,
      boardCount: 0,
      ...d.data(),
    }) as Post);
    const last = snapshot.docs[snapshot.docs.length - 1] || null;

    return { posts, lastDoc: last };
  } catch (error) {
    console.error("getPostsPaginated failed:", error);
    throw error;
  }
}

export async function getPost(postId: string): Promise<Post | null> {
  try {
    const snap = await getDoc(doc(db, "posts", postId));
    if (!snap.exists()) return null;
    return { id: snap.id, boardCount: 0, ...snap.data() } as Post;
  } catch (error) {
    console.error("getPost failed:", error);
    throw error;
  }
}

export async function createPost(data: Omit<Post, "id" | "createdAt" | "updatedAt" | "likeCount" | "saveCount" | "boardCount">) {
  try {
    const postData = {
      ...data,
      likeCount: 0,
      saveCount: 0,
      boardCount: 0,
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
  } catch (error) {
    console.error("createPost failed:", error);
    throw error;
  }
}

export async function updatePost(
  postId: string,
  data: Partial<Pick<Post, "title" | "body" | "tags" | "color" | "type">>
) {
  try {
    await updateDoc(doc(db, "posts", postId), { ...data, updatedAt: Timestamp.now() });
  } catch (error) {
    console.error("updatePost failed:", error);
    throw error;
  }
}

export async function deletePost(postId: string) {
  try {
    // Read the post first to get its tags
    const postSnap = await getDoc(doc(db, "posts", postId));
    const postData = postSnap.exists() ? postSnap.data() : null;

    // Delete all board items referencing this post and decrement board itemCounts
    const boardItemsSnap = await getDocs(
      query(collection(db, "boardItems"), where("postId", "==", postId))
    );
    if (!boardItemsSnap.empty) {
      const batch = writeBatch(db);
      boardItemsSnap.docs.forEach((d) => {
        batch.delete(d.ref);
        batch.update(doc(db, "boards", d.data().boardId), { itemCount: increment(-1) });
      });
      await batch.commit();
    }

    // Delete all likes for this post
    const likesSnap = await getDocs(
      query(collection(db, "likes"), where("postId", "==", postId))
    );
    if (!likesSnap.empty) {
      const batch = writeBatch(db);
      likesSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    // Delete all saves for this post
    const savesSnap = await getDocs(
      query(collection(db, "saves"), where("postId", "==", postId))
    );
    if (!savesSnap.empty) {
      const batch = writeBatch(db);
      savesSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    // Decrement tag counts
    if (postData && postData.tags?.length > 0) {
      const batch = writeBatch(db);
      for (const tag of postData.tags as string[]) {
        const tagRef = doc(db, "tags", tag.toLowerCase());
        batch.update(tagRef, { postCount: increment(-1) });
      }
      await batch.commit();
    }

    // Delete media from storage
    if (postData?.mediaURL) {
      await deleteMedia(postData.mediaURL);
    }
    if (postData?.thumbnailURL && postData.thumbnailURL !== postData.mediaURL) {
      await deleteMedia(postData.thumbnailURL);
    }

    // Delete the post itself
    await deleteDoc(doc(db, "posts", postId));
  } catch (error) {
    console.error("deletePost failed:", error);
    throw error;
  }
}

// ─── Likes ────────────────────────────────────────────────────────────────

export async function toggleLike(postId: string, userId: string): Promise<boolean> {
  try {
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
  } catch (error) {
    console.error("toggleLike failed:", error);
    throw error;
  }
}

export async function getUserLikedPostIds(userId: string): Promise<Set<string>> {
  try {
    const q = query(collection(db, "likes"), where("userId", "==", userId));
    const snap = await getDocs(q);
    return new Set(snap.docs.map((d) => d.data().postId));
  } catch (error) {
    console.error("getUserLikedPostIds failed:", error);
    throw error;
  }
}

// ─── Saves ────────────────────────────────────────────────────────────────

export async function toggleSave(postId: string, userId: string): Promise<boolean> {
  try {
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
  } catch (error) {
    console.error("toggleSave failed:", error);
    throw error;
  }
}

export async function getUserSavedPostIds(userId: string): Promise<Set<string>> {
  try {
    const q = query(collection(db, "saves"), where("userId", "==", userId));
    const snap = await getDocs(q);
    return new Set(snap.docs.map((d) => d.data().postId));
  } catch (error) {
    console.error("getUserSavedPostIds failed:", error);
    throw error;
  }
}

export async function getUserSavedPosts(userId: string): Promise<Post[]> {
  try {
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
  } catch (error) {
    console.error("getUserSavedPosts failed:", error);
    throw error;
  }
}

// ─── Boards ───────────────────────────────────────────────────────────────

export async function createBoard(
  data: Omit<Board, "id" | "createdAt" | "updatedAt" | "itemCount" | "coverImageURL" | "likeCount" | "followerCount">
): Promise<string> {
  try {
    const boardData = {
      ...data,
      itemCount: 0,
      likeCount: 0,
      followerCount: 0,
      coverImageURL: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, "boards"), boardData);
    return docRef.id;
  } catch (error) {
    console.error("createBoard failed:", error);
    throw error;
  }
}

export async function getUserBoards(userId: string, publicOnly = false): Promise<Board[]> {
  try {
    const constraints: QueryConstraint[] = [
      where("ownerId", "==", userId),
    ];
    if (publicOnly) {
      constraints.push(where("isPublic", "==", true));
    }
    constraints.push(orderBy("createdAt", "desc"));

    const q = query(collection(db, "boards"), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      likeCount: 0,
      followerCount: 0,
      ownerName: "",
      ownerPhotoURL: null,
      ...d.data(),
    }) as Board);
  } catch (error) {
    console.error("getUserBoards failed:", error);
    throw error;
  }
}

export async function getBoard(boardId: string): Promise<Board | null> {
  try {
    const snap = await getDoc(doc(db, "boards", boardId));
    if (!snap.exists()) return null;
    return {
      id: snap.id,
      likeCount: 0,
      followerCount: 0,
      ownerName: "",
      ownerPhotoURL: null,
      ...snap.data(),
    } as Board;
  } catch (error) {
    console.error("getBoard failed:", error);
    throw error;
  }
}

export async function updateBoard(boardId: string, data: Partial<Omit<Board, "id">>) {
  try {
    await updateDoc(doc(db, "boards", boardId), { ...data, updatedAt: Timestamp.now() });
  } catch (error) {
    console.error("updateBoard failed:", error);
    throw error;
  }
}

export async function deleteBoard(boardId: string) {
  try {
    // Delete board items and decrement post boardCounts
    const itemsSnap = await getDocs(
      query(collection(db, "boardItems"), where("boardId", "==", boardId))
    );
    if (!itemsSnap.empty) {
      const batch = writeBatch(db);
      itemsSnap.docs.forEach((d) => {
        batch.delete(d.ref);
        batch.update(doc(db, "posts", d.data().postId), { boardCount: increment(-1) });
      });
      await batch.commit();
    }

    // Delete board likes
    const likesSnap = await getDocs(
      query(collection(db, "boardLikes"), where("boardId", "==", boardId))
    );
    if (!likesSnap.empty) {
      const batch = writeBatch(db);
      likesSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    // Delete board follows
    const followsSnap = await getDocs(
      query(collection(db, "boardFollows"), where("boardId", "==", boardId))
    );
    if (!followsSnap.empty) {
      const batch = writeBatch(db);
      followsSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    // Delete the board itself
    await deleteDoc(doc(db, "boards", boardId));
  } catch (error) {
    console.error("deleteBoard failed:", error);
    throw error;
  }
}

export async function addToBoard(boardId: string, postId: string, userId: string) {
  try {
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

    const batch = writeBatch(db);
    batch.update(doc(db, "boards", boardId), { itemCount: increment(1), updatedAt: Timestamp.now() });
    batch.update(doc(db, "posts", postId), { boardCount: increment(1) });
    await batch.commit();
  } catch (error) {
    console.error("addToBoard failed:", error);
    throw error;
  }
}

export async function removeFromBoard(boardId: string, postId: string) {
  try {
    const q = query(
      collection(db, "boardItems"),
      where("boardId", "==", boardId),
      where("postId", "==", postId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const batch = writeBatch(db);
      batch.delete(snap.docs[0].ref);
      batch.update(doc(db, "boards", boardId), { itemCount: increment(-1), updatedAt: Timestamp.now() });
      batch.update(doc(db, "posts", postId), { boardCount: increment(-1) });
      await batch.commit();
    }
  } catch (error) {
    console.error("removeFromBoard failed:", error);
    throw error;
  }
}

export async function getBoardPosts(boardId: string): Promise<Post[]> {
  try {
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
  } catch (error) {
    console.error("getBoardPosts failed:", error);
    throw error;
  }
}

export async function getBoardItemPostIds(boardId: string): Promise<Set<string>> {
  try {
    const q = query(collection(db, "boardItems"), where("boardId", "==", boardId));
    const snap = await getDocs(q);
    return new Set(snap.docs.map((d) => d.data().postId));
  } catch (error) {
    console.error("getBoardItemPostIds failed:", error);
    throw error;
  }
}

// ─── Board Likes ──────────────────────────────────────────────────────────

export async function toggleBoardLike(boardId: string, userId: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, "boardLikes"),
      where("boardId", "==", boardId),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      await addDoc(collection(db, "boardLikes"), {
        boardId,
        userId,
        createdAt: Timestamp.now(),
      });
      await updateDoc(doc(db, "boards", boardId), { likeCount: increment(1) });
      return true;
    } else {
      await deleteDoc(snap.docs[0].ref);
      await updateDoc(doc(db, "boards", boardId), { likeCount: increment(-1) });
      return false;
    }
  } catch (error) {
    console.error("toggleBoardLike failed:", error);
    throw error;
  }
}

export async function getUserLikedBoardIds(userId: string): Promise<Set<string>> {
  try {
    const q = query(collection(db, "boardLikes"), where("userId", "==", userId));
    const snap = await getDocs(q);
    return new Set(snap.docs.map((d) => d.data().boardId));
  } catch (error) {
    console.error("getUserLikedBoardIds failed:", error);
    throw error;
  }
}

// ─── Board Follows ────────────────────────────────────────────────────────

export async function toggleBoardFollow(boardId: string, userId: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, "boardFollows"),
      where("boardId", "==", boardId),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      await addDoc(collection(db, "boardFollows"), {
        boardId,
        userId,
        createdAt: Timestamp.now(),
      });
      await updateDoc(doc(db, "boards", boardId), { followerCount: increment(1) });
      return true;
    } else {
      await deleteDoc(snap.docs[0].ref);
      await updateDoc(doc(db, "boards", boardId), { followerCount: increment(-1) });
      return false;
    }
  } catch (error) {
    console.error("toggleBoardFollow failed:", error);
    throw error;
  }
}

export async function getUserFollowedBoardIds(userId: string): Promise<Set<string>> {
  try {
    const q = query(collection(db, "boardFollows"), where("userId", "==", userId));
    const snap = await getDocs(q);
    return new Set(snap.docs.map((d) => d.data().boardId));
  } catch (error) {
    console.error("getUserFollowedBoardIds failed:", error);
    throw error;
  }
}

// ─── User Follows ─────────────────────────────────────────────────────────

export async function toggleUserFollow(targetUserId: string, followerId: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, "userFollows"),
      where("followingId", "==", targetUserId),
      where("followerId", "==", followerId)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      await addDoc(collection(db, "userFollows"), {
        followingId: targetUserId,
        followerId,
        createdAt: Timestamp.now(),
      });
      const batch = writeBatch(db);
      batch.update(doc(db, "users", targetUserId), { followerCount: increment(1) });
      batch.update(doc(db, "users", followerId), { followingCount: increment(1) });
      await batch.commit();
      return true;
    } else {
      await deleteDoc(snap.docs[0].ref);
      const batch = writeBatch(db);
      batch.update(doc(db, "users", targetUserId), { followerCount: increment(-1) });
      batch.update(doc(db, "users", followerId), { followingCount: increment(-1) });
      await batch.commit();
      return false;
    }
  } catch (error) {
    console.error("toggleUserFollow failed:", error);
    throw error;
  }
}

export async function isFollowingUser(targetUserId: string, followerId: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, "userFollows"),
      where("followingId", "==", targetUserId),
      where("followerId", "==", followerId)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (error) {
    console.error("isFollowingUser failed:", error);
    throw error;
  }
}

// ─── Public Boards ────────────────────────────────────────────────────────

export async function getPublicBoards(sortBy: "popular" | "recent" = "popular", limitCount = 20): Promise<Board[]> {
  try {
    const constraints: QueryConstraint[] = [
      where("isPublic", "==", true),
    ];

    if (sortBy === "popular") {
      constraints.push(orderBy("followerCount", "desc"));
    } else {
      constraints.push(orderBy("createdAt", "desc"));
    }

    constraints.push(limit(limitCount));

    const q = query(collection(db, "boards"), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      likeCount: 0,
      followerCount: 0,
      ownerName: "",
      ownerPhotoURL: null,
      ...d.data(),
    }) as Board);
  } catch (error) {
    console.error("getPublicBoards failed:", error);
    throw error;
  }
}

export async function getPublicBoardsContainingPost(postId: string): Promise<Board[]> {
  try {
    const q = query(
      collection(db, "boardItems"),
      where("postId", "==", postId)
    );
    const snap = await getDocs(q);
    const boardIds = [...new Set(snap.docs.map((d) => d.data().boardId))];

    const boards: Board[] = [];
    for (const boardId of boardIds) {
      const board = await getBoard(boardId);
      if (board && board.isPublic) boards.push(board);
    }
    return boards;
  } catch (error) {
    console.error("getPublicBoardsContainingPost failed:", error);
    throw error;
  }
}

// ─── Tags ─────────────────────────────────────────────────────────────────

export async function searchTags(prefix: string, maxResults = 10): Promise<Tag[]> {
  try {
    const q = query(
      collection(db, "tags"),
      where("name", ">=", prefix),
      where("name", "<=", prefix + "\uf8ff"),
      orderBy("name"),
      limit(maxResults)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Tag);
  } catch (error) {
    console.error("searchTags failed:", error);
    throw error;
  }
}

export async function getTrendingTags(maxResults = 15): Promise<Tag[]> {
  try {
    const q = query(
      collection(db, "tags"),
      orderBy("postCount", "desc"),
      limit(maxResults)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Tag);
  } catch (error) {
    console.error("getTrendingTags failed:", error);
    throw error;
  }
}

// ─── Stats ────────────────────────────────────────────────────────────────

export async function getFeedStats(): Promise<{ postCount: number; newCount: number; boardCount: number; totalLikes: number }> {
  try {
    const [postCountSnap, boardCountSnap] = await Promise.all([
      getCountFromServer(collection(db, "posts")),
      getCountFromServer(query(collection(db, "boards"), where("isPublic", "==", true))),
    ]);

    // For newCount and totalLikes we still need to read documents
    // but limit to recent posts for efficiency
    const oneDayAgo = Timestamp.fromMillis(Date.now() - 86400000);
    const recentSnap = await getDocs(
      query(collection(db, "posts"), where("createdAt", ">", oneDayAgo))
    );

    // Get totalLikes from a sample — read all posts but only extract likeCount
    const postsSnap = await getDocs(collection(db, "posts"));
    let totalLikes = 0;
    postsSnap.docs.forEach((d) => {
      totalLikes += d.data().likeCount || 0;
    });

    return {
      postCount: postCountSnap.data().count,
      newCount: recentSnap.size,
      boardCount: boardCountSnap.data().count,
      totalLikes,
    };
  } catch (error) {
    console.error("getFeedStats failed:", error);
    throw error;
  }
}

// ─── Discovery ─────────────────────────────────────────────────────────────

export async function getRandomPost(excludeIds?: Set<string>): Promise<Post | null> {
  try {
    const snap = await getDocs(query(collection(db, "posts"), limit(50)));
    const posts = snap.docs
      .map((d) => ({ id: d.id, boardCount: 0, ...d.data() } as Post))
      .filter((p) => !excludeIds || !excludeIds.has(p.id));
    if (posts.length === 0) return null;
    return posts[Math.floor(Math.random() * posts.length)];
  } catch (error) {
    console.error("getRandomPost failed:", error);
    throw error;
  }
}
