/**
 * One-time migration: reset fake likes on seed posts + add new posts
 * Run: npx tsx scripts/reset-likes-and-add-posts.ts
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, addDoc, doc, setDoc, getDocs,
  query, where, updateDoc, Timestamp, writeBatch,
} from "firebase/firestore";

import { config } from "dotenv";
config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SEED_USER_ID = "seed-user";

function hoursAgo(h: number): Timestamp {
  return Timestamp.fromMillis(Date.now() - h * 3600000);
}

const NEW_POSTS = [
  {
    type: "quote",
    title: "רבי נחמן מברסלב",
    body: "כל העולם כולו גשר צר מאוד, והעיקר לא לפחד כלל.",
    tags: ["רבי נחמן", "אמונה", "חוכמה"],
    author: "רבי נחמן מברסלב",
    color: "#FFF8F0",
    createdAt: hoursAgo(400),
  },
  {
    type: "note",
    title: "המפתח לנוכחות",
    body: "הגוף תמיד בהווה. כשהמחשבות רצות לעבר או לעתיד, חזרו לגוף — הרגישו את כפות הרגליים על הרצפה, את הנשימה בחזה. זה כל מה שצריך.",
    tags: ["מיינדפולנס", "נוכחות", "תרגול"],
    author: "יעל",
    color: "#F0F4F8",
    createdAt: hoursAgo(36),
  },
  {
    type: "quote",
    title: "הרב קוק",
    body: "הישן יתחדש והחדש יתקדש.",
    tags: ["הרב קוק", "חוכמה", "חידוש"],
    author: "הרב אברהם יצחק הכהן קוק",
    color: "#F0FFF5",
    createdAt: hoursAgo(500),
  },
  {
    type: "note",
    title: "על שקט פנימי",
    body: "השקט הוא לא היעדר רעש. הוא נוכחות של שלום. אפשר למצוא אותו גם באמצע עיר סואנת, אם יודעים לאן לפנות בפנים.",
    tags: ["שקט", "שלום", "מדיטציה"],
    author: "עמית",
    color: "#F5F0FF",
    createdAt: hoursAgo(60),
  },
  {
    type: "image",
    title: "ים של שלווה",
    body: "לשבת על חוף הים ולהקשיב לגלים. כל גל מביא ולוקח, כמו מחשבות שבאות והולכות.",
    tags: ["טבע", "ים", "שלווה"],
    author: "ליאור",
    color: "#F0F4F8",
    mediaURL: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=250&fit=crop",
    createdAt: hoursAgo(80),
  },
  {
    type: "note",
    title: "חמש דקות של דממה",
    body: "נסו מחר בבוקר: לפני שאתם בודקים את הטלפון, שבו 5 דקות בשקט. בלי מוזיקה, בלי פודקאסט. רק אתם והבוקר. תתפלאו מה יקרה.",
    tags: ["תרגול", "בוקר", "דממה"],
    author: "מיכל",
    color: "#FFFBF0",
    createdAt: hoursAgo(8),
  },
  {
    type: "quote",
    title: "בודהה",
    body: "כפי שנר אינו יכול לבעור בלי אש, כך אדם אינו יכול לחיות בלי חיים רוחניים.",
    tags: ["בודהיזם", "רוחניות", "חוכמה"],
    author: "בודהה",
    color: "#FFF8F0",
    createdAt: hoursAgo(280),
  },
  {
    type: "note",
    title: "הכוח של ״לא יודע״",
    body: "אנחנו רגילים להרגיש שצריך לדעת הכל, לשלוט בהכל. אבל יש חופש עצום במילים ״אני לא יודע״. הן פותחות דלת לסקרנות, לגילוי, ולהפתעה.",
    tags: ["חוכמה", "ענווה", "גילוי"],
    author: "אורי",
    color: "#FFF5F5",
    createdAt: hoursAgo(18),
  },
  {
    type: "image",
    title: "אור בין העצים",
    body: "כשהאור חודר בין הענפים, מתגלה שגם בתוך החושך יש נתיב. תמיד יש נתיב.",
    tags: ["טבע", "אור", "תקווה"],
    author: "שירה",
    color: "#F0FFF5",
    mediaURL: "https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=400&h=300&fit=crop",
    createdAt: hoursAgo(130),
  },
  {
    type: "note",
    title: "מדיטציית הליכה",
    body: "לא חייבים לשבת בשקט. צאו להליכה איטית — הרגישו כל צעד, הריחו את האוויר, הקשיבו לצפורים. זו מדיטציה בתנועה.",
    tags: ["מדיטציה", "הליכה", "טבע"],
    author: "נורית",
    color: "#F0FFF5",
    createdAt: hoursAgo(14),
  },
  {
    type: "quote",
    title: "פאולו קואלו",
    body: "כשאתה רוצה משהו, כל היקום קושר קשר כדי לעזור לך להגשים את זה.",
    tags: ["השראה", "חלומות", "יקום"],
    author: "פאולו קואלו",
    color: "#FFFBF0",
    createdAt: hoursAgo(200),
  },
  {
    type: "note",
    title: "הגוף זוכר",
    body: "מתח בכתפיים, כאב בבטן, לחץ בלסת — הגוף שומר את מה שהנפש לא מעבדת. תנו לו לדבר. יוגה, ריקוד, או סתם רעידה חופשית — תנו לגוף לשחרר.",
    tags: ["גוף ונפש", "ריפוי", "יוגה"],
    author: "הדר",
    color: "#FFF5F5",
    createdAt: hoursAgo(42),
  },
  {
    type: "note",
    title: "כתיבה אינטואיטיבית",
    body: "קחו דף ועט. כתבו 10 דקות בלי לעצור, בלי לחשוב, בלי לתקן. תנו ליד לכתוב מה שהלב רוצה. תתפלאו מה יצוף.",
    tags: ["תרגול", "כתיבה", "אינטואיציה"],
    author: "רונית",
    color: "#F5F0FF",
    createdAt: hoursAgo(26),
  },
  {
    type: "quote",
    title: "מרקוס אורליוס",
    body: "האושר בחייך תלוי באיכות מחשבותיך.",
    tags: ["סטואיות", "חוכמה", "מחשבות"],
    author: "מרקוס אורליוס",
    color: "#F0F4F8",
    createdAt: hoursAgo(350),
  },
  {
    type: "image",
    title: "שביל ההרים",
    body: "הדרך לפסגה לא תמיד ישרה. יש עיקולים, מדרונות, ורגעי עצירה. אבל הנוף מהפסגה שווה כל צעד.",
    tags: ["טבע", "דרך", "השראה"],
    author: "איתי",
    color: "#FFF8F0",
    mediaURL: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop",
    createdAt: hoursAgo(160),
  },
  {
    type: "note",
    title: "חיבוק של 20 שניות",
    body: "מחקרים מראים שחיבוק של 20 שניות משחרר אוקסיטוצין ומוריד קורטיזול. חבקו מישהו היום — באמת, לא חטוף.",
    tags: ["אהבה", "גוף ונפש", "מדע"],
    author: "דפנה",
    color: "#FFF5F5",
    createdAt: hoursAgo(6),
  },
  {
    type: "quote",
    title: "אקהרט טולה",
    body: "מה שאתם חושבים שאתם צריכים כדי להיות מאושרים — זה מה שמונע מכם להיות מאושרים עכשיו.",
    tags: ["נוכחות", "אושר", "חוכמה"],
    author: "אקהרט טולה",
    color: "#F5F0FF",
    createdAt: hoursAgo(220),
  },
  {
    type: "note",
    title: "שלושה שערים",
    body: "לפני שאתם אומרים משהו, העבירו את המילים דרך שלושה שערים: האם זה אמיתי? האם זה הכרחי? האם זה מלא חסד?",
    tags: ["חוכמה", "תקשורת", "סופיות"],
    author: "אמירה",
    color: "#FFFBF0",
    createdAt: hoursAgo(50),
  },
];

async function run() {
  // 1. Reset likeCount on all seed-user posts
  console.log("Resetting likes on existing seed posts...\n");
  const q = query(collection(db, "posts"), where("authorId", "==", SEED_USER_ID));
  const snap = await getDocs(q);

  let resetCount = 0;
  for (const d of snap.docs) {
    const data = d.data();
    if (data.likeCount > 0) {
      await updateDoc(d.ref, { likeCount: 0 });
      console.log(`  Reset likes: ${data.title}`);
      resetCount++;
    }
  }
  console.log(`\nReset ${resetCount} posts\n`);

  // 2. Also delete any fake like documents for seed posts
  const likesSnap = await getDocs(collection(db, "likes"));
  const seedPostIds = new Set(snap.docs.map((d) => d.id));
  let deletedLikes = 0;
  const batch = writeBatch(db);
  for (const likeDoc of likesSnap.docs) {
    if (seedPostIds.has(likeDoc.data().postId)) {
      batch.delete(likeDoc.ref);
      deletedLikes++;
    }
  }
  if (deletedLikes > 0) {
    await batch.commit();
    console.log(`Deleted ${deletedLikes} fake like documents\n`);
  }

  // 3. Add new posts
  console.log("Adding new posts...\n");
  const tagCounts: Record<string, number> = {};

  for (const post of NEW_POSTS) {
    const postData = {
      type: post.type,
      title: post.title,
      body: post.body,
      authorId: SEED_USER_ID,
      authorName: post.author,
      authorPhotoURL: null,
      tags: post.tags,
      color: post.color,
      mediaURL: (post as any).mediaURL || null,
      thumbnailURL: (post as any).mediaURL || null,
      mediaType: (post as any).mediaURL ? (post.type === "video" ? "video" : "image") : null,
      likeCount: 0,
      saveCount: 0,
      boardCount: 0,
      createdAt: post.createdAt,
      updatedAt: post.createdAt,
    };

    await addDoc(collection(db, "posts"), postData);
    console.log(`  + ${post.title}`);

    for (const tag of post.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  // 4. Update tag counts
  for (const [name, count] of Object.entries(tagCounts)) {
    await setDoc(doc(db, "tags", name.toLowerCase()), {
      name,
      postCount: count,
      lastUsedAt: Timestamp.now(),
    }, { merge: true });
  }

  console.log(`\nAdded ${NEW_POSTS.length} new posts with ${Object.keys(tagCounts).length} tags`);
  process.exit(0);
}

run().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
