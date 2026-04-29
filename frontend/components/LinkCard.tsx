"use client";

import { motion } from "framer-motion";
import { 
  ExternalLink, BookOpen, FileText, FlaskConical, 
  GraduationCap, FolderOpen, Layers, MoreHorizontal 
} from "lucide-react";
import type { Link } from "@/lib/api";

const CATEGORY_META: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string; darkBg: string }
> = {
  Lectures:     { icon: <GraduationCap size={14} />, color: "#3b82f6", bg: "#eff6ff",        darkBg: "rgba(59,130,246,0.12)" },
  Books:        { icon: <BookOpen size={14} />,      color: "#8b5cf6", bg: "#f5f3ff",        darkBg: "rgba(139,92,246,0.12)" },
  Sheets:       { icon: <FileText size={14} />,      color: "#10b981", bg: "#ecfdf5",        darkBg: "rgba(16,185,129,0.12)" },
  "Past Papers":{ icon: <FlaskConical size={14} />,  color: "#f59e0b", bg: "#fffbeb",        darkBg: "rgba(245,158,11,0.12)" },
  Summaries:    { icon: <Layers size={14} />,        color: "#06b6d4", bg: "#ecfeff",        darkBg: "rgba(6,182,212,0.12)"  },
  Projects:     { icon: <FolderOpen size={14} />,    color: "#f43f5e", bg: "#fff1f2",        darkBg: "rgba(244,63,94,0.12)"  },
  Other:        { icon: <MoreHorizontal size={14} />,color: "#64748b", bg: "#f8fafc",        darkBg: "rgba(100,116,139,0.12)"},
};

const CATEGORY_ARABIC: Record<string, string> = {
  Lectures: "محاضرات",
  Books: "كتب",
  Sheets: "شيتات",
  "Past Papers": "امتحانات سابقة",
  Summaries: "ملخصات",
  Projects: "مشاريع",
  Other: "أخرى"
};

interface LinkCardProps {
  link: Link;
  index?: number;
}

export function LinkCard({ link, index = 0 }: LinkCardProps) {
  const meta = CATEGORY_META[link.category] ?? CATEGORY_META["Other"];
  const displayCategory = CATEGORY_ARABIC[link.category] || link.category;

  // دالة لفتح الرابط عند الضغط على الكارت نفسه لزيادة سهولة الاستخدام
  const handleCardClick = () => {
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
      onClick={handleCardClick} // جعل الكارت بالكامل قابل للضغط
      className="card rounded-2xl p-5 flex flex-col gap-3 group cursor-pointer h-full"
      dir="rtl"
    >
      {/* Header: Badges & Link Icon */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{
              color: meta.color,
              backgroundColor: meta.bg,
            }}
          >
            {meta.icon}
            {displayCategory}
          </span>

          {link.year && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/10">
              <GraduationCap size={12} />
              {link.year}
            </span>
          )}
        </div>

        <motion.a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()} // منع تكرار الفتح عند الضغط على الأيقونة
          whileHover={{ scale: 1.15, rotate: 8 }}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                     bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]
                     hover:bg-[var(--accent-primary)] hover:border-[var(--accent-primary)]
                     hover:text-white text-[var(--text-muted)]
                     transition-colors duration-200"
          aria-label={`فتح ${link.title}`}
        >
          <ExternalLink size={13} className="-scale-x-100" />
        </motion.a>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-[var(--text-primary)] text-base leading-snug
                     group-hover:text-[var(--accent-primary)] transition-colors duration-200
                     line-clamp-2">
        {link.title}
      </h3>

      {/* Description */}
      {link.description && (
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-2 flex-1">
          {link.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 mt-auto border-t border-[var(--border-subtle)]">
        <span className="text-[var(--text-muted)] text-[10px] font-mono">
          {new Date(link.createdAt).toLocaleDateString("ar-EG", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        
        {/* تم تغيير Span إلى A ليصبح رابطاً فعالاً */}
        <motion.a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-[var(--accent-primary)] font-bold opacity-0
                     group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5
                     hover:underline" // إضافة خط تحت الكلمة عند الوقوف عليها لبيان أنها رابط
          initial={false}
        >
          فتح الدرايف <ExternalLink size={10} className="-scale-x-100" />
        </motion.a>
      </div>
    </motion.div>
  );
}

// ─── Skeleton version for loading state ──────────────────────
export function LinkCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl p-5 flex flex-col gap-3 border border-[var(--border-subtle)] h-full"
      style={{ background: "var(--bg-card)" }}
      dir="rtl"
    >
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
           <div className="skeleton h-6 w-20 rounded-full" />
           <div className="skeleton h-6 w-16 rounded-full" />
        </div>
        <div className="skeleton h-8 w-8 rounded-full" />
      </div>
      <div className="skeleton h-5 w-3/4 rounded-lg mt-1" />
      <div className="skeleton h-4 w-full rounded-lg" />
      <div className="skeleton h-px w-full mt-auto" />
      <div className="flex justify-between items-center mt-1">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-3 w-16 rounded" />
      </div>
    </motion.div>
  );
}