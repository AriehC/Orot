/**
 * Security-rules checks for profiles and concept pages, run against the local emulators.
 * Run: npm run emulators   (in another terminal)
 *      npm run test:rules
 */

import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, Auth } from "firebase/auth";
import {
  getFirestore, connectFirestoreEmulator, doc, setDoc, updateDoc, getDoc, getDocs, query, collection, where,
  deleteField, deleteDoc, writeBatch, Timestamp, increment, Firestore,
} from "firebase/firestore";

const PROJECT = "demo-orot";
let failures = 0;

async function expectOk(name: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failures++;
    console.log(`  ✗ ${name} — expected success, got: ${(err as Error).message}`);
  }
}

async function expectDenied(name: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    failures++;
    console.log(`  ✗ ${name} — expected PERMISSION_DENIED, but it succeeded`);
  } catch (err) {
    const msg = (err as Error).message;
    const code = (err as { code?: string }).code ?? "";
    if (/permission/i.test(msg) || code === "permission-denied") console.log(`  ✓ ${name}`);
    else {
      failures++;
      console.log(`  ✗ ${name} — unexpected error: ${code} ${msg}`);
    }
  }
}

async function client(label: string): Promise<{ auth: Auth; db: Firestore; uid: string; close: () => Promise<void> }> {
  const app = initializeApp({ apiKey: "demo-key", projectId: PROJECT }, label);
  const auth = getAuth(app);
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  const db = getFirestore(app);
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  const cred = await createUserWithEmailAndPassword(auth, `${label}-${Date.now()}@example.test`, "test-pass-123");
  return { auth, db, uid: cred.user.uid, close: () => deleteApp(app) };
}

function profile(extra: Record<string, unknown> = {}) {
  return {
    displayName: "בודק",
    photoURL: null,
    bio: "",
    followerCount: 0,
    followingCount: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    ...extra,
  };
}

async function main() {
  const a = await client("alice");
  const b = await client("bob");

  console.log("Profiles — email must never be stored publicly");
  await expectDenied("create profile with email", () => setDoc(doc(a.db, "users", a.uid), profile({ email: "x@example.test" })));
  await expectOk("create profile without email", () => setDoc(doc(a.db, "users", a.uid), profile()));
  await expectDenied("add email to existing profile", () => updateDoc(doc(a.db, "users", a.uid), { email: "x@example.test" }));
  await expectOk("normal profile edit (with email: deleteField())", () =>
    updateDoc(doc(a.db, "users", a.uid), { bio: "שלום", email: deleteField(), updatedAt: Timestamp.now() }));
  await expectDenied("edit someone else's profile", () => updateDoc(doc(b.db, "users", a.uid), { bio: "פריצה" }));

  console.log("Concept pages — shared wiki editing");
  const concept = (uid: string, extra: Record<string, unknown> = {}) => ({
    name: "בדיקת מושג",
    description: "תיאור עם [[אהבה]]",
    aliases: ["כינוי"],
    related: ["אהבה"],
    links: ["אהבה"],
    postCount: increment(0),
    updatedBy: uid,
    updatedByName: "בודק",
    updatedAt: Timestamp.now(),
    ...extra,
  });
  await expectOk("signed-in user creates a concept page", () => setDoc(doc(a.db, "tags", "בדיקת מושג"), concept(a.uid), { merge: true }));
  await expectOk("another user edits it (wiki)", () => setDoc(doc(b.db, "tags", "בדיקת מושג"), concept(b.uid, { description: "גרסה של בוב" }), { merge: true }));
  await expectDenied("edit while claiming to be someone else", () =>
    setDoc(doc(b.db, "tags", "בדיקת מושג"), concept(a.uid, { description: "התחזות" }), { merge: true }));
  await expectOk("post counter bump keeps someone else's attribution", () =>
    updateDoc(doc(a.db, "tags", "בדיקת מושג"), { postCount: increment(1) }));
  await expectDenied("description over 3000 chars", () =>
    setDoc(doc(a.db, "tags", "בדיקת מושג"), concept(a.uid, { description: "א".repeat(3001) }), { merge: true }));
  await expectDenied("more than 10 aliases", () =>
    setDoc(doc(a.db, "tags", "בדיקת מושג"), concept(a.uid, { aliases: Array.from({ length: 11 }, (_, i) => `a${i}`) }), { merge: true }));
  const snap = await getDoc(doc(a.db, "tags", "בדיקת מושג"));
  if (snap.get("description") !== "גרסה של בוב" || snap.get("updatedBy") !== b.uid) {
    failures++;
    console.log("  ✗ stored concept does not match the last allowed edit");
  } else console.log("  ✓ stored concept reflects the last allowed edit");

  console.log("Posts — [[ ]] links list");
  const post = (uid: string, links: string[]) => ({
    type: "note", title: "פוסט", body: "", authorId: uid, authorName: "בודק", authorPhotoURL: null,
    tags: [], links, color: null, mediaURL: null, thumbnailURL: null, mediaType: null,
    likeCount: 0, saveCount: 0, boardCount: 0, commentCount: 0, sourceURL: null, sourceType: null,
    createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  });
  await expectOk("post with links", () => setDoc(doc(a.db, "posts", `rules-ok-${a.uid}`), post(a.uid, ["אהבה"])));
  await expectDenied("post with more than 50 links", () =>
    setDoc(doc(a.db, "posts", `rules-bad-${a.uid}`), post(a.uid, Array.from({ length: 51 }, (_, i) => `l${i}`))));

  console.log("Comments & notifications");
  const postId = `rules-ok-${a.uid}`;
  await expectOk("comment on a post", () =>
    setDoc(doc(b.db, "comments", `c-${b.uid}`), { postId, authorId: b.uid, authorName: "בוב", authorPhotoURL: null, body: "יפה", createdAt: Timestamp.now() }));
  await expectDenied("comment as someone else", () =>
    setDoc(doc(b.db, "comments", `c2-${b.uid}`), { postId, authorId: a.uid, authorName: "x", authorPhotoURL: null, body: "x", createdAt: Timestamp.now() }));
  await expectOk("non-author bumps commentCount", () => updateDoc(doc(b.db, "posts", postId), { commentCount: increment(1) }));
  const notif = { recipientId: a.uid, type: "comment", actorId: b.uid, actorName: "בוב", actorPhotoURL: null,
    postId, postTitle: "פוסט", boardId: null, boardName: null, read: false, createdAt: Timestamp.now() };
  await expectOk("notify the post author", () => setDoc(doc(b.db, "notifications", `n-${b.uid}`), notif));
  await expectDenied("forge a notification from someone else", () =>
    setDoc(doc(b.db, "notifications", `n2-${b.uid}`), { ...notif, actorId: a.uid, recipientId: b.uid }));
  await expectOk("recipient reads it", () => getDoc(doc(a.db, "notifications", `n-${b.uid}`)));
  await expectDenied("someone else reads it", () => getDoc(doc(b.db, "notifications", `n-${b.uid}`)));
  await expectOk("recipient marks it read", () => updateDoc(doc(a.db, "notifications", `n-${b.uid}`), { read: true }));
  await expectDenied("recipient rewrites its content", () => updateDoc(doc(a.db, "notifications", `n-${b.uid}`), { actorName: "זיוף" }));

  console.log("Following users");
  await setDoc(doc(b.db, "users", b.uid), profile());
  const followId = `f-${b.uid}`;
  await expectOk("follow a user", () =>
    setDoc(doc(b.db, "userFollows", followId), { followerId: b.uid, followingId: a.uid, createdAt: Timestamp.now() }));
  await expectDenied("follow on someone else's behalf", () =>
    setDoc(doc(b.db, "userFollows", `f2-${b.uid}`), { followerId: a.uid, followingId: b.uid, createdAt: Timestamp.now() }));
  await expectDenied("follow yourself", () =>
    setDoc(doc(b.db, "userFollows", `f3-${b.uid}`), { followerId: b.uid, followingId: b.uid, createdAt: Timestamp.now() }));
  await expectOk("both counters move by one (batch)", () => {
    const batch = writeBatch(b.db);
    batch.update(doc(b.db, "users", a.uid), { followerCount: increment(1) });
    batch.update(doc(b.db, "users", b.uid), { followingCount: increment(1) });
    return batch.commit();
  });
  await expectDenied("inflate someone's follower count", () => updateDoc(doc(b.db, "users", a.uid), { followerCount: increment(50) }));
  await expectDenied("edit someone's bio via the counter path", () =>
    updateDoc(doc(b.db, "users", a.uid), { followerCount: increment(1), bio: "פריצה" }));
  await expectOk("profile edit still works after being followed", () =>
    updateDoc(doc(a.db, "users", a.uid), { bio: "עדכון", email: deleteField(), updatedAt: Timestamp.now() }));
  await expectOk("followed user removes the relationship", () => deleteDoc(doc(a.db, "userFollows", followId)));

  console.log("Boards");
  const boardId = `board-${a.uid}`;
  const board = (uid: string, isPublic: boolean) => ({
    name: "לוח", description: "", color: "#C17B4A", ownerId: uid, ownerName: "בודק", ownerPhotoURL: null,
    isPublic, itemCount: 0, likeCount: 0, followerCount: 0, coverImageURL: null,
    createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  });
  await expectOk("create a public board", () => setDoc(doc(a.db, "boards", boardId), board(a.uid, true)));
  await expectDenied("create a private board", () => setDoc(doc(a.db, "boards", `private-${a.uid}`), board(a.uid, false)));
  await expectDenied("make a board private", () => updateDoc(doc(a.db, "boards", boardId), { isPublic: false }));
  await expectOk("owner adds a post to the board", () =>
    setDoc(doc(a.db, "boardItems", `bi-${a.uid}`), { boardId, postId, addedBy: a.uid, addedAt: Timestamp.now() }));
  await expectDenied("add a post to someone else's board", () =>
    setDoc(doc(b.db, "boardItems", `bi-${b.uid}`), { boardId, postId, addedBy: b.uid, addedAt: Timestamp.now() }));
  await expectOk("logged-out visitor reads the board and its items", async () => {
    const anonApp = initializeApp({ apiKey: "demo-key", projectId: PROJECT }, `anon-${Date.now()}`);
    const anonDb = getFirestore(anonApp);
    connectFirestoreEmulator(anonDb, "127.0.0.1", 8080);
    try {
      await getDoc(doc(anonDb, "boards", boardId));
      const items = await getDocs(query(collection(anonDb, "boardItems"), where("boardId", "==", boardId)));
      if (items.size !== 1) throw new Error(`expected 1 board item, got ${items.size}`);
    } finally {
      await deleteApp(anonApp);
    }
  });
  await expectOk("like a board", () =>
    setDoc(doc(b.db, "boardLikes", `bl-${b.uid}`), { boardId, userId: b.uid, createdAt: Timestamp.now() }));
  await expectOk("non-owner bumps board likeCount", () => updateDoc(doc(b.db, "boards", boardId), { likeCount: increment(1) }));
  await expectOk("follow a board", () =>
    setDoc(doc(b.db, "boardFollows", `bf-${b.uid}`), { boardId, userId: b.uid, createdAt: Timestamp.now() }));
  await expectOk("non-owner bumps board followerCount", () => updateDoc(doc(b.db, "boards", boardId), { followerCount: increment(1) }));
  await expectDenied("non-owner renames the board", () => updateDoc(doc(b.db, "boards", boardId), { name: "פריצה" }));
  await expectDenied("non-owner inflates board likes", () => updateDoc(doc(b.db, "boards", boardId), { likeCount: increment(10) }));
  await expectOk("board owner clears others' likes and follows (board deletion)", () => {
    const batch = writeBatch(a.db);
    batch.delete(doc(a.db, "boardLikes", `bl-${b.uid}`));
    batch.delete(doc(a.db, "boardFollows", `bf-${b.uid}`));
    return batch.commit();
  });

  console.log("Deleting a post that others interacted with");
  const likeIds = Array.from({ length: 25 }, (_, i) => `like-${b.uid}-${i}`);
  for (const id of likeIds) await setDoc(doc(b.db, "likes", id), { postId, userId: b.uid, createdAt: Timestamp.now() });
  await setDoc(doc(b.db, "saves", `s-${b.uid}`), { postId, userId: b.uid, createdAt: Timestamp.now() });
  await expectDenied("a stranger deletes someone's like", async () => {
    const c = await client("carol");
    try { await deleteDoc(doc(c.db, "likes", likeIds[0])); } finally { await c.close(); }
  });
  await expectOk("post author clears 25 likes in one batch", () => {
    const batch = writeBatch(a.db);
    likeIds.forEach((id) => batch.delete(doc(a.db, "likes", id)));
    return batch.commit();
  });
  await expectOk("post author clears saves and comments", () => {
    const batch = writeBatch(a.db);
    batch.delete(doc(a.db, "saves", `s-${b.uid}`));
    batch.delete(doc(a.db, "comments", `c-${b.uid}`));
    return batch.commit();
  });
  await expectOk("post author removes the post from boards", () => deleteDoc(doc(a.db, "boardItems", `bi-${a.uid}`)));

  await a.close();
  await b.close();
  console.log(failures === 0 ? "\nAll rules checks passed." : `\n${failures} rules check(s) failed.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
