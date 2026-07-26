"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { useLocale, t } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const { locale } = useLocale();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/dashboard.html";
    }
  }, [isAuthenticated, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError(t("auth.invalid", locale));
      } else {
        setError(t("common.error", locale));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-ksp-navy">
      {/* Animated background grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Glowing orbs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-ksp-saffron/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        {/* KSP Logo + Title */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="relative h-20 w-20 drop-shadow-[0_0_24px_rgba(255,153,0,0.4)]">
            <Image
              src="/ksp-logo.png"
              alt="Karnataka State Police"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ksp-saffron">
              ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್
            </p>
            <h1 className="mt-1 text-2xl font-bold text-white">
              Karnataka State Police
            </h1>
            <p className="mt-0.5 text-sm text-white/50">
              CrimeIntel Intelligence Platform
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mb-6 h-px bg-gradient-to-r from-transparent via-ksp-saffron/40 to-transparent" />

        {/* Error alert */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="block text-xs font-semibold uppercase tracking-widest text-white/60"
            >
              {t("auth.username", locale)}
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your badge ID"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-ksp-saffron/50 focus:outline-none focus:ring-1 focus:ring-ksp-saffron/50 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-widest text-white/60"
            >
              {t("auth.password", locale)}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-ksp-saffron/50 focus:outline-none focus:ring-1 focus:ring-ksp-saffron/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-ksp-saffron px-4 py-2.5 text-sm font-bold text-ksp-navy shadow-lg shadow-ksp-saffron/20 transition-all hover:bg-ksp-saffron/90 hover:shadow-ksp-saffron/30 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : t("auth.login", locale)}
          </button>
        </form>

        {/* Demo credentials hint */}
        <p className="mt-4 text-center text-[11px] text-white/30">
          Demo: <span className="text-white/50">admin</span> / <span className="text-white/50">admin</span>
        </p>

        {/* Footer */}
        <p className="mt-6 text-center text-[10px] text-white/20">
          Secured by Zoho Catalyst · Karnataka State Police © 2025
        </p>
      </div>
    </div>
  );
}
