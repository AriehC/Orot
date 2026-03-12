"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, getUserBoards, getBoard } from "@/lib/firestore";
import { UserProfile, Board } from "@/lib/types";
import Navbar from "@/components/layout/Navbar";
import ProfileHero from "@/components/profile/ProfileHero";
import ProfileSocialLinks from "@/components/profile/ProfileSocialLinks";
import ProfileFeaturedBoards from "@/components/profile/ProfileFeaturedBoards";
import ProfileTabs from "@/components/profile/ProfileTabs";
import EditProfileModal from "@/components/profile/EditProfileModal";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import toast from "react-hot-toast";
import styles from "./page.module.css";

export default function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { user, refreshProfile } = useAuth();
  const router = useRouter();

  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [pinnedBoards, setPinnedBoards] = useState<Board[]>([]);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = user?.uid === userId;

  useEffect(() => {
    getUserProfile(userId)
      .then((p) => {
        setProfileUser(p);
        setLoading(false);
        // Load pinned boards
        if (p?.pinnedBoardIds?.length) {
          Promise.all(p.pinnedBoardIds.map((id) => getBoard(id)))
            .then((results) => {
              setPinnedBoards(
                results.filter((b): b is Board => b !== null && (b.isPublic || user?.uid === userId))
              );
            })
            .catch(console.error);
        }
      })
      .catch((error) => {
        console.error("ProfilePage: failed to load profile:", error);
        toast.error("שגיאה בטעינת הפרופיל");
        setLoading(false);
      });
    getUserBoards(userId)
      .then(setBoards)
      .catch((error) => {
        console.error("ProfilePage: failed to load boards:", error);
      });
  }, [userId, user?.uid]);

  if (loading) return <Spinner fullPage />;
  if (!profileUser) return <EmptyState text="משתמש לא נמצא" />;

  return (
    <>
      <Navbar searchQuery="" onSearchChange={() => {}} onCreateClick={() => router.push("/")} />

      <main id="main-content" className={styles.main}>
        <ProfileHero
          profile={profileUser}
          postCount={0}
          boardCount={boards.length}
          isOwnProfile={isOwnProfile}
          onEditClick={() => setShowEdit(true)}
        />

        <ProfileSocialLinks links={profileUser.socialLinks || []} />

        <ProfileFeaturedBoards boards={pinnedBoards} />

        <div className={styles.tabsSection}>
          <ProfileTabs
            userId={userId}
            boards={boards}
            mainBoardId={profileUser.mainBoardId}
            isOwnProfile={isOwnProfile}
          />
        </div>
      </main>

      {showEdit && (
        <EditProfileModal
          profile={profileUser}
          boards={boards}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => {
            setProfileUser(updated);
            refreshProfile();
            setShowEdit(false);
            // Refresh pinned boards
            if (updated.pinnedBoardIds?.length) {
              Promise.all(updated.pinnedBoardIds.map((id) => getBoard(id)))
                .then((results) => {
                  setPinnedBoards(
                    results.filter((b): b is Board => b !== null && (b.isPublic || isOwnProfile))
                  );
                })
                .catch(console.error);
            } else {
              setPinnedBoards([]);
            }
          }}
        />
      )}
    </>
  );
}
