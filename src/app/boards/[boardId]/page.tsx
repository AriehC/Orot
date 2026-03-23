import type { Metadata } from "next";
import { getBoardAdmin, getBoardPostsAdmin } from "@/lib/firestore-admin";
import BoardDetailClient from "./BoardDetailClient";

interface BoardPageProps {
  params: Promise<{ boardId: string }>;
}

export async function generateMetadata({ params }: BoardPageProps): Promise<Metadata> {
  const { boardId } = await params;
  const board = await getBoardAdmin(boardId);

  if (!board || !board.isPublic) {
    return {
      title: "לוח",
      description: "לוח באורות — פלטפורמת השראה רוחנית",
    };
  }

  const description = board.description
    ? `${board.description} — ${board.itemCount} פריטים`
    : `${board.name} — לוח עם ${board.itemCount} פריטי השראה באורות`;

  return {
    title: board.name,
    description,
    openGraph: {
      title: `${board.name} | אורות`,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${board.name} | אורות`,
      description,
    },
  };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;

  // Only SSR for public boards
  const board = await getBoardAdmin(boardId);
  const isPublicBoard = board && board.isPublic;

  let initialPosts = isPublicBoard ? await getBoardPostsAdmin(boardId) : [];

  // JSON-LD for public boards
  const jsonLd = isPublicBoard
    ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${board.name} — אורות`,
        description: board.description || `לוח השראה עם ${board.itemCount} פריטים`,
        url: `https://orotoo.web.app/boards/${boardId}`,
        numberOfItems: board.itemCount,
        author: board.ownerName
          ? { "@type": "Person", name: board.ownerName }
          : undefined,
        isPartOf: {
          "@type": "WebSite",
          name: "אורות",
          url: "https://orotoo.web.app",
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BoardDetailClient
        boardId={boardId}
        initialBoard={isPublicBoard ? board : null}
        initialPosts={initialPosts}
      />
    </>
  );
}
