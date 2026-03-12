"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { createBoard } from "@/lib/firestore";
import toast from "react-hot-toast";
import { UserProfile } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function ensureUserProfile(firebaseUser: User): Promise<UserProfile> {
    const userRef = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        id: snap.id,
        followerCount: 0,
        followingCount: 0,
        mainBoardId: null,
        ...data,
      } as UserProfile;
    }

    const displayName = firebaseUser.displayName || "משתמש חדש";
    const photoURL = firebaseUser.photoURL || null;

    // Create default board for new user
    const boardId = await createBoard({
      name: "האוסף שלי",
      description: "האוסף האישי שלי",
      color: "#C17B4A",
      ownerId: firebaseUser.uid,
      ownerName: displayName,
      ownerPhotoURL: photoURL,
      isPublic: false,
    });

    const newProfile: Omit<UserProfile, "id"> = {
      displayName,
      email: firebaseUser.email || "",
      photoURL,
      bio: "",
      tagline: "",
      coverImageURL: null,
      socialLinks: [],
      pinnedBoardIds: [],
      mainBoardId: boardId,
      followerCount: 0,
      followingCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(userRef, newProfile);
    return { id: firebaseUser.uid, ...newProfile };
  }

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userProfile = await ensureUserProfile(firebaseUser);
          setProfile(userProfile);
        } catch (error) {
          console.error("Profile load error:", error);
          toast.error("שגיאה בטעינת הפרופיל");
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    await signInWithPopup(auth, googleProvider);
  }

  async function signInWithEmail(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signUpWithEmail(email: string, password: string, displayName: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  async function refreshProfile() {
    if (user) {
      const userProfile = await ensureUserProfile(user);
      setProfile(userProfile);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
