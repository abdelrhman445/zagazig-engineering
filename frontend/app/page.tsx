"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Sparkles, ChevronDown, RotateCcw, GraduationCap } from "lucide-react";
import { fetchLinks, fetchCategories, type Link } from "@/lib/api";
import { LinkCard, LinkCardSkeleton } from "@/components/LinkCard";

const HERO_WORDS = ["محاضرات", "كتب", "ملخصات", "امتحانات سابقة", "مشاريع"];

// قائمة السنوات الدراسية المتوافقة مع قاعدة البيانات
const ACADEMIC_YEARS = [
  "الفرقة الأولى",
  "الفرقة الثانية",
  "الفرقة الثالثة",
  "الفرقة الرابعة",
  "عام / مشترك"
];

export default function HomePage() {
  const [links, setLinks]             = useState<Link[]>([]);
  const [categories, setCategories]   = useState<string[]>([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [search, setSearch]           = useState("");
  const [category, setCategory]       = useState("");
  const [year, setYear]               = useState(""); // الحالة الجديدة للسنة الدراسية
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
  const loadLinks = useCallback(async (q: string, cat: string, yr: string, pg: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLinks({
        search: q || undefined,
        category: cat || undefined,
        year: yr || undefined, // إرسال السنة الدراسية للـ API
        page: pg,
        limit: LIMIT,
      });
      setLinks(data.links);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setError("تعذر تحميل المواد. هل الخادم (API) يعمل؟");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search & filters
  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      loadLinks(search, category, year, 1);
    }, 350);
    return () => clearTimeout(searchTimeout.current);
  }, [search, category, year, loadLinks]);

  // Page changes (no debounce)
  useEffect(() => {
    loadLinks(search, category, year, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const reset = () => {
    setSearch("");
    setCategory("");
    setYear("");
    setPage(1);
  };

  const hasFilters = search !== "" || category !== "" || year !== "";

  return (
    <div className="page-enter min-h-screen" dir="rtl">
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
          

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl text-[var(--text-primary)] leading-tight mb-4"
          >
            ابحث عن
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
            لم الداتا بتاعتك يا هندسة بالتوفيق ان شاء الله - دعواتك بقي
          </motion.p>

          {/* ── SEARCH BAR & FILTERS ────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col gap-3 max-w-4xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              {/* حقل البحث */}
              <div className="relative flex-[2]">
                <Search
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث بالعنوان أو الوصف..."
                  className="input-field h-12 text-base w-full"
                  style={{ paddingRight: "44px", paddingLeft: "16px" }}
                />
              </div>

              {/* فلتر القسم */}
              <div className="relative flex-1">
                <SlidersHorizontal
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                />
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                  className="input-field h-12 text-sm appearance-none cursor-pointer w-full"
                  style={{ paddingRight: "44px", paddingLeft: "36px" }}
                >
                  <option value="">جميع الأقسام</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                />
              </div>

              {/* فلتر السنة الدراسية */}
              <div className="relative flex-1">
                <GraduationCap
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                />
                <select
                  value={year}
                  onChange={(e) => { setYear(e.target.value); setPage(1); }}
                  className="input-field h-12 text-sm appearance-none cursor-pointer w-full"
                  style={{ paddingRight: "44px", paddingLeft: "36px" }}
                >
                  <option value="">جميع السنوات</option>
                  {ACADEMIC_YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                />
              </div>

              {/* زر إعادة الضبط */}
              {hasFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={reset}
                  className="h-12 px-5 rounded-xl border border-[var(--border-subtle)]
                             text-[var(--text-secondary)] hover:text-[var(--accent-primary)]
                             hover:border-[var(--accent-primary)] hover:bg-[var(--accent-subtle)]
                             transition-all duration-200 flex items-center justify-center gap-2.5 text-sm font-medium"
                >
                  <RotateCcw size={16} />
                  <span className="hidden lg:inline">إعادة ضبط</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── RESULTS STRIP ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        
        {/* Meta bar */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between mb-6">
            <motion.p
              key={`${total}-${search}-${category}-${year}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[var(--text-muted)] text-sm font-mono"
            >
              تم العثور على {total} نتيجة
              {hasFilters && (
                <span className="mr-2 text-[var(--accent-primary)]">
                  {search && `لـ "${search}"`}
                  {category && ` · ${category}`}
                  {year && ` · ${year}`}
                </span>
              )}
            </motion.p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-[var(--text-secondary)] text-lg">{error}</p>
            <button
              onClick={() => loadLinks(search, category, year, page)}
              className="mt-6 px-6 py-2.5 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium
                         hover:bg-[var(--accent-hover)] transition-colors"
            >
              حاول مرة أخرى
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
            className="flex flex-col items-center justify-center text-center py-24 w-full"
          >
            <div className="text-7xl mb-6">📂</div>
            <h3 className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              لم يتم العثور على نتائج
            </h3>
            <p className="text-[var(--text-secondary)] text-lg max-w-md mx-auto">
              {hasFilters
                ? "عذراً، لم نتمكن من العثور على أي مواد تطابق اختياراتك. جرب كلمات مفتاحية أخرى أو تغيير الفلاتر."
                : "عُد لاحقاً — سيتم إضافة المواد قريباً!"}
            </p>
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3 mt-12"
          >
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium border border-[var(--border-subtle)]
                         text-[var(--text-secondary)] hover:border-[var(--accent-primary)]
                         hover:text-[var(--accent-primary)] disabled:opacity-40
                         disabled:cursor-not-allowed transition-all duration-200"
            >
              السابق &rarr;
            </button>

            <span className="px-5 py-2.5 text-sm text-[var(--text-muted)] font-mono">
              {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium border border-[var(--border-subtle)]
                         text-[var(--text-secondary)] hover:border-[var(--accent-primary)]
                         hover:text-[var(--accent-primary)] disabled:opacity-40
                         disabled:cursor-not-allowed transition-all duration-200"
            >
              &larr; التالي 
            </button>
          </motion.div>
        )}
      </section>
    </div>
  );
}