"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle, Loader2, ArrowRight, CheckCircle2,
  Link as LinkIcon, Tag, AlignLeft, FileText, AlertTriangle, GraduationCap
} from "lucide-react";
import Link from "next/link";
import { createLink, fetchCategories, extractError } from "@/lib/api";
import { ToastContainer, useToast } from "@/components/Toast";

// إضافة السنة الدراسية للحالة
interface FormState {
  title:       string;
  url:         string;
  category:    string;
  year:        string; 
  description: string;
}

interface FieldError {
  title?:    string;
  url?:      string;
  category?: string;
  year?:     string;
}

// قائمة السنوات الدراسية (يمكنك تعديلها لاحقاً لتكون ديناميكية إذا أردت)
const ACADEMIC_YEARS = [
  "الفرقة الأولى",
  "الفرقة الثانية",
  "الفرقة الثالثة",
  "الفرقة الرابعة",
  "عام / مشترك"
];

export default function NewLinkPage() {
  const router = useRouter();
  const { toasts, addToast, dismiss } = useToast();

  const [categories, setCategories] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>({
    title:       "",
    url:         "",
    category:    "",
    year:        "", // تهيئة السنة
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
        // تعيين قيم افتراضية بعد التحميل
        setForm((prev) => ({ 
          ...prev, 
          category: cats[0] ?? "",
          year: ACADEMIC_YEARS[0] 
        }));
      })
      .catch(() => {});
  }, []);

  const set = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // مسح الخطأ بمجرد تعديل الحقل
    if (fieldErrors[field as keyof FieldError]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const errors: FieldError = {};
    if (!form.title.trim())    errors.title    = "العنوان مطلوب.";
    if (!form.url.trim())      errors.url      = "الرابط مطلوب.";
    else if (!/^https?:\/\/.+/.test(form.url.trim())) {
      errors.url = "يجب أن يكون رابطاً صالحاً يبدأ بـ http:// أو https://";
    }
    if (!form.category)        errors.category = "يرجى اختيار قسم.";
    if (!form.year)            errors.year     = "يرجى اختيار السنة الدراسية.";
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      // يجب التأكد أن واجهة API في الباك إند تقبل حقل "year"
      await createLink({
        title:       form.title.trim(),
        url:         form.url.trim(),
        category:    form.category,
        year:        form.year, 
        description: form.description.trim(),
      });
      setSuccess(true);
      addToast("تمت إضافة الرابط بنجاح!", "success");
      setTimeout(() => router.push("/vault-hq-88"), 1400);
    } catch (err) {
      setApiError(extractError(err));
      addToast(extractError(err), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ 
      title: "", 
      url: "", 
      category: categories[0] ?? "", 
      year: ACADEMIC_YEARS[0], 
      description: "" 
    });
    setFieldErrors({});
    setApiError(null);
  };

  // Character count for description
  const descLen = form.description.length;

  return (
    <div dir="rtl">
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
          <ArrowRight size={16} />
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <PlusCircle size={19} className="text-[var(--accent-primary)]" />
            <h1 className="font-display text-2xl text-[var(--text-primary)]">إضافة رابط جديد</h1>
          </div>
          <p className="text-[var(--text-secondary)] text-sm">
            إضافة مادة دراسية جديدة إلى الدليل
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
              <h2 className="font-display text-2xl text-[var(--text-primary)] mb-2">تمت إضافة الرابط!</h2>
              <p className="text-[var(--text-secondary)] text-sm">
                جاري التحويل إلى لوحة التحكم...
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
                  العنوان <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="مثال: ملاحظات محاضرة التفاضل والتكامل 2"
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
                <p className="text-[var(--text-muted)] text-xs text-left font-mono">
                  {form.title.length}/150
                </p>
              </div>

              {/* URL */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                  <LinkIcon size={14} />
                  رابط الدرايف (Drive URL) <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => set("url", e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  disabled={loading}
                  dir="ltr"
                  className={`input-field font-mono text-sm text-left ${fieldErrors.url ? "border-red-500 focus:border-red-500" : ""}`}
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

              {/* صف للقسم والسنة الدراسية معاً لتوفير المساحة */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                    <Tag size={14} />
                    القسم <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    disabled={loading}
                    className={`input-field ${fieldErrors.category ? "border-red-500 focus:border-red-500" : ""}`}
                  >
                    <option value="" disabled>اختر القسم...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
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

                {/* Academic Year */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                    <GraduationCap size={14} />
                    السنة الدراسية <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.year}
                    onChange={(e) => set("year", e.target.value)}
                    disabled={loading}
                    className={`input-field ${fieldErrors.year ? "border-red-500 focus:border-red-500" : ""}`}
                  >
                    <option value="" disabled>اختر السنة الدراسية...</option>
                    {ACADEMIC_YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <AnimatePresence>
                    {fieldErrors.year && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-red-400 text-xs flex items-center gap-1.5"
                      >
                        <AlertTriangle size={11} /> {fieldErrors.year}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                  <AlignLeft size={14} />
                  الوصف
                  <span className="text-[var(--text-muted)] font-normal">(اختياري)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="صف باختصار محتوى هذا الرابط..."
                  rows={4}
                  maxLength={500}
                  disabled={loading}
                  className="input-field resize-none"
                />
                <p className={`text-xs text-left font-mono transition-colors ${descLen > 450 ? "text-amber-400" : "text-[var(--text-muted)]"}`}>
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
                  <p className="text-[var(--text-muted)] text-xs font-mono mb-3 uppercase tracking-wide">معاينة</p>
                  <p className="font-semibold text-[var(--text-primary)] mb-1 line-clamp-1">
                    {form.title || "عنوان الرابط..."}
                  </p>
                  {form.description && (
                    <p className="text-[var(--text-secondary)] text-sm mb-2 line-clamp-2">{form.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    {form.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-primary)] font-semibold">
                        {form.category}
                      </span>
                    )}
                    {form.year && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold">
                        {form.year}
                      </span>
                    )}
                    {form.url && (
                      <span dir="ltr" className="text-xs text-[var(--text-muted)] font-mono truncate max-w-[200px] sm:max-w-[240px] text-left">
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
                  إعادة ضبط
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
                      جاري الإضافة...
                    </>
                  ) : (
                    <>
                      <PlusCircle size={16} />
                      إضافة الرابط
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}