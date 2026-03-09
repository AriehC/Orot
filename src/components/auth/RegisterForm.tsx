"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./LoginForm.module.css";

export default function RegisterForm() {
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignUp() {
    try {
      setError("");
      await signInWithGoogle();
      router.push("/");
    } catch {
      setError("שגיאה בהתחברות עם Google");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!displayName || !email || !password) return;
    if (password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signUpWithEmail(email, password, displayName);
      router.push("/");
    } catch {
      setError("שגיאה ביצירת החשבון. ייתכן שהאימייל כבר בשימוש.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>✦</div>
        <h1 className={styles.title}>הצטרפו לאורות</h1>
        <p className={styles.subtitle}>צרו חשבון והתחילו לשתף השראה</p>

        <button className={styles.googleBtn} onClick={handleGoogleSignUp} type="button">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          הרשמה עם Google
        </button>

        <div className={styles.divider}>או</div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>שם תצוגה</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="השם שיוצג באתר"
            />
          </div>
          <div className={styles.formGroup}>
            <label>אימייל</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              dir="ltr"
            />
          </div>
          <div className={styles.formGroup}>
            <label>סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="לפחות 6 תווים"
              dir="ltr"
            />
          </div>
          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? "יוצר חשבון..." : "✨ הצטרפות"}
          </button>
        </form>

        <p className={styles.footer}>
          כבר יש לך חשבון? <Link href="/auth/login">התחברות</Link>
        </p>
      </div>
    </div>
  );
}
