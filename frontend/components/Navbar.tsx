"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpenCheck, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface NavbarProps {
  onSearch?: (q: string) => void;
  showSearch?: boolean;
}

export function Navbar({ onSearch, showSearch = false }: NavbarProps) {
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 w-full"
      dir="rtl" // إضافة اتجاه اليمين لليسار هنا
    >
      <div
        className="backdrop-blur-xl border-b border-[var(--border-subtle)]"
        style={{ background: "rgba(var(--bg-primary-rgb, 255,255,255), 0.8)" }}
      >
        {/* Actual nav bar */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo - تم تكبيره قليلاً وإضافة ظل (Shadow) ليكون بارزاً */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <motion.div
              whileHover={{ rotate: -8, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="w-10 h-10 rounded-xl bg-[var(--accent-primary)] flex items-center justify-center shadow-lg shadow-blue-500/20"
            >
              <BookOpenCheck size={20} className="text-white" />
            </motion.div>
            <span className="font-display text-xl font-bold text-[var(--text-primary)] hidden sm:block tracking-wide">
              Zag<span className="text-[var(--accent-primary)]">Drives</span>
            </span>
          </Link>

          {/* Center search (only on home) - تم ضبط الأيقونات والمسافات للغة العربية */}
          {showSearch && (
            <div className="flex-1 max-w-sm hidden md:flex items-center">
              <div className="relative w-full">
                <Search
                  size={16}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  type="text"
                  value={searchValue}
                  onChange={handleSearch}
                  placeholder="ابحث عن المواد الدراسية..."
                  className="input-field pr-10 pl-4 py-2 h-10 text-sm w-full bg-[var(--bg-secondary)] focus:bg-[var(--bg-primary)] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Right controls */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </motion.header>
  );
}