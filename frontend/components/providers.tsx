"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    // مزود الثيم (الوضع الليلي/النهاري) يعمل بشكل ممتاز كما هو
    // تم ضبط الاتجاه (RTL) مسبقاً في ملف RootLayout للعمل على مستوى الموقع بالكامل
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  );
}