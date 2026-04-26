"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Sparkles, ChevronDown, RotateCcw } from "lucide-react";
import { fetchLinks, fetchCategories, type Link } from "@/lib/api";
import { LinkCard, LinkCardSkeleton } from "@/components/LinkCard";

const HERO_WORDS = ["Lectures", "Books", "Summaries", "Past Papers", "Projects"];

export default function HomePage() {
  const [links, setLinks]             = useState<Link[]>([]);
  const [categories, setCategories]   = useState<string[]>([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [search, setSearch]           = useState("");
  const [category, setCategory]       = useState("");
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [heroWord, setHeroWord]       = useState(0);
  const searchTimeout                 = useRef<ReturnType<typeof setTimeout>>();
  const LIMIT = 12;

  // Rotate hero words
  useEffect(() => {
    const id = setInterval(
      () => setHeroWord((w) => (w + 1) % HERO_WORDS.length),
      2200
    );
    return () => clearInterval(id);
  }, []);

  // Load categories once
  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  // Load links whenever filters change
  const loadLinks = useCallback(async (q: string, cat: string, pg: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLinks({
        search: q || undefined,
        category: cat || undefined,
        page: pg,
        limit: LIMIT,
      });
      setLinks(data.links);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setError("Could not load materials. Is the API running?");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      loadLinks(search, category, 1);
    }, 350);
    return () => clearTimeout(searchTimeout.current);
  }, [search, category, loadLinks]);

  // Page changes (no debounce)
  useEffect(() => {
    loadLinks(search, category, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const reset = () => {
    setSearch("");
    setCategory("");
    setPage(1);
  };

  const hasFilters = search !== "" || category !== "";

  return (
    <div className="page-enter min-h-screen">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-16 px-4 sm:px-6">
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute inset-0 flex items-start justify-center"
          aria-hidden
        >
          <div
            className="w-[600px] h-[400px] rounded-full blur-[100px] opacity-20 dark:opacity-15"
            style={{ background: "radial-gradient(ellipse, #3b82f6 0%, transparent 70%)" }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                       bg-[var(--accent-subtle)] border border-blue-200/60 dark:border-blue-500/20
                       text-[var(--accent-primary)] text-xs font-semibold tracking-wide mb-6"
          >
            <Sparkles size={12} />
            Student Resource Hub
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl text-[var(--text-primary)] leading-tight mb-4"
          >
            Find Your
            <br />
            <span className="relative inline-block">
              <AnimatePresence mode="wait">
                <motion.span
                  key={heroWord}
                  className="gradient-text"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                >
                  {HERO_WORDS[heroWord]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto mb-10"
          >
            A curated directory of drive links for university students —
            lectures, books, past papers, summaries and more.
          </motion.p>

          {/* ── SEARCH BAR ────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
          >
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or description..."
                className="input-field pl-10 h-12 text-base"
              />
            </div>

            <div className="relative">
              <SlidersHorizontal
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
              />
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="input-field pl-9 pr-8 h-12 text-sm appearance-none cursor-pointer min-w-[160px]"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
              />
            </div>

            {hasFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={reset}
                className="h-12 px-4 rounded-xl border border-[var(--border-subtle)]
                           text-[var(--text-secondary)] hover:text-[var(--accent-primary)]
                           hover:border-[var(--accent-primary)] hover:bg-[var(--accent-subtle)]
                           transition-all duration-200 flex items-center gap-2 text-sm font-medium"
              >
                <RotateCcw size={14} />
                Reset
              </motion.button>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── RESULTS STRIP ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {/* Meta bar */}
        <div className="flex items-center justify-between mb-6">
          <AnimatePresence mode="wait">
            {!loading && (
              <motion.p
                key={`${total}-${search}-${category}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[var(--text-muted)] text-sm font-mono"
              >
                {total === 0
                  ? "No results found"
                  : `${total} material${total !== 1 ? "s" : ""} found`}
                {hasFilters && (
                  <span className="ml-2 text-[var(--accent-primary)]">
                    {search && `for "${search}"`}
                    {search && category && " · "}
                    {category && category}
                  </span>
                )}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Error state */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-[var(--text-secondary)] text-base">{error}</p>
            <button
              onClick={() => loadLinks(search, category, page)}
              className="mt-4 px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium
                         hover:bg-[var(--accent-hover)] transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Grid */}
        {!error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <LinkCardSkeleton key={i} index={i} />
                ))
              : links.map((link, i) => (
                  <LinkCard key={link._id} link={link} index={i} />
                ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && links.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="text-6xl mb-5">📂</div>
            <h3 className="font-display text-2xl text-[var(--text-primary)] mb-2">
              Nothing here yet
            </h3>
            <p className="text-[var(--text-secondary)]">
              {hasFilters
                ? "Try adjusting your search or category filter."
                : "Check back later — materials will be added soon!"}
            </p>
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 mt-12"
          >
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-[var(--border-subtle)]
                         text-[var(--text-secondary)] hover:border-[var(--accent-primary)]
                         hover:text-[var(--accent-primary)] disabled:opacity-40
                         disabled:cursor-not-allowed transition-all duration-200"
            >
              ← Previous
            </button>

            <span className="px-4 py-2 text-sm text-[var(--text-muted)] font-mono">
              {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-[var(--border-subtle)]
                         text-[var(--text-secondary)] hover:border-[var(--accent-primary)]
                         hover:text-[var(--accent-primary)] disabled:opacity-40
                         disabled:cursor-not-allowed transition-all duration-200"
            >
              Next →
            </button>
          </motion.div>
        )}
      </section>
    </div>
  );
}
