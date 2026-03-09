# אורות (Orot) — Project Conventions

## Overview
Hebrew RTL spiritual inspiration platform. Think Google Keep meets spiritual wellness.

## Tech Stack
- **Next.js 15** — App Router, TypeScript
- **Firebase** — Auth (Google + Email), Firestore, Storage
- **CSS Modules** — no Tailwind, bespoke spiritual aesthetic
- **react-masonry-css** — masonry grid layout
- **react-hot-toast** — notifications

## Structure
- `src/app/` — Pages (App Router)
- `src/components/` — React components grouped by feature (feed/, content/, boards/, profile/, auth/, ui/, layout/)
- `src/lib/` — Firebase init, Firestore CRUD, Storage helpers, types, ranking algorithm
- `src/hooks/` — Custom hooks (useFeed, useLike, useSave, useBoards, useTags, etc.)
- `src/contexts/` — AuthContext

## Conventions
- **Language**: UI is in Hebrew, code is in English
- **Direction**: RTL throughout — use CSS logical properties (`padding-inline-start` not `padding-left`)
- **Components**: Client Components (`'use client'`) for anything interactive or using Firebase client SDK. Server Components for layouts and metadata.
- **Styling**: CSS Modules co-located with components. Design tokens in `globals.css` as CSS custom properties.
- **Fonts**: Secular One (headings), Noto Sans Hebrew (body) — loaded via `next/font/google`
- **Firebase**: All Firestore operations in `src/lib/firestore.ts`. Storage operations in `src/lib/storage.ts`. Init in `src/lib/firebase.ts`.
- **Types**: All TypeScript interfaces in `src/lib/types.ts`
- **Hooks**: One hook per concern. Optimistic UI for likes/saves.
- **Tags**: Free-form, user-created (not fixed categories). Stored as `tags[]` on posts + `tags` collection for autocomplete.

## Design System
- `--bg: #FAF6F1` (warm off-white)
- `--accent: #C17B4A` (golden brown)
- `--text: #2D2A26` (dark brown)
- Card radius: 16px
- Gold gradient: `linear-gradient(135deg, #C17B4A, #E8A87C, #C17B4A)`

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run seed` — Seed Firestore with sample data
