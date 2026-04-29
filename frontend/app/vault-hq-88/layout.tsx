"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, PlusCircle, LogOut, BookOpenCheck,
  ChevronLeft, Menu, X, Shield // تم استبدال ChevronRight بـ ChevronLeft
} from "lucide-react";
import { getToken, clearToken } from "@/lib/api";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { href: "/vault-hq-88",      label: "لوحة التحكم",  icon: <LayoutDashboard size={17} /> },
  { href: "/vault-hq-88/new",  label: "إضافة رابط",   icon: <PlusCircle size={17} /> },
];

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);

  // Guard: if no token, go home
  useEffect(() => {
    if (!getToken()) router.replace("/");
  }, [router]);

  const logout = () => {
    clearToken();
    router.push("/");
  };

  return (
    // تفعيل الـ RTL
    <div className="flex min-h-[calc(100vh-4rem)]" dir="rtl">

      {/* ── DESKTOP SIDEBAR ──────────────────────────────────── */}
      {/* تعديل border-r إلى border-l و left-0 إلى right-0 */}
      <aside className="hidden md:flex flex-col w-60 border-l border-[var(--border-subtle)]
                        bg-[var(--bg-secondary)] flex-shrink-0 fixed top-16 bottom-0 right-0 z-30">
        {/* Brand strip */}
        <div className="px-5 py-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <div>
              <p className="text-[var(--text-primary)] text-sm font-semibold leading-none">لوحة الإدارة</p>
                </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${active ? "active" : ""}`}
              >
                {item.icon}
                {item.label}
                {active && (
                  <motion.span
                    layoutId="active-pill"
                    // تعديل ml-auto إلى mr-auto
                    className="mr-auto"
                  >
                    <ChevronLeft size={14} />
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: logout + theme */}
        <div className="px-3 py-4 border-t border-[var(--border-subtle)] flex flex-col gap-2">
          
          <button
            onClick={logout}
            // تعديل text-left إلى text-right
            className="sidebar-link w-full text-right hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={17} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* ── MOBILE TOPBAR ────────────────────────────────────── */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-30
                      bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]
                      flex items-center justify-between px-4 h-12">
        <span className="text-sm font-semibold text-[var(--text-primary)] font-mono">vault-hq-88</span>
        <button
          onClick={() => setMobile((v) => !v)}
          className="w-8 h-8 flex items-center justify-center rounded-lg
                     hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
        >
          {mobile ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden fixed top-28 left-0 right-0 z-20
                       bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]
                       px-3 py-3 flex flex-col gap-1"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobile(false)}
                className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            <button
              onClick={logout}
              // تعديل text-left إلى text-right
              className="sidebar-link text-right hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut size={17} />
              تسجيل الخروج
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      {/* تعديل md:ml-60 إلى md:mr-60 لإفساح المجال للقائمة الجانبية من اليمين */}
      <div className="flex-1 md:mr-60 pt-12 md:pt-0 w-full">
        <div className="p-6 sm:p-8 page-enter">
          {children}
        </div>
      </div>
    </div>
  );
}