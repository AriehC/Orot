"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, getUserBoards, getBoard, getUserPostCount } from "@/lib/firestore";
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

interface ProfileClientProps {
  userId: string;
  initialProfile: UserProfile | null;
  initialBoards: Board[];
}

export default function ProfileClient({ userId, initialProfile, initialBoards }: ProfileClientProps) {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();

  const [profileUser, setProfileUser] = useState<UserProfile | null>(initialProfile);
  const [boards, setBoards] = useState<Board[]>(initialBoards);
  const [pinnedBoards, setPinnedBoards] = useState<Board[]>([]);
  const [postCount, setPostCount] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(!initialProfile);

  const isOwnProfile = user?.uid === userId;

  useEffect(() => {
    // Always refresh from client for real-time data, even if we got SSR data
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
        console.error("ProfileClient: failed to load profile:", error);
        toast.error("שגיאה בטעינת הפרופיל");
        setLoading(false);
      });
    getUserBoards(userId)
      .then(setBoards)
      .catch((error) => {
        console.error("ProfileClient: failed to load boards:", error);
      });
    getUserPostCount(userId)
      .then(setPostCount)
      .catch(console.error);
  }, [userId, user?.uid]);

  if (loading && !initialProfile) return <Spinner fullPage />;
  if (!profileUser) return <EmptyState text="משתמש לא נמצא" />;

  return (
    <>
      <Navbar searchQuery="" onSearchChange={() => {}} onCreateClick={() => router.push("/")} />

      <main id="main-content" className={styles.main}>
        <ProfileHero
          profile={profileUser}
          postCount={postCount}
          boardCount={boards.length}
          isOwnProfile={isOwnProfile}
          onEditClick={() => setShowEdit(true)}
        />

        <ProfileSocialLinks
          links={profileUser.socialLinks || []}
          isOwnProfile={isOwnProfile}
          onEditClick={() => setShowEdit(true)}
        />

        <ProfileFeaturedBoards
          boards={pinnedBoards}
          isOwnProfile={isOwnProfile}
          onEditClick={() => setShowEdit(true)}
        />

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
