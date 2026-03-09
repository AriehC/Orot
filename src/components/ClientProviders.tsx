"use client";

import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 2500,
          style: {
            background: "var(--text)",
            color: "white",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: 500,
            fontFamily: "var(--font-body)",
            direction: "rtl",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          },
        }}
      />
    </AuthProvider>
  );
}
