/**
 * Seed script for Orot
 * Run: npx tsx scripts/seed.ts
 *
 * Uses firebase-admin to bypass Firestore rules.
 * Requires GOOGLE_APPLICATION_CREDENTIALS or Firebase project context.
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// Try to init with default credentials (works with `firebase login` context)
if (getApps().length === 0) {
  initializeApp({ projectId: "orotoo" });
}

const db = getFirestore();

const SEED_USER_ID = "seed-user";
const SEED_USER = {
  displayName: "אורות",
  email: "orot@example.com",
  photoURL: null,
  bio: "ציטוטים והשראה רוחנית מגדולי ההוגים והמורים הרוחניים",
  followerCount: 0,
  followingCount: 0,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

function hoursAgo(h: number): Timestamp {
  return Timestamp.fromMillis(Date.now() - h * 3600000);
}

const SAMPLE_POSTS = [
  // ─── Quotes with images ────────────────────────────────────────────────
  {
    type: "image",
    title: "רומי",
    body: "הפצע הוא המקום שבו האור נכנס אליך.",
    tags: ["רומי", "ריפוי", "אור"],
    author: "ג׳לאל א-דין רומי",
    color: "#F5F0FF",
    mediaURL: "https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=600&h=400&fit=crop",
    createdAt: hoursAgo(168),
  },
  {
    type: "image",
    title: "רבי נחמן מברסלב",
    body: "כל העולם כולו גשר צר מאוד, והעיקר לא לפחד כלל.",
    tags: ["רבי נחמן", "אמונה", "חוכמה"],
    author: "רבי נחמן מברסלב",
    color: "#FFF8F0",
    mediaURL: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    createdAt: hoursAgo(400),
  },
  {
    type: "image",
    title: "בודהה",
    body: "כפי שנר אינו יכול לבעור בלי אש, כך אדם אינו יכול לחיות בלי חיים רוחניים.",
    tags: ["בודהיזם", "רוחניות", "חוכמה"],
    author: "בודהה",
    color: "#FFF8F0",
    mediaURL: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop",
    createdAt: hoursAgo(280),
  },
  {
    type: "image",
    title: "מהטמה גנדי",
    body: "היה השינוי שאתה רוצה לראות בעולם.",
    tags: ["גנדי", "שינוי", "השראה"],
    author: "מהטמה גנדי",
    color: "#F0FFF5",
    mediaURL: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop",
    createdAt: hoursAgo(350),
  },
  {
    type: "image",
    title: "ויקטור פרנקל",
    body: "מי שיש לו למה לחיות, יכול לסבול כמעט כל איך.",
    tags: ["פרנקל", "משמעות", "חוכמה"],
    author: "ויקטור פרנקל",
    color: "#F0F4F8",
    mediaURL: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=400&fit=crop",
    createdAt: hoursAgo(300),
  },
  {
    type: "image",
    title: "הדלאי לאמה",
    body: "היה חמלה בכל מקום שתלך. תן לאף אחד לא לעזוב אותך בלי שירגיש יותר מאושר.",
    tags: ["הדלאי לאמה", "חמלה", "אושר"],
    author: "הדלאי לאמה",
    color: "#F0FFF5",
    mediaURL: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    createdAt: hoursAgo(250),
  },
  {
    type: "image",
    title: "קהלת",
    body: "לכל זמן ועת לכל חפץ תחת השמים. עת ללדת ועת למות, עת לטעת ועת לעקור נטוע.",
    tags: ["קהלת", "חוכמה", "תנ״ך"],
    author: "שלמה המלך",
    color: "#FFFBF0",
    mediaURL: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600&h=400&fit=crop",
    createdAt: hoursAgo(500),
  },
  {
    type: "image",
    title: "הלל הזקן",
    body: "אם אין אני לי, מי לי? וכשאני לעצמי, מה אני? ואם לא עכשיו, אימתי?",
    tags: ["הלל", "חוכמה", "יהדות"],
    author: "הלל הזקן",
    color: "#FFF8F0",
    mediaURL: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=400&fit=crop",
    createdAt: hoursAgo(480),
  },
  {
    type: "image",
    title: "רבינדרנאת טאגור",
    body: "כל ילד שנולד מביא את הבשורה שאלוהים עדיין לא התייאש מבני האדם.",
    tags: ["טאגור", "תקווה", "השראה"],
    author: "רבינדרנאת טאגור",
    color: "#F0FFF5",
    mediaURL: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=400&fit=crop",
    createdAt: hoursAgo(320),
  },
  {
    type: "image",
    title: "רומי",
    body: "אל תהיו עצובים. כל מה שתפסידו חוזר אליכם בדרך אחרת.",
    tags: ["רומי", "תקווה", "אמונה"],
    author: "ג׳לאל א-דין רומי",
    color: "#F5F0FF",
    mediaURL: "https://images.unsplash.com/photo-1500534623283-312aade213eb?w=600&h=400&fit=crop",
    createdAt: hoursAgo(190),
  },

  // ─── Quotes without images ─────────────────────────────────────────────
  {
    type: "quote",
    title: "טיך נאט האן",
    body: "אין דרך אל השלום. השלום הוא הדרך.",
    tags: ["שלום", "חוכמה", "בודהיזם"],
    author: "טיך נאט האן",
    color: "#F0FFF5",
    createdAt: hoursAgo(240),
  },
  {
    type: "quote",
    title: "לאו דזה",
    body: "מסע של אלף מיל מתחיל בצעד אחד.",
    tags: ["חוכמה", "השראה", "טאו"],
    author: "לאו דזה",
    color: "#FFF8F0",
    createdAt: hoursAgo(336),
  },
  {
    type: "quote",
    title: "הרב קוק",
    body: "הישן יתחדש והחדש יתקדש.",
    tags: ["הרב קוק", "חוכמה", "חידוש"],
    author: "הרב אברהם יצחק הכהן קוק",
    color: "#F0FFF5",
    createdAt: hoursAgo(450),
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
    type: "quote",
    title: "מרקוס אורליוס",
    body: "האושר בחייך תלוי באיכות מחשבותיך.",
    tags: ["סטואיות", "חוכמה", "מחשבות"],
    author: "מרקוס אורליוס",
    color: "#F0F4F8",
    createdAt: hoursAgo(380),
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
    type: "quote",
    title: "רבי מנחם מנדל מקוצק",
    body: "אין דבר שלם יותר מלב שבור.",
    tags: ["חסידות", "חוכמה", "ריפוי"],
    author: "רבי מנחם מנדל מקוצק",
    color: "#FFF5F5",
    createdAt: hoursAgo(420),
  },
  {
    type: "quote",
    title: "סנקא",
    body: "לא כי הדברים קשים אנחנו לא מעזים, אלא כי אנחנו לא מעזים — הם קשים.",
    tags: ["סטואיות", "אומץ", "חוכמה"],
    author: "סנקא",
    color: "#F0F4F8",
    createdAt: hoursAgo(360),
  },
  {
    type: "quote",
    title: "הדלאי לאמה",
    body: "אם אתה חושב שאתה קטן מכדי לשנות משהו, נסה לישון עם יתוש בחדר.",
    tags: ["הדלאי לאמה", "שינוי", "הומור"],
    author: "הדלאי לאמה",
    color: "#FFFBF0",
    createdAt: hoursAgo(180),
  },
  {
    type: "quote",
    title: "רומי",
    body: "מעבר לרעיונות של צדק ועוול, יש שדה. אפגוש אותך שם.",
    tags: ["רומי", "אהבה", "אחדות"],
    author: "ג׳לאל א-דין רומי",
    color: "#F5F0FF",
    createdAt: hoursAgo(260),
  },
  {
    type: "quote",
    title: "לאו דזה",
    body: "המים הרכים ביותר מנצחים את הסלע הקשה ביותר. מה שאין לו צורה חודר למה שאין לו פתח.",
    tags: ["טאו", "חוכמה", "טבע"],
    author: "לאו דזה",
    color: "#F0FFF5",
    createdAt: hoursAgo(310),
  },
  {
    type: "quote",
    title: "משלי",
    body: "שומר פיו ולשונו — שומר מצרות נפשו.",
    tags: ["משלי", "חוכמה", "תנ״ך"],
    author: "שלמה המלך",
    color: "#FFF8F0",
    createdAt: hoursAgo(440),
  },

  // ─── Notes — practical spiritual practices ─────────────────────────────
  {
    type: "note",
    title: "נשימת 4-7-8",
    body: "שאפו 4 שניות, החזיקו 7 שניות, נשפו 8 שניות. חזרו 4 פעמים. טכניקה פשוטה להפעלת מערכת העצבים הפרסימפתטית.",
    tags: ["מדיטציה", "נשימה", "טכניקה"],
    author: "ד״ר אנדרו וייל",
    color: "#F0F4F8",
    createdAt: hoursAgo(144),
  },
  {
    type: "note",
    title: "מדיטציית מטא (אהבה חומלת)",
    body: "שבו בנוחות, עצמו עיניים. חזרו בלב:\n\nשאהיה בשלום.\nשאהיה מאושר.\nשאהיה בריא.\nשאחיה בנקל.\n\nהרחיבו את האיחול לאדם אהוב, לאדם ניטרלי, לאדם קשה, ולבסוף — לכל היצורים.",
    tags: ["מדיטציה", "מטא", "חמלה", "תרגול"],
    author: "טיך נאט האן",
    color: "#F0FFF5",
    createdAt: hoursAgo(96),
  },
  {
    type: "note",
    title: "תרגיל הכרת תודה יומי",
    body: "לפני השינה, כתבו שלושה דברים שאתם אסירי תודה עליהם מהיום. לא חייבים להיות דברים גדולים — קפה טוב, חיוך של זר, רגע של שקט. התרגיל הזה מחווט מחדש את המוח לשים לב לטוב.",
    tags: ["הכרת תודה", "תרגול", "מיינדפולנס"],
    author: "ד״ר רוברט אמונס",
    color: "#FFFBF0",
    createdAt: hoursAgo(72),
  },
  {
    type: "note",
    title: "סריקת גוף — 10 דקות",
    body: "שכבו על הגב. התחילו מכפות הרגליים ועלו לאט כלפי מעלה. בכל אזור, שימו לב לתחושות בלי לשפוט — חום, קור, לחץ, קלילות. אם המחשבות נודדות, חזרו בעדינות לגוף. הגיעו עד קודקוד הראש.",
    tags: ["מדיטציה", "סריקת גוף", "תרגול", "מיינדפולנס"],
    author: "ג׳ון קבט-זין",
    color: "#F0F4F8",
    createdAt: hoursAgo(48),
  },

  // ─── More quotes with images ──────────────────────────────────────────
  {
    type: "image",
    title: "הבעל שם טוב",
    body: "תן לי אור, ואני אמצא את דרכי בעצמי.",
    tags: ["חסידות", "אור", "אמונה"],
    author: "רבי ישראל בעל שם טוב",
    color: "#FFF8F0",
    mediaURL: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=600&h=400&fit=crop",
    createdAt: hoursAgo(520),
  },
  {
    type: "image",
    title: "תהילים",
    body: "שיר למעלות. אשא עיני אל ההרים — מאין יבוא עזרי. עזרי מעם ה׳, עושה שמים וארץ.",
    tags: ["תהילים", "תנ״ך", "אמונה", "תפילה"],
    author: "דוד המלך",
    color: "#F0F4F8",
    mediaURL: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&h=400&fit=crop",
    createdAt: hoursAgo(540),
  },
  {
    type: "image",
    title: "רבי קוק — אורות התשובה",
    body: "האדם הגדול ביותר הוא זה שיכול להיות הקטן ביותר. מי שיודע לרדת — יודע לעלות.",
    tags: ["הרב קוק", "ענווה", "תשובה"],
    author: "הרב אברהם יצחק הכהן קוק",
    color: "#F5F0FF",
    mediaURL: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&h=400&fit=crop",
    createdAt: hoursAgo(460),
  },
  {
    type: "image",
    title: "ראם דאס",
    body: "אנחנו כולנו רק הולכים זה את זה הביתה.",
    tags: ["ראם דאס", "קשר", "דרך"],
    author: "ראם דאס",
    color: "#F0FFF5",
    mediaURL: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=600&h=400&fit=crop",
    createdAt: hoursAgo(160),
  },
  {
    type: "image",
    title: "זוהר — פרשת בראשית",
    body: "בשעה שברא הקב״ה את העולם, רצה לגלות את עומק המחשבה, חקק אורות מתוך חושך עליון, וחושך מתוך אור סתום.",
    tags: ["זוהר", "קבלה", "בריאה", "אור"],
    author: "ספר הזוהר",
    color: "#F5F0FF",
    mediaURL: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&h=400&fit=crop",
    createdAt: hoursAgo(600),
  },
  {
    type: "image",
    title: "אוגוסטינוס הקדוש",
    body: "נוצרת אותנו לעצמך, ואין מנוחה ללבנו עד שינוח בך.",
    tags: ["נצרות", "תפילה", "נשמה"],
    author: "אוגוסטינוס",
    color: "#FFF5F5",
    mediaURL: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&h=400&fit=crop",
    createdAt: hoursAgo(550),
  },
  {
    type: "image",
    title: "בהגוואד גיטא",
    body: "לנשמה אין לידה ואין מוות. היא לא חדלה מלהתקיים. היא לא נולדת, לא מתה, לא הייתה ולא תחדל. היא נצחית, קדומה, תמידית.",
    tags: ["הינדואיזם", "נשמה", "נצח", "גיטא"],
    author: "בהגוואד גיטא",
    color: "#FFFBF0",
    mediaURL: "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=600&h=400&fit=crop",
    createdAt: hoursAgo(580),
  },
  {
    type: "image",
    title: "מייסטר אקהרט",
    body: "אם הדבר היחיד שתגיד בתפילה שלך הוא ׳תודה׳ — זה יספיק.",
    tags: ["מיסטיקה", "תפילה", "הכרת תודה"],
    author: "מייסטר אקהרט",
    color: "#FFF8F0",
    mediaURL: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=600&h=400&fit=crop",
    createdAt: hoursAgo(410),
  },

  // ─── More text quotes ─────────────────────────────────────────────────
  {
    type: "quote",
    title: "רבי נחמן — ליקוטי מוהר״ן",
    body: "דע, שהאדם צריך לעבור על גשר צר מאוד — והכלל והעיקר שלא יתפחד כלל. כי הפחד עצמו הוא הגשר הצר.",
    tags: ["רבי נחמן", "פחד", "אמונה", "חסידות"],
    author: "רבי נחמן מברסלב",
    color: "#FFF8F0",
    createdAt: hoursAgo(130),
  },
  {
    type: "quote",
    title: "עמוס עוז",
    body: "כל אדם הוא אי שלם. כל בני האדם הם ארכיפלג. כל אדם שואף להתחבר לאיים האחרים, ולעולם אינו מצליח עד הסוף.",
    tags: ["קשר", "בדידות", "אנושיות"],
    author: "עמוס עוז",
    color: "#F0F4F8",
    createdAt: hoursAgo(110),
  },
  {
    type: "quote",
    title: "רבי מנחם מנדל שניאורסון",
    body: "אל תסתכל על הכלי — הסתכל מה יש בתוכו. בכל אדם יש ניצוץ אלוקי, ולפעמים הוא מוסתר מתחת לשכבות. התפקיד שלך — לגלות אותו.",
    tags: ["חב״ד", "ניצוץ", "אהבת ישראל"],
    author: "הרבי מלובביץ׳",
    color: "#F5F0FF",
    createdAt: hoursAgo(390),
  },
  {
    type: "quote",
    title: "פרקי אבות",
    body: "הוא היה אומר: אל תסתכל בקנקן אלא במה שיש בו. יש קנקן חדש מלא ישן, וישן שאפילו חדש אין בו.",
    tags: ["פרקי אבות", "חוכמה", "משנה"],
    author: "רבי מאיר",
    color: "#FFF8F0",
    createdAt: hoursAgo(470),
  },
  {
    type: "quote",
    title: "ואצלב האוול",
    body: "התקווה היא לא הסכמה שהדברים יסתדרו. התקווה היא ההכרה שלמשהו יש משמעות, לא משנה איך זה ייגמר.",
    tags: ["תקווה", "משמעות", "השראה"],
    author: "ואצלב האוול",
    color: "#F0FFF5",
    createdAt: hoursAgo(270),
  },
  {
    type: "quote",
    title: "טארא בראך",
    body: "הרגע הזה — בדיוק כמו שהוא — מושלם. לא בגלל שהוא נעים או נוח, אלא בגלל שהוא אמיתי.",
    tags: ["מיינדפולנס", "נוכחות", "קבלה"],
    author: "טארא בראך",
    color: "#F5F0FF",
    createdAt: hoursAgo(100),
  },
  {
    type: "quote",
    title: "שאנטידוה",
    body: "כל האושר שיש בעולם בא מהרצון שאחרים יהיו מאושרים. כל הסבל שיש בעולם בא מהרצון שאני אהיה מאושר.",
    tags: ["בודהיזם", "חמלה", "אושר", "אלטרואיזם"],
    author: "שאנטידוה",
    color: "#F0FFF5",
    createdAt: hoursAgo(340),
  },
  {
    type: "quote",
    title: "ישעיהו",
    body: "הנה אל ישועתי, אבטח ולא אפחד. כי עוזי וזמרת יה ה׳, ויהי לי לישועה.",
    tags: ["ישעיהו", "תנ״ך", "אמונה", "גבורה"],
    author: "ישעיהו הנביא",
    color: "#FFFBF0",
    createdAt: hoursAgo(510),
  },
  {
    type: "quote",
    title: "ג׳ידו קרישנמורטי",
    body: "אין מידה של בריאות בלהיות מותאם היטב לחברה חולה עמוקות.",
    tags: ["מודעות", "חברה", "חוכמה"],
    author: "ג׳ידו קרישנמורטי",
    color: "#F0F4F8",
    createdAt: hoursAgo(290),
  },
  {
    type: "quote",
    title: "סוזוקי רושי",
    body: "בליבו של המתחיל יש אפשרויות רבות. בליבו של המומחה — מעטות.",
    tags: ["זן", "מתחילים", "פתיחות"],
    author: "שונריו סוזוקי",
    color: "#F0FFF5",
    createdAt: hoursAgo(230),
  },
  {
    type: "quote",
    title: "חאפיז",
    body: "גם אחרי כל הזמן הזה, השמש מעולם לא אמרה לארץ: ׳את חייבת לי.׳ תראו מה אהבה כזו עושה — היא מאירה את כל השמים.",
    tags: ["חאפיז", "אהבה", "סופיות", "אור"],
    author: "חאפיז",
    color: "#FFFBF0",
    createdAt: hoursAgo(370),
  },
];

async function deleteCollection(collectionName: string) {
  const snapshot = await db.collection(collectionName).get();
  if (snapshot.empty) return 0;
  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  return snapshot.size;
}

async function seed() {
  console.log("🌱 Seeding Orot database...\n");

  // Clean existing data
  const deletedPosts = await deleteCollection("posts");
  const deletedTags = await deleteCollection("tags");
  const deletedBoardItems = await deleteCollection("boardItems");
  const deletedBoards = await deleteCollection("boards");
  console.log(`🧹 Cleaned ${deletedPosts} posts, ${deletedTags} tags, ${deletedBoards} boards, ${deletedBoardItems} boardItems\n`);

  // Create main board for seed user
  const mainBoardRef = db.collection("boards").doc();
  const mainBoardId = mainBoardRef.id;
  await mainBoardRef.set({
    name: "האוסף שלי",
    description: "הלוח הראשי שלי",
    color: "#C17B4A",
    ownerId: SEED_USER_ID,
    ownerName: "אורות",
    ownerPhotoURL: null,
    isPublic: true,
    likeCount: 0,
    followerCount: 0,
    postCount: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  console.log("✅ Created main board for seed user");

  // Create seed user with mainBoardId
  await db.collection("users").doc(SEED_USER_ID).set({
    ...SEED_USER,
    mainBoardId,
    tagline: "ציטוטים והשראה רוחנית",
    coverImageURL: null,
    socialLinks: [],
    pinnedBoardIds: [],
  });
  console.log("✅ Created seed user");

  // Collect all tags
  const tagCounts: Record<string, number> = {};
  const postIds: string[] = [];

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
      mediaType: post.mediaURL ? "image" : null,
      likeCount: 0,
      saveCount: 0,
      boardCount: 1,
      sourceURL: null,
      sourceType: null,
      createdAt: post.createdAt,
      updatedAt: post.createdAt,
    };

    const postRef = await db.collection("posts").add(postData);
    postIds.push(postRef.id);
    console.log(`  📝 ${post.title} — ${post.author}`);

    for (const tag of post.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  // Add all posts to the main board
  console.log("\n📋 Adding posts to main board...");
  for (const postId of postIds) {
    await db.collection("boardItems").add({
      boardId: mainBoardId,
      postId,
      addedBy: SEED_USER_ID,
      addedAt: Timestamp.now(),
    });
  }
  // Update board post count
  await mainBoardRef.update({ postCount: postIds.length });
  console.log(`✅ Added ${postIds.length} posts to main board`);

  // Create tags
  for (const [name, count] of Object.entries(tagCounts)) {
    await db.collection("tags").doc(name.toLowerCase()).set({
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
