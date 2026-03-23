import type { Metadata } from "next";
import { getUserProfileAdmin, getUserPublicBoardsAdmin } from "@/lib/firestore-admin";
import ProfileClient from "./ProfileClient";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { userId } = await params;
  const profile = await getUserProfileAdmin(userId);

  if (!profile) {
    return {
      title: "פרופיל",
      description: "פרופיל משתמש באורות — פלטפורמת השראה רוחנית",
    };
  }

  const description = profile.bio
    ? `${profile.displayName} — ${profile.bio}`
    : profile.tagline
      ? `${profile.displayName} — ${profile.tagline}`
      : `${profile.displayName} באורות — פלטפורמת השראה רוחנית`;

  return {
    title: profile.displayName,
    description,
    openGraph: {
      title: `${profile.displayName} | אורות`,
      description,
      type: "profile",
      ...(profile.photoURL ? { images: [{ url: profile.photoURL }] } : {}),
    },
    twitter: {
      card: "summary",
      title: `${profile.displayName} | אורות`,
      description,
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;

  // Fetch initial data server-side for SSR
  const profile = await getUserProfileAdmin(userId);
  const publicBoards = profile ? await getUserPublicBoardsAdmin(userId) : [];

  return (
    <ProfileClient
      userId={userId}
      initialProfile={profile}
      initialBoards={publicBoards}
    />
  );
}
