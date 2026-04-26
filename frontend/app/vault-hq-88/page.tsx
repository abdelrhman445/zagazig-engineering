"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle, Pencil, Trash2, Loader2, RefreshCw,
  ExternalLink, Search, LayoutDashboard, AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { fetchLinks, deleteLink, updateLink, fetchCategories, extractError, type Link as DriveLink } from "@/lib/api";
import { ToastContainer, useToast } from "@/components/Toast";

// ─── Inline Edit Modal ────────────────────────────────────────
function EditModal({
  link,
  categories,
  onClose,
  onSaved,
}: {
  link: DriveLink;
  categories: string[];
  onClose: () => void;
  onSaved: (updated: DriveLink) => void;
}) {
  const [form, setForm] = useState({
    title:       link.title,
    url:         link.url,
    category:    link.category,
    description: link.description,
    isActive:    link.isActive,
  });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setError(null);
    if (!form.title.trim() || !form.url.trim() || !form.category) {
      setError("Title, URL, and Category are required.");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateLink(link._id, form);
      onSaved(updated);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 24, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 24, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="w-full max-w-lg card rounded-2xl p-6"
          style={{ background: "var(--bg-card)" }}
        >
          <h2 className="font-display text-xl text-[var(--text-primary)] mb-5">Edit Link</h2>

          <div className="flex flex-col gap-4">
            {[
              { label: "Title", field: "title", type: "text", placeholder: "Calculus II Slides" },
              { label: "URL",   field: "url",   type: "url",  placeholder: "https://drive.google.com/..." },
            ].map(({ label, field, type, placeholder }) => (
              <div key={field} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text-secondary)]">{label}</label>
                <input
                  type={type}
                  value={form[field as keyof typeof form] as string}
                  onChange={(e) => set(field, e.target.value)}
                  placeholder={placeholder}
                  className="input-field"
                />
              </div>
            ))}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Category</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="input-field"
              >
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                placeholder="Optional short description..."
                className="input-field resize-none"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => set("isActive", e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-10 h-5 rounded-full transition-colors duration-200 ${
                    form.isActive ? "bg-[var(--accent-primary)]" : "bg-[var(--border-subtle)]"
                  }`}
                />
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow
                              transition-transform duration-200 ${form.isActive ? "translate-x-5" : ""}`}
                />
              </div>
              <span className="text-sm text-[var(--text-secondary)]">
                {form.isActive ? "Active (visible to users)" : "Inactive (hidden)"}
              </span>
            </label>

            {error && (
              <p className="text-red-400 text-sm flex items-center gap-2">
                <AlertTriangle size={14} /> {error}
              </p>
            )}
          </div>

          <div className="flex gap-3 mt-6 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-[var(--border-subtle)]
                         text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-[var(--accent-primary)]
                         text-white hover:bg-[var(--accent-hover)] disabled:opacity-60
                         transition-colors flex items-center gap-2"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Confirm Delete Dialog ────────────────────────────────────
function DeleteConfirm({
  title,
  onConfirm,
  onCancel,
  loading,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="card rounded-2xl p-6 max-w-sm w-full"
        style={{ background: "var(--bg-card)" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <h3 className="font-semibold text-[var(--text-primary)]">Delete Link?</h3>
        </div>
        <p className="text-[var(--text-secondary)] text-sm mb-5">
          <span className="font-medium text-[var(--text-primary)]">"{title}"</span> will be
          permanently deleted. This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-[var(--border-subtle)]
                       text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white
                       hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────
export default function VaultDashboard() {
  const router = useRouter();
  const { toasts, addToast, dismiss } = useToast();

  const [links, setLinks]           = useState<DriveLink[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState("");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editTarget, setEditTarget] = useState<DriveLink | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DriveLink | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const LIMIT = 15;

  const load = useCallback(async (q: string, cat: string, pg: number) => {
    setLoading(true);
    try {
      const data = await fetchLinks({ search: q || undefined, category: cat || undefined, page: pg, limit: LIMIT });
      setLinks(data.links);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      addToast(extractError(err), "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchCategories().then(setCategories).catch(() => {}); }, []);
  useEffect(() => { load(search, category, page); }, [page]); // eslint-disable-line
  // Debounce search/filter changes
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(search, category, 1); }, 350);
    return () => clearTimeout(t);
  }, [search, category]); // eslint-disable-line

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteLink(deleteTarget._id);
      setLinks((prev) => prev.filter((l) => l._id !== deleteTarget._id));
      setTotal((t) => t - 1);
      addToast(`"${deleteTarget.title}" deleted successfully.`, "success");
      setDeleteTarget(null);
    } catch (err) {
      addToast(extractError(err), "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaved = (updated: DriveLink) => {
    setLinks((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
    addToast("Link updated successfully!", "success");
    setEditTarget(null);
  };

  // Category badge colors
  const BADGE_COLORS: Record<string, string> = {
    Lectures: "text-blue-500 bg-blue-500/10",
    Books: "text-purple-500 bg-purple-500/10",
    Sheets: "text-emerald-500 bg-emerald-500/10",
    "Past Papers": "text-amber-500 bg-amber-500/10",
    Summaries: "text-cyan-500 bg-cyan-500/10",
    Projects: "text-rose-500 bg-rose-500/10",
    Other: "text-slate-500 bg-slate-500/10",
  };

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      {editTarget && (
        <EditModal
          link={editTarget}
          categories={categories}
          onClose={() => setEditTarget(null)}
          onSaved={handleSaved}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          title={deleteTarget.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <LayoutDashboard size={20} className="text-[var(--accent-primary)]" />
            <h1 className="font-display text-2xl text-[var(--text-primary)]">Dashboard</h1>
          </div>
          <p className="text-[var(--text-secondary)] text-sm">
            Manage all study material links
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => load(search, category, page)}
            className="w-9 h-9 rounded-xl border border-[var(--border-subtle)] flex items-center justify-center
                       text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]
                       hover:bg-[var(--accent-subtle)] transition-all duration-200"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/vault-hq-88/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)]
                       text-white text-sm font-semibold hover:bg-[var(--accent-hover)]
                       transition-colors shadow-glow-sm"
          >
            <PlusCircle size={16} />
            Add Link
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Links",    value: total,              color: "text-[var(--accent-primary)]" },
          { label: "Current Page",   value: `${page} / ${totalPages}`, color: "text-emerald-500" },
          { label: "Per Page",       value: LIMIT,              color: "text-purple-500" },
        ].map((s) => (
          <div key={s.label} className="card rounded-xl p-4">
            <p className="text-[var(--text-muted)] text-xs font-mono uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-2xl font-semibold font-mono ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search links..."
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-field py-2 text-sm max-w-xs"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th className="hidden sm:table-cell">Category</th>
                <th className="hidden lg:table-cell">Description</th>
                <th className="hidden md:table-cell">Status</th>
                <th className="hidden md:table-cell">Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j}><div className="skeleton h-4 rounded w-full max-w-[140px]" /></td>
                    ))}
                  </tr>
                ))
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-[var(--text-muted)]">
                    <div className="text-4xl mb-3">📂</div>
                    <p>No links found</p>
                  </td>
                </tr>
              ) : (
                links.map((link, i) => (
                  <motion.tr
                    key={link._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    {/* Title */}
                    <td>
                      <div className="flex items-center gap-2 max-w-[220px]">
                        <span className="truncate font-medium text-[var(--text-primary)]">
                          {link.title}
                        </span>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="hidden sm:table-cell">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold
                                       ${BADGE_COLORS[link.category] ?? "text-slate-500 bg-slate-500/10"}`}>
                        {link.category}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="hidden lg:table-cell">
                      <span className="text-[var(--text-secondary)] line-clamp-1 max-w-[200px] block">
                        {link.description || <span className="text-[var(--text-muted)] italic">—</span>}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="hidden md:table-cell">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        link.isActive
                          ? "text-emerald-500 bg-emerald-500/10"
                          : "text-slate-400 bg-slate-500/10"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${link.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {link.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="hidden md:table-cell font-mono text-xs text-[var(--text-muted)]">
                      {new Date(link.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="flex items-center gap-1.5 justify-end">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setEditTarget(link)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center
                                     text-[var(--text-muted)] hover:text-[var(--accent-primary)]
                                     hover:bg-[var(--accent-subtle)] transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setDeleteTarget(link)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center
                                     text-[var(--text-muted)] hover:text-red-400
                                     hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)]">
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Page {page} of {totalPages} · {total} total
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-subtle)]
                           text-[var(--text-secondary)] hover:border-[var(--accent-primary)]
                           hover:text-[var(--accent-primary)] disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all"
              >
                ← Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-subtle)]
                           text-[var(--text-secondary)] hover:border-[var(--accent-primary)]
                           hover:text-[var(--accent-primary)] disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
