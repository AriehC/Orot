"use client";

import { UserProfile } from "@/lib/types";
import { useUserFollow } from "@/hooks/useUserFollow";
import ShareProfileButton from "./ShareProfileButton";
import styles from "./ProfileHero.module.css";

interface ProfileHeroProps {
  profile: UserProfile;
  postCount: number;
  boardCount: number;
  isOwnProfile: boolean;
  onEditClick: () => void;
}

export default function ProfileHero({
  profile,
  postCount,
  boardCount,
  isOwnProfile,
  onEditClick,
}: ProfileHeroProps) {
  const { following, handleToggleFollow } = useUserFollow(profile.id);
  const initials = profile.displayName?.charAt(0) || "א";

  return (
    <section className={styles.hero}>
      {/* Cover */}
      <div className={styles.cover}>
        {profile.coverImageURL ? (
          <img
            src={profile.coverImageURL}
            alt=""
            className={styles.coverImage}
          />
        ) : null}
        <div className={styles.coverOverlay} />
      </div>

      {/* Avatar */}
      <div className={styles.avatarWrapper}>
        <div className={styles.avatar}>
          {profile.photoURL ? (
            <img src={profile.photoURL} alt={profile.displayName} />
          ) : (
            <span>{initials}</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className={styles.info}>
        <h1 className={styles.name}>{profile.displayName}</h1>
        {profile.tagline && (
          <p className={styles.tagline}>{profile.tagline}</p>
        )}
        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{profile.followerCount}</span>
            <span className={styles.statLabel}>עוקבים</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{profile.followingCount}</span>
            <span className={styles.statLabel}>עוקב</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{postCount}</span>
            <span className={styles.statLabel}>פוסטים</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{boardCount}</span>
            <span className={styles.statLabel}>לוחות</span>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {isOwnProfile ? (
            <button className={styles.editBtn} onClick={onEditClick}>
              עריכת פרופיל
            </button>
          ) : (
            <button
              className={following ? styles.followingBtn : styles.followBtn}
              onClick={handleToggleFollow}
            >
              {following ? "עוקב" : "עקוב"}
            </button>
          )}
          <ShareProfileButton userId={profile.id} />
        </div>
      </div>
    </section>
  );
}
