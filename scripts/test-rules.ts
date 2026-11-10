/**
 * Security-rules checks for profiles and concept pages, run against the local emulators.
 * Run: npm run emulators   (in another terminal)
 *      npm run test:rules
 */

import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, Auth } from "firebase/auth";
import {
  getFirestore, connectFirestoreEmulator, doc, setDoc, updateDoc, getDoc,
  deleteField, Timestamp, increment, Firestore,
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

  await a.close();
  await b.close();
  console.log(failures === 0 ? "\nAll rules checks passed." : `\n${failures} rules check(s) failed.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
