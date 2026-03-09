import type { Metadata, Viewport } from "next";
import { Secular_One, Noto_Sans_Hebrew } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

const secularOne = Secular_One({
  weight: "400",
  subsets: ["hebrew", "latin"],
  variable: "--font-secular-one",
  display: "swap",
});

const notoSansHebrew = Noto_Sans_Hebrew({
  subsets: ["hebrew", "latin"],
  variable: "--font-noto-sans-hebrew",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "אורות — השראה רוחנית",
  description: "פלטפורמה להשראה רוחנית, ציטוטים, מדיטציה והגות",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${secularOne.variable} ${notoSansHebrew.variable}`}>
      <body>
        <div className="bgPattern" />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
