/**
 * One-off migration: remove the legacy `email` field from every public user profile.
 * Emails stay in Firebase Auth only.
 * Run: npx tsx scripts/remove-user-emails.ts          (dry run — counts only)
 *      npx tsx scripts/remove-user-emails.ts --apply  (actually deletes the field)
 */

import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

if (getApps().length === 0) {
  initializeApp({ projectId: "orotoo" });
}

const db = getFirestore();
const apply = process.argv.includes("--apply");

async function main() {
  const snap = await db.collection("users").get();
  const withEmail = snap.docs.filter((d) => d.get("email") !== undefined);
  console.log(`${snap.size} profiles, ${withEmail.length} still have an email field.`);

  if (!apply) {
    console.log("Dry run. Re-run with --apply to remove the field.");
    return;
  }

  for (let i = 0; i < withEmail.length; i += 400) {
    const batch = db.batch();
    withEmail.slice(i, i + 400).forEach((d) => batch.update(d.ref, { email: FieldValue.delete() }));
    await batch.commit();
    console.log(`  cleaned ${Math.min(i + 400, withEmail.length)}/${withEmail.length}`);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
