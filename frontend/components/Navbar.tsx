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
    >
      <div
        className="backdrop-blur-xl border-b border-[var(--border-subtle)]"
        style={{ background: "rgba(var(--bg-primary-rgb, 255,255,255), 0.8)" }}
      >
        {/* Actual nav bar */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <motion.div
              whileHover={{ rotate: -8, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="w-8 h-8 rounded-xl bg-[var(--accent-primary)] flex items-center justify-center"
            >
              <BookOpenCheck size={17} className="text-white" />
            </motion.div>
            <span className="font-display text-lg font-semibold text-[var(--text-primary)] hidden sm:block">
              Zag<span className="text-[var(--accent-primary)]">Drives</span>
            </span>
          </Link>

          {/* Center search (only on home) */}
          {showSearch && (
            <div className="flex-1 max-w-sm hidden md:flex items-center">
              <div className="relative w-full">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  type="text"
                  value={searchValue}
                  onChange={handleSearch}
                  placeholder="Search materials..."
                  className="input-field pl-9 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
