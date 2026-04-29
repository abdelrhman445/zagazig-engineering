"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, LogIn, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { adminLogin, saveToken, getToken } from "@/lib/api";
import { extractError } from "@/lib/api";

export default function GatePage() {
  const router = useRouter();
  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);

  // If already logged in, redirect immediately
  useEffect(() => {
    if (getToken()) router.replace("/vault-hq-88");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("يرجى ملء جميع الحقول.");
      return;
    }

    setLoading(true);
    try {
      const data = await adminLogin(username.trim(), password);
      saveToken(data.token);
      setSuccess(true);
      setTimeout(() => router.push("/vault-hq-88"), 800);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    // إضافة dir="rtl" لتفعيل الاتجاه من اليمين لليسار
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative overflow-hidden" dir="rtl">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <div
          className="w-[500px] h-[500px] rounded-full blur-[120px] opacity-15 dark:opacity-10"
          style={{ background: "radial-gradient(ellipse, #2563eb 0%, transparent 70%)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative"
      >
        {/* Card */}
        <div className="card rounded-2xl p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                         bg-[var(--accent-primary)] mb-5 shadow-glow"
            >
              <ShieldCheck size={26} className="text-white" />
            </motion.div>
            <h1 className="font-display text-3xl text-[var(--text-primary)] mb-1.5">
              Admin            </h1>
            <p className="text-[var(--text-secondary)] text-sm">
              تسجيل الدخول لصفحة التحكم
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {/* Username */}
            <div className="flex flex-col gap-2">
              <label className="text-[var(--text-secondary)] text-sm font-medium">
                اسم المستخدم
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                placeholder="admin"
                disabled={loading || success}
                className="input-field"
                style={{ paddingRight: "16px", paddingLeft: "16px" }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[var(--text-secondary)] text-sm font-medium">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={loading || success}
                  className="input-field w-full"
                  // فرض المسافة من اليسار لأيقونة العين ومن اليمين لبداية النص
                  style={{ paddingLeft: "44px", paddingRight: "16px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  disabled={loading || success}
                  // نقل الأيقونة لليسار بدلاً من اليمين لتناسب الـ RTL
                  className="absolute left-3.5 top-1/2 -translate-y-1/2
                             text-[var(--text-muted)] hover:text-[var(--text-secondary)]
                             transition-colors"
                  aria-label={showPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl
                             bg-red-950/50 border border-red-800/60 text-red-400 text-sm overflow-hidden"
                >
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl
                             bg-green-950/50 border border-green-800/60 text-green-400 text-sm overflow-hidden"
                >
                  <ShieldCheck size={15} className="flex-shrink-0" />
                  تم منح الصلاحية — جاري التحويل...
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading || success}
              whileTap={{ scale: 0.97 }}
              className="h-12 w-full rounded-xl bg-[var(--accent-primary)] text-white
                         font-semibold text-sm flex items-center justify-center gap-2.5
                         hover:bg-[var(--accent-hover)] transition-colors duration-200
                         disabled:opacity-60 disabled:cursor-not-allowed
                         shadow-glow btn-glow"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  جاري التحقق...
                </>
              ) : success ? (
                <>
                  <ShieldCheck size={18} />
                  تم منح الصلاحية
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  تسجيل الدخول
                </>
              )}
            </motion.button>
          </form>

          {/* Subtle security note */}
          <p className="text-center text-xs text-[var(--text-muted)] mt-6 font-mono">
            اي اللي جايبك هنا يا صحبي كدا كدا حركتك متسجلة
          </p>
        </div>

        {/* Decorative corner lines (تم عكسها لتعطي جمالية متناسقة مع الاتجاه العربي) */}
        <div className="absolute -top-px -right-px w-8 h-8 border-t-2 border-r-2 border-[var(--accent-primary)] rounded-tr-2xl opacity-50" />
        <div className="absolute -bottom-px -left-px w-8 h-8 border-b-2 border-l-2 border-[var(--accent-primary)] rounded-bl-2xl opacity-50" />
      </motion.div>
    </div>
  );
}