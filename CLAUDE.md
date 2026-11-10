# Orot (אורות)

Hebrew RTL spiritual inspiration app — Google Keep meets spiritual wellness.
Next.js 16 + Firebase (Auth/Firestore/Storage) + TypeScript strict + CSS Modules. No Tailwind.

## Commands

```
npm run dev        # dev server
npm run build      # production build (MUST pass before deploy)
firebase deploy    # full deploy: hosting + rules + indexes → orotoo.web.app
npm run seed       # seed Firestore with sample data

# Local testing against Firebase emulators (needs JDK 21+; never touches the real project)
npm run emulators       # auth + firestore + storage emulators, project demo-orot
npm run seed:emulators  # seed the emulators
npm run dev:emulators   # app on :3001 wired to the emulators (.env.emulators)
npm run test:rules      # security-rules checks against the emulator
```

## Module Map

| Path | Owns |
|------|------|
| `src/app/` | Pages — App Router. Routes: `/`, `/auth/login`, `/auth/register`, `/create`, `/profile/[userId]`, `/boards`, `/boards/[boardId]`, `/tags/[tagName]` |
| `src/components/` | UI grouped by feature: `feed/`, `content/`, `boards/`, `profile/`, `auth/`, `ui/`, `layout/` |
| `src/lib/firebase.ts` | Firebase init — guards missing env with `isFirebaseConfigured` boolean |
| `src/lib/firestore.ts` | ALL Firestore CRUD — real-time subscriptions, pagination, queries |
| `src/lib/storage.ts` | Firebase Storage uploads |
| `src/lib/types.ts` | ALL TypeScript interfaces: Post, Board, UserProfile, Like, Save, Tag, etc. |
| `src/lib/ranking.ts` | Feed ranking algorithm |
| `src/hooks/` | One hook per concern: useFeed, useLike, useSave, useBoards, useTags, useBoardLike, useBoardFollow, useUserFollow |
| `src/contexts/` | AuthContext (user + profile + auth methods), ThemeContext (dark mode) |
| `src/lib/wikilinks.ts` | `[[concept]]` parsing, `normalizeConcept` (doc ids for tags) |
| `src/components/concepts/` | WikiText/WikiLink (links + hover preview), ConceptGraph (local graph), ConceptEditModal |
| `scripts/seed.ts` | Firestore seed script (uses firebase-admin) |
| `scripts/test-rules.ts` | Security-rules checks (run against emulators) |
| `scripts/remove-user-emails.ts` | One-off: strip legacy `email` from public profiles (`--apply`) |

## Rules

- **UI in Hebrew, code in English**
- **RTL always** — use CSS logical properties (`padding-inline-start` not `padding-left`, `margin-inline-end` not `margin-right`)
- **`'use client'`** on any component that is interactive or uses Firebase client SDK
- **CSS Modules** co-located with components. Design tokens live in `src/app/globals.css` as CSS custom properties
- **Fonts**: Secular One (headings via `--font-heading`), Noto Sans Hebrew (body via `--font-body`)
- **Types go in `src/lib/types.ts`** — never define interfaces in component files
- **Firestore ops go in `src/lib/firestore.ts`** — components never call Firebase directly
- **One hook per concern** — optimistic UI for likes/saves
- **Denormalized data** — author info is copied onto posts and boards (authorName, authorPhotoURL, ownerName, ownerPhotoURL)
- **Imports**: use `@/*` path alias (maps to `src/*`)
- **Dark mode**: use CSS custom properties, dark overrides via `[data-theme="dark"]` in globals.css

## Design Tokens (subset)

```
--bg: #FAF6F1          --accent: #C17B4A       --text: #2D2A26
--card-bg: #FFFFFF      --like: #E85D75         --radius: 16px
--gold-gradient: linear-gradient(135deg, #D4A04A, #F0C87A)
```

## Data Model (key fields)

- **Post**: type (note|quote|image|video), tags[], boardCount, likeCount, saveCount
- **Board**: isPublic, likeCount, followerCount, ownerName — default board "האוסף שלי" auto-created on signup
- **Social**: separate collections for `likes`, `saves`, `boardLikes`, `boardFollows`, `userFollows`
- **Tag = concept page**: `tags/{normalizeConcept(name)}` holds a shared wiki page — description, aliases, related, links (all normalized keys). Any signed-in user can edit
- **Post.links**: normalized `[[ ]]` targets, recomputed on create/update — powers "mentioned in" on concept pages
- **No email in `users/`**: emails live only in Firebase Auth; rules reject an `email` field

## Pitfalls

- `firebase.ts` returns `null` for auth/db/storage when env vars are missing — code must handle this for build to pass
- No `.firebaserc` — Firebase project ID (`orotoo`) is configured via CLI context
- Composite indexes required: `boards(isPublic + followerCount)`, `boards(isPublic + createdAt)` — defined in `firestore.indexes.json`
- `next.config.ts` allowlists image domains — add new domains there if using external images
- SSR (firebase-admin) data has timestamps as plain `{seconds, nanoseconds}` — use `timestampMillis()` from utils, never `.toMillis()` directly
- Every collection the client listens to needs a rule — a denied `onSnapshot` crashes the Firestore SDK for the whole page ("INTERNAL ASSERTION FAILED ca9")
- Board/post counts are denormalized — update `boardCount`, `likeCount`, `followerCount` etc. on both the document and the relation
