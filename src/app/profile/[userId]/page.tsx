"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, updateUserProfile, getUserBoards, getUserSavedPosts } from "@/lib/firestore";
import { uploadMedia } from "@/lib/storage";
import { useFeed } from "@/hooks/useFeed";
import { useLike } from "@/hooks/useLike";
import { useSave } from "@/hooks/useSave";
import { UserProfile, Board, Post } from "@/lib/types";
import Navbar from "@/components/layout/Navbar";
import MasonryFeed from "@/components/feed/MasonryFeed";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import toast from "react-hot-toast";
import styles from "./page.module.css";

export default function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { user, profile: myProfile, refreshProfile } = useAuth();
  const router = useRouter();

  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "saved" | "boards">("content");
  const [boards, setBoards] = useState<Board[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = user?.uid === userId;

  const { posts: userPosts, loading: postsLoading } = useFeed({ authorId: userId });
  const { isLiked, handleLike } = useLike();
  const { isSaved, handleSave } = useSave();

  useEffect(() => {
    getUserProfile(userId).then((p) => {
      setProfileUser(p);
      setLoading(false);
    });
    getUserBoards(userId).then(setBoards);
  }, [userId]);

  useEffect(() => {
    if (activeTab === "saved" && isOwnProfile && user) {
      setSavedLoading(true);
      getUserSavedPosts(user.uid).then((posts) => {
        setSavedPosts(posts);
        setSavedLoading(false);
      });
    }
  }, [activeTab, isOwnProfile, user]);

  if (loading) return <Spinner fullPage />;
  if (!profileUser) return <EmptyState text="משתמש לא נמצא" />;

  const initials = profileUser.displayName?.charAt(0) || "א";

  return (
    <>
      <Navbar searchQuery="" onSearchChange={() => {}} onCreateClick={() => router.push("/")} />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.avatarLarge}>
            {profileUser.photoURL ? (
              <img src={profileUser.photoURL} alt={profileUser.displayName} />
            ) : (
              initials
            )}
          </div>
          <div className={styles.info}>
            <h1 className={styles.name}>{profileUser.displayName}</h1>
            {profileUser.bio && <p className={styles.bio}>{profileUser.bio}</p>}
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{userPosts.length}</div>
                <div className={styles.statLabel}>פוסטים</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{boards.length}</div>
                <div className={styles.statLabel}>לוחות</div>
              </div>
            </div>
          </div>
          {isOwnProfile && (
            <button className={styles.editBtn} onClick={() => setShowEdit(true)}>
              עריכת פרופיל
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={activeTab === "content" ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab("content")}
          >
            התוכן שלי
          </button>
          {isOwnProfile && (
            <button
              className={activeTab === "saved" ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab("saved")}
            >
              שמורים
            </button>
          )}
          <button
            className={activeTab === "boards" ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab("boards")}
          >
            לוחות
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "content" && (
        <MasonryFeed
          posts={userPosts}
          loading={postsLoading}
          isLiked={isLiked}
          isSaved={isSaved}
          onLike={handleLike}
          onSave={handleSave}
        />
      )}

      {activeTab === "saved" && isOwnProfile && (
        <MasonryFeed
          posts={savedPosts}
          loading={savedLoading}
          isLiked={isLiked}
          isSaved={isSaved}
          onLike={handleLike}
          onSave={handleSave}
        />
      )}

      {activeTab === "boards" && (
        <div className={styles.container}>
          {boards.length === 0 ? (
            <EmptyState text="עדיין אין לוחות" />
          ) : (
            <div className={styles.boardsGrid}>
              {boards.map((board) => (
                <Link
                  key={board.id}
                  href={`/boards/${board.id}`}
                  className={styles.boardCard}
                  style={{ backgroundColor: board.color + "15" }}
                >
                  <h3 style={{ color: board.color }}>{board.name}</h3>
                  <p>{board.description}</p>
                  <span className={styles.boardCardMeta}>
                    {board.itemCount} פריטים • {board.isPublic ? "ציבורי" : "פרטי"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEdit && (
        <EditProfileModal
          profile={profileUser}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => {
            setProfileUser(updated);
            refreshProfile();
            setShowEdit(false);
          }}
        />
      )}
    </>
  );
}

function EditProfileModal({
  profile,
  onClose,
  onSaved,
}: {
  profile: UserProfile;
  onClose: () => void;
  onSaved: (updated: UserProfile) => void;
}) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio || "");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useState<HTMLInputElement | null>(null);

  async function handleSave() {
    if (!user || !displayName.trim()) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        bio: bio.trim(),
      });
      toast("הפרופיל עודכן ✨");
      onSaved({ ...profile, displayName: displayName.trim(), bio: bio.trim() });
    } catch {
      toast.error("שגיאה בעדכון הפרופיל");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="עריכת פרופיל" onClose={onClose}>
      <div className={styles.editForm}>
        <div>
          <label>שם תצוגה</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="השם שלך"
          />
        </div>
        <div>
          <label>ביו</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="ספרו משהו על עצמכם..."
          />
        </div>
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving || !displayName.trim()}>
          {saving ? "שומר..." : "שמירה"}
        </button>
      </div>
    </Modal>
  );
}
