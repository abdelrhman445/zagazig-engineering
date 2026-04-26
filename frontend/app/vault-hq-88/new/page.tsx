"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle, Loader2, ArrowLeft, CheckCircle2,
  Link as LinkIcon, Tag, AlignLeft, FileText, AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { createLink, fetchCategories, extractError } from "@/lib/api";
import { ToastContainer, useToast } from "@/components/Toast";

interface FormState {
  title:       string;
  url:         string;
  category:    string;
  description: string;
}

interface FieldError {
  title?:    string;
  url?:      string;
  category?: string;
}

export default function NewLinkPage() {
  const router = useRouter();
  const { toasts, addToast, dismiss } = useToast();

  const [categories, setCategories] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>({
    title:       "",
    url:         "",
    category:    "",
    description: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [apiError, setApiError]       = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);

  useEffect(() => {
    fetchCategories()
      .then((cats) => {
        setCategories(cats);
        setForm((prev) => ({ ...prev, category: cats[0] ?? "" }));
      })
      .catch(() => {});
  }, []);

  const set = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (fieldErrors[field as keyof FieldError]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const errors: FieldError = {};
    if (!form.title.trim())    errors.title    = "Title is required.";
    if (!form.url.trim())      errors.url      = "URL is required.";
    else if (!/^https?:\/\/.+/.test(form.url.trim())) {
      errors.url = "Must be a valid URL starting with http:// or https://";
    }
    if (!form.category)        errors.category = "Please select a category.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await createLink({
        title:       form.title.trim(),
        url:         form.url.trim(),
        category:    form.category,
        description: form.description.trim(),
      });
      setSuccess(true);
      addToast("Link added successfully!", "success");
      setTimeout(() => router.push("/vault-hq-88"), 1400);
    } catch (err) {
      setApiError(extractError(err));
      addToast(extractError(err), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ title: "", url: "", category: categories[0] ?? "", description: "" });
    setFieldErrors({});
    setApiError(null);
  };

  // Character count for description
  const descLen = form.description.length;

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/vault-hq-88"
          className="w-9 h-9 rounded-xl border border-[var(--border-subtle)] flex items-center justify-center
                     text-[var(--text-muted)] hover:text-[var(--accent-primary)]
                     hover:border-[var(--accent-primary)] hover:bg-[var(--accent-subtle)]
                     transition-all duration-200"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <PlusCircle size={19} className="text-[var(--accent-primary)]" />
            <h1 className="font-display text-2xl text-[var(--text-primary)]">Add New Link</h1>
          </div>
          <p className="text-[var(--text-secondary)] text-sm">
            Add a new study material to the directory
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        {/* Success overlay */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card rounded-2xl p-10 text-center mb-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30
                           flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 size={32} className="text-emerald-500" />
              </motion.div>
              <h2 className="font-display text-2xl text-[var(--text-primary)] mb-2">Link Added!</h2>
              <p className="text-[var(--text-secondary)] text-sm">
                Redirecting to dashboard...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Card */}
        {!success && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="card rounded-2xl p-6 sm:p-8"
          >
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                  <FileText size={14} />
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Calculus II Full Lecture Notes"
                  maxLength={150}
                  disabled={loading}
                  className={`input-field ${fieldErrors.title ? "border-red-500 focus:border-red-500" : ""}`}
                />
                <AnimatePresence>
                  {fieldErrors.title && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-400 text-xs flex items-center gap-1.5"
                    >
                      <AlertTriangle size={11} /> {fieldErrors.title}
                    </motion.p>
                  )}
                </AnimatePresence>
                <p className="text-[var(--text-muted)] text-xs text-right font-mono">
                  {form.title.length}/150
                </p>
              </div>

              {/* URL */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                  <LinkIcon size={14} />
                  Drive URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => set("url", e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  disabled={loading}
                  className={`input-field font-mono text-sm ${fieldErrors.url ? "border-red-500 focus:border-red-500" : ""}`}
                />
                <AnimatePresence>
                  {fieldErrors.url && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-400 text-xs flex items-center gap-1.5"
                    >
                      <AlertTriangle size={11} /> {fieldErrors.url}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                  <Tag size={14} />
                  Category <span className="text-red-400">*</span>
                </label>
                {/* Visual category picker */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <motion.button
                      key={cat}
                      type="button"
                      whileTap={{ scale: 0.94 }}
                      onClick={() => set("category", cat)}
                      disabled={loading}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-200
                                  ${form.category === cat
                                    ? "bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white shadow-glow-sm"
                                    : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
                                  }`}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
                <AnimatePresence>
                  {fieldErrors.category && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-400 text-xs flex items-center gap-1.5"
                    >
                      <AlertTriangle size={11} /> {fieldErrors.category}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                  <AlignLeft size={14} />
                  Description
                  <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Briefly describe what's included in this drive..."
                  rows={4}
                  maxLength={500}
                  disabled={loading}
                  className="input-field resize-none"
                />
                <p className={`text-xs text-right font-mono transition-colors ${descLen > 450 ? "text-amber-400" : "text-[var(--text-muted)]"}`}>
                  {descLen}/500
                </p>
              </div>

              {/* Preview Card */}
              {(form.title || form.url) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-xl border border-[var(--border-subtle)] p-4 bg-[var(--bg-tertiary)]"
                >
                  <p className="text-[var(--text-muted)] text-xs font-mono mb-3 uppercase tracking-wide">Preview</p>
                  <p className="font-semibold text-[var(--text-primary)] mb-1 line-clamp-1">
                    {form.title || "Link title..."}
                  </p>
                  {form.description && (
                    <p className="text-[var(--text-secondary)] text-sm mb-2 line-clamp-2">{form.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    {form.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-primary)] font-semibold">
                        {form.category}
                      </span>
                    )}
                    {form.url && (
                      <span className="text-xs text-[var(--text-muted)] font-mono truncate max-w-[240px]">
                        {form.url}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}

              {/* API Error */}
              <AnimatePresence>
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2.5 px-4 py-3 rounded-xl
                               bg-red-950/40 border border-red-800/50 text-red-400 text-sm"
                  >
                    <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
                    {apiError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="flex-1 h-11 rounded-xl border border-[var(--border-subtle)]
                             text-[var(--text-secondary)] text-sm font-medium
                             hover:bg-[var(--bg-tertiary)] transition-colors
                             disabled:opacity-50"
                >
                  Reset Form
                </button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 h-11 rounded-xl bg-[var(--accent-primary)] text-white
                             text-sm font-semibold hover:bg-[var(--accent-hover)]
                             transition-colors shadow-glow-sm flex items-center justify-center gap-2
                             disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <PlusCircle size={16} />
                      Add Link
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </>
  );
}
