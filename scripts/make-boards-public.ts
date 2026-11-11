/**
 * One-off migration: every board becomes public (the site keeps no private content).
 * Run: npx tsx scripts/make-boards-public.ts          (dry run — lists the boards)
 *      npx tsx scripts/make-boards-public.ts --apply  (actually updates them)
 */

import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
  initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID ?? "orotoo" });
}

const db = getFirestore();
const apply = process.argv.includes("--apply");

async function main() {
  const snap = await db.collection("boards").get();
  const privateBoards = snap.docs.filter((d) => d.get("isPublic") !== true);
  console.log(`${snap.size} boards, ${privateBoards.length} not public:`);
  privateBoards.forEach((d) => console.log(`  ${d.id}  "${d.get("name")}"  owner=${d.get("ownerName")}  items=${d.get("itemCount") ?? 0}`));

  if (!apply) {
    console.log("Dry run. Re-run with --apply to make them public.");
    return;
  }

  for (let i = 0; i < privateBoards.length; i += 400) {
    const batch = db.batch();
    privateBoards.slice(i, i + 400).forEach((d) => batch.update(d.ref, { isPublic: true }));
    await batch.commit();
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
