import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    default: "ZagDrives — موارد الطلاب الدراسية",
    template: "%s | ZagDrives",
  },
  description:
    "دليل منظم لروابط الدرايف والمواد الدراسية لطلاب الجامعات — محاضرات، كتب، امتحانات سابقة، ملخصات، والمزيد.",
  keywords: ["جامعة", "مواد دراسية", "جوجل درايف", "محاضرات", "كتب", "امتحانات سابقة", "ملخصات"],
  openGraph: {
    title: "ZagDrives — موارد الطلاب الدراسية",
    description: "روابط درايف منظمة ومصنفة لطلاب الجامعات.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* تم تغيير الخطوط لخطوط تدعم العربية بشكل احترافي (Cairo & Tajawal) مع الإبقاء على خط الـ Mono */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Tajawal:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500&display=swap"
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