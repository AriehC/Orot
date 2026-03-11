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
  metadataBase: new URL("https://orotoo.web.app"),
  title: { default: "אורות — השראה רוחנית", template: "%s | אורות" },
  description: "פלטפורמת השראה רוחנית — ציטוטים, הגיגים, ומדיטציה",
  keywords: ["השראה", "רוחניות", "מדיטציה", "ציטוטים", "הגיגים", "אורות"],
  authors: [{ name: "אורות" }],
  applicationName: "אורות",
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: "https://orotoo.web.app",
    siteName: "אורות",
    title: "אורות — השראה רוחנית",
    description: "פלטפורמת השראה רוחנית — ציטוטים, הגיגים, ומדיטציה",
  },
  twitter: {
    card: "summary",
    title: "אורות — השראה רוחנית",
    description: "פלטפורמת השראה רוחנית — ציטוטים, הגיגים, ומדיטציה",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://orotoo.web.app" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${secularOne.variable} ${notoSansHebrew.variable}`}>
      <body>
        <a href="#main-content" className="skipToContent">דלג לתוכן</a>
        <div className="bgPattern" aria-hidden="true" />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
