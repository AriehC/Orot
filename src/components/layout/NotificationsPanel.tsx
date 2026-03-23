"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Notification } from "@/lib/types";
import styles from "./NotificationsPanel.module.css";

interface NotificationsPanelProps {
  notifications: Notification[];
  loading: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "עכשיו";
  if (minutes < 60) return `לפני ${minutes} דק׳`;
  if (hours < 24) return `לפני ${hours} שע׳`;
  if (days < 7) return `לפני ${days} ימים`;
  return date.toLocaleDateString("he-IL");
}

function getNotificationMessage(notification: Notification): string {
  switch (notification.type) {
    case "like":
      return `${notification.actorName} אהב/ה את "${notification.postTitle}"`;
    case "comment":
      return `${notification.actorName} הגיב/ה על "${notification.postTitle}"`;
    case "follow":
      return `${notification.actorName} התחיל/ה לעקוב אחריך`;
    case "board_add":
      return `${notification.actorName} הוסיף/ה את "${notification.postTitle}" ללוח "${notification.boardName}"`;
    default:
      return "";
  }
}

export default function NotificationsPanel({
  notifications,
  loading,
  onMarkRead,
  onMarkAllRead,
  onClose,
}: NotificationsPanelProps) {
  const router = useRouter();
  const hasUnread = notifications.some((n) => !n.read);

  function handleNotificationClick(notification: Notification) {
    if (!notification.read) {
      onMarkRead(notification.id);
    }
    // Navigate based on notification type
    if (notification.type === "follow") {
      router.push(`/profile/${notification.actorId}`);
      onClose();
    } else if (notification.postId) {
      // For like, comment, and board_add, could navigate to post or board
      if (notification.type === "board_add" && notification.boardId) {
        router.push(`/boards/${notification.boardId}`);
      }
      onClose();
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>התראות</h3>
        {hasUnread && (
          <button className={styles.markAllBtn} onClick={onMarkAllRead}>
            סמן הכל כנקרא
          </button>
        )}
      </div>

      <div className={styles.list}>
        {loading ? (
          <div className={styles.empty}>
            <div className={styles.spinner} />
          </div>
        ) : notifications.length === 0 ? (
          <div className={styles.empty}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.emptyIcon}
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p className={styles.emptyText}>אין התראות חדשות</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              className={`${styles.item} ${!notification.read ? styles.unread : ""}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className={styles.avatar}>
                {notification.actorPhotoURL ? (
                  <Image
                    src={notification.actorPhotoURL}
                    alt={notification.actorName}
                    width={36}
                    height={36}
                    className={styles.avatarImg}
                  />
                ) : (
                  <span className={styles.avatarInitial}>
                    {notification.actorName.charAt(0)}
                  </span>
                )}
              </div>
              <div className={styles.content}>
                <p className={styles.message}>
                  {getNotificationMessage(notification)}
                </p>
                <span className={styles.time}>
                  {formatRelativeTime(notification.createdAt.toDate())}
                </span>
              </div>
              {!notification.read && <span className={styles.dot} />}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
