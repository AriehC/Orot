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
      <div className={`${styles.cover} ${!profile.coverImageURL ? styles.coverDefault : ""}`}>
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
        <div className={`${styles.avatar} ${isOwnProfile ? styles.avatarOwn : ""}`}>
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
        {profile.tagline ? (
          <p className={styles.tagline}>{profile.tagline}</p>
        ) : isOwnProfile ? (
          <button className={styles.placeholderBtn} onClick={onEditClick}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            הוסיפו תיאור קצר...
          </button>
        ) : null}
        {profile.bio ? (
          <p className={styles.bio}>{profile.bio}</p>
        ) : isOwnProfile ? (
          <button className={styles.placeholderBtn} onClick={onEditClick}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            הוסיפו ביו...
          </button>
        ) : null}

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statItem} aria-label={`${profile.followerCount} עוקבים`}>
            <span className={styles.statNumber}>{profile.followerCount}</span>
            <span className={styles.statLabel}>עוקבים</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem} aria-label={`${profile.followingCount} עוקב`}>
            <span className={styles.statNumber}>{profile.followingCount}</span>
            <span className={styles.statLabel}>עוקב</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem} aria-label={`${postCount} פוסטים`}>
            <span className={styles.statNumber}>{postCount}</span>
            <span className={styles.statLabel}>פוסטים</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem} aria-label={`${boardCount} לוחות`}>
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
          <ShareProfileButton
            userId={profile.id}
            displayName={profile.displayName}
            tagline={profile.tagline}
          />
        </div>
      </div>
    </section>
  );
}
