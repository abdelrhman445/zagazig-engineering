"use client";

import { motion } from "framer-motion";
import { ExternalLink, BookOpen, FileText, FlaskConical, GraduationCap, FolderOpen, Layers, MoreHorizontal } from "lucide-react";
import type { Link } from "@/lib/api";

const CATEGORY_META: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string; darkBg: string }
> = {
  Lectures:     { icon: <GraduationCap size={14} />, color: "#3b82f6", bg: "#eff6ff",         darkBg: "rgba(59,130,246,0.12)" },
  Books:        { icon: <BookOpen size={14} />,      color: "#8b5cf6", bg: "#f5f3ff",         darkBg: "rgba(139,92,246,0.12)" },
  Sheets:       { icon: <FileText size={14} />,      color: "#10b981", bg: "#ecfdf5",         darkBg: "rgba(16,185,129,0.12)" },
  "Past Papers":{ icon: <FlaskConical size={14} />,  color: "#f59e0b", bg: "#fffbeb",         darkBg: "rgba(245,158,11,0.12)" },
  Summaries:    { icon: <Layers size={14} />,        color: "#06b6d4", bg: "#ecfeff",         darkBg: "rgba(6,182,212,0.12)"  },
  Projects:     { icon: <FolderOpen size={14} />,    color: "#f43f5e", bg: "#fff1f2",         darkBg: "rgba(244,63,94,0.12)"  },
  Other:        { icon: <MoreHorizontal size={14} />,color: "#64748b", bg: "#f8fafc",         darkBg: "rgba(100,116,139,0.12)"},
};

interface LinkCardProps {
  link: Link;
  index?: number;
}

export function LinkCard({ link, index = 0 }: LinkCardProps) {
  const meta = CATEGORY_META[link.category] ?? CATEGORY_META["Other"];

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
      className="card rounded-2xl p-5 flex flex-col gap-3 group cursor-pointer"
    >
      {/* Category Badge */}
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            color: meta.color,
            backgroundColor: meta.bg,
          }}
        >
          {meta.icon}
          {link.category}
        </span>

        <motion.a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          whileHover={{ scale: 1.15, rotate: -8 }}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-full flex items-center justify-center
                     bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]
                     hover:bg-[var(--accent-primary)] hover:border-[var(--accent-primary)]
                     hover:text-white text-[var(--text-muted)]
                     transition-colors duration-200"
          aria-label={`Open ${link.title}`}
        >
          <ExternalLink size={13} />
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
      <div className="flex items-center justify-between pt-1 mt-auto border-t border-[var(--border-subtle)]">
        <span className="text-[var(--text-muted)] text-xs font-mono">
          {new Date(link.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <motion.span
          className="text-xs text-[var(--accent-primary)] font-medium opacity-0
                     group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1"
          initial={false}
        >
          Open Drive <ExternalLink size={10} />
        </motion.span>
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
      className="rounded-2xl p-5 flex flex-col gap-3 border border-[var(--border-subtle)]"
      style={{ background: "var(--bg-card)" }}
    >
      <div className="flex items-center justify-between">
        <div className="skeleton h-6 w-24 rounded-full" />
        <div className="skeleton h-8 w-8 rounded-full" />
      </div>
      <div className="skeleton h-5 w-3/4 rounded-lg" />
      <div className="skeleton h-4 w-full rounded-lg" />
      <div className="skeleton h-4 w-2/3 rounded-lg" />
      <div className="skeleton h-px w-full mt-1" />
      <div className="skeleton h-3 w-20 rounded" />
    </motion.div>
  );
}
