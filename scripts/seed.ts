/**
 * Seed script for Orot
 * Run: npx tsx scripts/seed.ts
 *
 * Requires .env.local to be configured with Firebase credentials.
 * Creates sample posts and tags in Firestore.
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, setDoc, Timestamp } from "firebase/firestore";

// Load env vars
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
const SEED_USER = {
  displayName: "אורות",
  email: "orot@example.com",
  photoURL: null,
  bio: "תוכן לדוגמה לפלטפורמת אורות",
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

function hoursAgo(h: number): Timestamp {
  return Timestamp.fromMillis(Date.now() - h * 3600000);
}

const SAMPLE_POSTS = [
  {
    type: "note",
    title: "כל נשמה ומסעה",
    body: "לעיתים קשה לספוק, כל נשמה ומסלולה. אין תחרות באמת — רק צריך להקשיב.",
    tags: ["חוכמה", "נשמה"],
    author: "נועה",
    likes: 234,
    color: "#FFF8F0",
    createdAt: hoursAgo(72),
  },
  {
    type: "quote",
    title: "רומי",
    body: "הפצע הוא המקום שבו האור נכנס אליך.",
    tags: ["רומי", "ריפוי", "אור"],
    author: "רומי",
    likes: 892,
    color: "#F5F0FF",
    createdAt: hoursAgo(168),
  },
  {
    type: "image",
    title: "זריחה מהרי הגולן",
    body: "כל בוקר הוא הזדמנות חדשה לראות את העולם מחדש. הטבע מזכיר לנו שתמיד יש אור מעבר לחושך.",
    tags: ["טבע", "זריחה", "השראה"],
    author: "אלון",
    likes: 567,
    color: "#F0FFF5",
    mediaURL: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
    createdAt: hoursAgo(48),
  },
  {
    type: "note",
    title: "תרגול יצירת תודה",
    body: "כל ערב לפני השינה, כתבו 3 דברים שאתם מסודרי תודה עליהם. זה משנה את החיים תוך 21 יום.",
    tags: ["תודה", "תרגול", "הרגלים"],
    author: "דנה",
    likes: 445,
    color: "#FFFBF0",
    createdAt: hoursAgo(5),
    isNew: true,
  },
  {
    type: "video",
    title: "מדיטציות בוקר — 10 דקות",
    body: "מדיטציה מודרכת להתחלת היום. נשימות עמוקות, הרפיה, ומודעות נעימה.",
    tags: ["מדיטציה", "בוקר", "נשימה"],
    author: "שרון על השביל",
    likes: 1203,
    color: "#F0F4F8",
    mediaURL: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop",
    createdAt: hoursAgo(120),
  },
  {
    type: "note",
    title: "שחררו את מה שלא שלכם",
    body: "לא כל מחשבה שעולה היא שלך. למדו להיות נוכחים בלי להיצמד לכל רעש פנימי.",
    tags: ["מיינדפולנס", "גוף ונפש"],
    author: "מאירה",
    likes: 178,
    color: "#FFF5F5",
    createdAt: hoursAgo(2),
    isNew: true,
  },
  {
    type: "image",
    title: "מנדלה של שלום פנימי",
    body: "ציורי מנדלות כמו מדיטציה בפני עצמה. התיקדמות והיפנוס הדרגתי שמרגיע את הנפש.",
    tags: ["ריפוי", "אומנות", "מנדלה"],
    author: "תמר",
    likes: 334,
    color: "#F5F0FF",
    mediaURL: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=300&fit=crop",
    createdAt: hoursAgo(96),
  },
  {
    type: "quote",
    title: "טיך נאט האן",
    body: "אין דרך אל השלום. השלום הוא הדרך.",
    tags: ["שלום", "חוכמה", "בודהיזם"],
    author: "טיך נאט האן",
    likes: 1456,
    color: "#F0FFF5",
    createdAt: hoursAgo(240),
  },
  {
    type: "note",
    title: "נשימת 4-7-8",
    body: "שאפו 4 שניות, החזיקו 7 שניות, נשפו 8 שניות. חזרו 4 פעמים. טכניקה פשוטה להפעלת מערכת העצבים הפרסימפתטית.",
    tags: ["מדיטציה", "נשימה", "טכניקה"],
    author: "ד״ר אנדרו וייל",
    likes: 723,
    color: "#F0F4F8",
    createdAt: hoursAgo(144),
  },
  {
    type: "note",
    title: "אהבה ללא תנאי",
    body: "אהבה אמיתית לא דורשת שינוי מהאחר. היא פשוטה להיות, כמו נהר שזורם בלי מאמץ.",
    tags: ["אהבה", "זוגיות"],
    author: "גיל",
    likes: 289,
    color: "#FFF5F5",
    createdAt: hoursAgo(1),
    isNew: true,
  },
  {
    type: "image",
    title: "היער הקסום",
    body: "הליכה ביער היא כטיפול נפשי. העצים מלמדים אותנו על שורשים ועל צמיחה.",
    tags: ["טבע", "יער", "ריפוי"],
    author: "נוי",
    likes: 412,
    color: "#F0FFF5",
    mediaURL: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=300&fit=crop",
    createdAt: hoursAgo(192),
  },
  {
    type: "video",
    title: "צלילי טיבט — קערות שירה",
    body: "30 דקות של צלילים קדושים לריפוי עמוק ומדיטציה.",
    tags: ["ריפוי", "מוזיקה", "טיבט"],
    author: "Sound Healing IL",
    likes: 876,
    color: "#FFFBF0",
    mediaURL: "https://images.unsplash.com/photo-1591710668263-80ff87939530?w=400&h=250&fit=crop",
    createdAt: hoursAgo(72),
  },
  {
    type: "quote",
    title: "לאו דזה",
    body: "מסע של אלף מיל מתחיל בצעד אחד.",
    tags: ["חוכמה", "השראה", "טאו"],
    author: "לאו דזה",
    likes: 2100,
    color: "#FFF8F0",
    createdAt: hoursAgo(336),
  },
  {
    type: "note",
    title: "כוח הסליחה",
    body: "סליחה אינה מתנה לאחר. היא שחרור של עצמך מכעס ומעוול. כשאתם סולחים, אתם מתרפאים.",
    tags: ["ריפוי", "סליחה", "גוף ונפש"],
    author: "נעמי",
    likes: 198,
    color: "#F5F0FF",
    createdAt: hoursAgo(2),
    isNew: true,
  },
  {
    type: "note",
    title: "תן תודה על הרגעים",
    body: "תרגלו להוסיף את מה שישנו שטוב. תנו תודה על הפשטות — ריקוד, גשם, או פשוט נשימה שקטה.",
    tags: ["תודה", "מיינדפולנס"],
    author: "רוי",
    likes: 345,
    color: "#F0F4F8",
    createdAt: hoursAgo(24),
  },
];

async function seed() {
  console.log("🌱 Seeding Orot database...\n");

  // Create seed user
  await setDoc(doc(db, "users", SEED_USER_ID), SEED_USER);
  console.log("✅ Created seed user");

  // Collect all tags
  const tagCounts: Record<string, number> = {};

  // Create posts
  for (const post of SAMPLE_POSTS) {
    const postData = {
      type: post.type,
      title: post.title,
      body: post.body,
      authorId: SEED_USER_ID,
      authorName: post.author,
      authorPhotoURL: null,
      tags: post.tags,
      color: post.color,
      mediaURL: post.mediaURL || null,
      thumbnailURL: post.mediaURL || null,
      mediaType: post.mediaURL ? (post.type === "video" ? "video" : "image") : null,
      likeCount: post.likes,
      saveCount: 0,
      createdAt: post.createdAt,
      updatedAt: post.createdAt,
    };

    await addDoc(collection(db, "posts"), postData);
    console.log(`  📝 Created: ${post.title}`);

    for (const tag of post.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  // Create tags
  for (const [name, count] of Object.entries(tagCounts)) {
    await setDoc(doc(db, "tags", name.toLowerCase()), {
      name,
      postCount: count,
      lastUsedAt: Timestamp.now(),
    });
  }
  console.log(`\n✅ Created ${Object.keys(tagCounts).length} tags`);

  console.log(`\n🎉 Seeding complete! ${SAMPLE_POSTS.length} posts created.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
