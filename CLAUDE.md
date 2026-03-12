# Orot (אורות)

Hebrew RTL spiritual inspiration app — Google Keep meets spiritual wellness.
Next.js 16 + Firebase (Auth/Firestore/Storage) + TypeScript strict + CSS Modules. No Tailwind.

## Commands

```
npm run dev        # dev server
npm run build      # production build (MUST pass before deploy)
firebase deploy    # full deploy: hosting + rules + indexes → orotoo.web.app
npm run seed       # seed Firestore with sample data
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
| `scripts/seed.ts` | Firestore seed script (uses firebase-admin) |

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
- **Tag**: free-form user-created, stored on posts + `tags` collection for autocomplete

## Pitfalls

- `firebase.ts` returns `null` for auth/db/storage when env vars are missing — code must handle this for build to pass
- No `.firebaserc` — Firebase project ID (`orotoo`) is configured via CLI context
- Composite indexes required: `boards(isPublic + followerCount)`, `boards(isPublic + createdAt)` — defined in `firestore.indexes.json`
- `next.config.ts` allowlists image domains — add new domains there if using external images
- Board/post counts are denormalized — update `boardCount`, `likeCount`, `followerCount` etc. on both the document and the relation
