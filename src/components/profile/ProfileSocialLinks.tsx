"use client";

import { ReactNode } from "react";
import { SocialLink, SocialPlatform } from "@/lib/types";
import styles from "./ProfileSocialLinks.module.css";

export const PLATFORM_CONFIG: Record<
  SocialPlatform,
  {
    label: string;
    icon: ReactNode;
    urlTemplate: string | null; // null = user enters full URL
    placeholder: string;
  }
> = {
  instagram: {
    label: "Instagram",
    urlTemplate: "https://instagram.com/{handle}",
    placeholder: "שם משתמש",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  twitter: {
    label: "X",
    urlTemplate: "https://x.com/{handle}",
    placeholder: "שם משתמש",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  threads: {
    label: "Threads",
    urlTemplate: "https://threads.net/@{handle}",
    placeholder: "שם משתמש",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.083.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.711-.063 1.306-.436 2.436-1.073 3.35-.798 1.15-1.96 1.838-3.362 1.988-1.036.111-2.073-.076-2.906-.525-1.003-.54-1.645-1.41-1.809-2.449-.143-.91.07-1.794.6-2.487.559-.73 1.425-1.222 2.507-1.422.862-.16 1.798-.139 2.7.06-.046-.543-.19-1.003-.432-1.378-.358-.555-.96-.883-1.785-.975-1.208-.135-2.012.255-2.487.678l-1.345-1.564c.828-.712 2.066-1.253 3.7-1.076 1.263.136 2.274.703 2.925 1.64.571.822.894 1.886.959 3.163 1.088.458 2.003 1.166 2.63 2.11.948 1.426 1.152 3.2.575 5.005-.672 2.103-2.07 3.674-4.162 4.676-1.622.776-3.564 1.18-5.77 1.2zm1.302-7.028c.99-.107 1.702-.554 2.117-1.152.437-.63.638-1.455.614-2.457-.72-.17-1.477-.227-2.198-.098-.695.13-1.227.404-1.538.792-.257.322-.349.716-.272 1.108.106.536.457.917 1.014 1.155.453.194.99.278 1.571.278.239 0 .463-.013.692-.037v.411z" />
      </svg>
    ),
  },
  facebook: {
    label: "Facebook",
    urlTemplate: "https://facebook.com/{handle}",
    placeholder: "שם משתמש או ID",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  youtube: {
    label: "YouTube",
    urlTemplate: "https://youtube.com/@{handle}",
    placeholder: "שם ערוץ",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  tiktok: {
    label: "TikTok",
    urlTemplate: "https://tiktok.com/@{handle}",
    placeholder: "שם משתמש",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z" />
      </svg>
    ),
  },
  spotify: {
    label: "Spotify",
    urlTemplate: null,
    placeholder: "קישור לפרופיל Spotify",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    ),
  },
  telegram: {
    label: "Telegram",
    urlTemplate: "https://t.me/{handle}",
    placeholder: "שם משתמש",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  linkedin: {
    label: "LinkedIn",
    urlTemplate: "https://linkedin.com/in/{handle}",
    placeholder: "שם משתמש",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  whatsapp: {
    label: "WhatsApp",
    urlTemplate: "https://wa.me/{handle}",
    placeholder: "מספר טלפון (בינלאומי)",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  website: {
    label: "אתר",
    urlTemplate: null,
    placeholder: "https://...",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
};

/** Build full URL from a handle and platform template */
export function buildSocialURL(platform: SocialPlatform, handle: string): string {
  const config = PLATFORM_CONFIG[platform];
  const cleaned = handle.replace(/^@/, "").trim();
  if (!config.urlTemplate) return handle.trim(); // website / spotify — user provides full URL
  return config.urlTemplate.replace("{handle}", cleaned);
}

/** Extract handle from a full URL for a given platform */
export function extractHandle(platform: SocialPlatform, url: string): string {
  const config = PLATFORM_CONFIG[platform];
  if (!config.urlTemplate) return url; // website / spotify — return as-is
  // Try to extract handle from known URL patterns
  const patterns: Record<string, RegExp> = {
    instagram: /instagram\.com\/([^/?]+)/i,
    twitter: /(?:twitter|x)\.com\/([^/?]+)/i,
    threads: /threads\.net\/@?([^/?]+)/i,
    facebook: /facebook\.com\/([^/?]+)/i,
    youtube: /youtube\.com\/@?([^/?]+)/i,
    tiktok: /tiktok\.com\/@?([^/?]+)/i,
    telegram: /t\.me\/([^/?]+)/i,
    linkedin: /linkedin\.com\/in\/([^/?]+)/i,
    whatsapp: /wa\.me\/([^/?]+)/i,
  };
  const regex = patterns[platform];
  if (regex) {
    const match = url.match(regex);
    if (match) return match[1];
  }
  // If URL doesn't match pattern, assume it's already a handle
  return url.replace(/^@/, "");
}

interface ProfileSocialLinksProps {
  links: SocialLink[];
  isOwnProfile?: boolean;
  onEditClick?: () => void;
}

export default function ProfileSocialLinks({ links, isOwnProfile, onEditClick }: ProfileSocialLinksProps) {
  if (links.length === 0) {
    if (isOwnProfile && onEditClick) {
      return (
        <div className={styles.container}>
          <button className={styles.emptyState} onClick={onEditClick}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
            הוסיפו קישורים חברתיים
          </button>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={styles.container}>
      {links.map((link) => {
        const config = PLATFORM_CONFIG[link.platform];
        if (!config) return null;
        return (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconButton}
            data-platform={link.platform}
            aria-label={config.label}
            title={config.label}
          >
            {config.icon}
          </a>
        );
      })}
    </div>
  );
}
