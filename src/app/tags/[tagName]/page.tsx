import type { Metadata } from "next";
import { getTagPostsAdmin } from "@/lib/firestore-admin";
import TagClient from "./TagClient";

interface TagPageProps {
  params: Promise<{ tagName: string }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tagName } = await params;
  const tag = decodeURIComponent(tagName);
  const posts = await getTagPostsAdmin(tag);

  const title = `#${tag}`;
  const description = posts.length > 0
    ? `${posts.length} פוסטים בנושא ${tag} — השראה רוחנית באורות`
    : `פוסטים בנושא ${tag} — השראה רוחנית באורות`;

  return {
    title,
    description,
    openGraph: {
      title: `#${tag} | אורות`,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `#${tag} | אורות`,
      description,
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tagName } = await params;
  const tag = decodeURIComponent(tagName);

  // Fetch initial data server-side for SSR
  const initialPosts = await getTagPostsAdmin(tag);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `#${tag} — אורות`,
    description: `${initialPosts.length} פוסטים בנושא ${tag} — השראה רוחנית`,
    url: `https://orotoo.web.app/tags/${encodeURIComponent(tag)}`,
    numberOfItems: initialPosts.length,
    isPartOf: {
      "@type": "WebSite",
      name: "אורות",
      url: "https://orotoo.web.app",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TagClient
        tagName={tag}
        initialPosts={initialPosts}
        initialPostCount={initialPosts.length}
      />
    </>
  );
}
