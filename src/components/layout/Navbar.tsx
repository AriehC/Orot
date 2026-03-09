"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./Navbar.module.css";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateClick: () => void;
  onBoardsClick?: () => void;
}

export default function Navbar({ searchQuery, onSearchChange, onCreateClick, onBoardsClick }: NavbarProps) {
  const { user, profile } = useAuth();

  const initials = profile?.displayName
    ? profile.displayName.charAt(0)
    : "א";

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>✦</div>
          <span className={styles.logoText}>אורות</span>
        </Link>

        <div className={styles.searchBar}>
          <div className={styles.searchIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            className={styles.searchInput}
            placeholder="חיפוש השראה, ציטוטים, מדיטציות..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          {user ? (
            <>
              {onBoardsClick && (
                <button className={styles.btn} onClick={onBoardsClick}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                  <span>לוחות</span>
                </button>
              )}
              <button className={styles.btnPrimary} onClick={onCreateClick}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>יצירה</span>
              </button>
              <Link href={`/profile/${user.uid}`} className={styles.avatar}>
                {profile?.photoURL ? (
                  <Image
                    src={profile.photoURL}
                    alt={profile.displayName}
                    width={36}
                    height={36}
                    className={styles.avatarImg}
                  />
                ) : (
                  initials
                )}
              </Link>
            </>
          ) : (
            <Link href="/auth/login" className={styles.btnPrimary}>
              התחברות
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
