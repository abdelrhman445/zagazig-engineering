import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    default: "ZagDrives — Student Study Materials",
    template: "%s | ZagDrives",
  },
  description:
    "A curated directory of Google Drive study materials for university students — lectures, books, past papers, summaries, and more.",
  keywords: ["university", "study materials", "google drive", "lectures", "books", "past papers"],
  openGraph: {
    title: "ZagDrives — Student Study Materials",
    description: "Curated drive links for university students.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="noise min-h-screen antialiased">
        <Providers>
          <Navbar />
          <main>{children}</main>

          {/* Subtle grid background */}
          <div
            className="pointer-events-none fixed inset-0 z-[-1] bg-grid-slate opacity-100 dark:opacity-100"
            aria-hidden
          />
        </Providers>
      </body>
    </html>
  );
}
