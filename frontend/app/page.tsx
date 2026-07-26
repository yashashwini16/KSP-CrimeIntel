import Link from "next/link";
import Image from "next/image";
import { Activity, Database, MapPinned, Network, Shield, ArrowRight, Upload, Bell } from "lucide-react";

const stats = [
  { label: "Active Districts", value: "5", icon: MapPinned },
  { label: "Seeded FIR Records", value: "40+", icon: Activity },
  { label: "Accused Profiles", value: "30+", icon: Database },
  { label: "Criminal Network Links", value: "30+", icon: Network },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-ksp-navy text-foreground relative overflow-hidden flex flex-col justify-between">
      {/* Background patterns */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-ksp-saffron/10 blur-3xl" />

      {/* Header Bar */}
      <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10">
            <Image
              src="/ksp-logo.png"
              alt="KSP Badge"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ksp-saffron">
              ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್
            </p>
            <p className="text-sm font-bold text-white">Karnataka State Police</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/login.html"
            className="rounded-lg bg-ksp-saffron px-4 py-2 text-xs font-bold text-ksp-navy shadow-md hover:bg-ksp-saffron/90 transition-all"
          >
            Officer Sign In
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-16 text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-ksp-saffron/30 bg-ksp-saffron/10 px-4 py-1.5 text-xs font-semibold text-ksp-saffron mb-6">
          <Shield className="h-4 w-4" />
          State Crime Records Bureau (SCRB) Intelligence System
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          KSP <span className="text-ksp-saffron">CrimeIntel</span> Platform
        </h1>

        <p className="mt-4 text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
          AI-driven spatiotemporal analytics, repeat offender network mapping, QuickML predictive forecasting, and legacy Excel dataset ingestion.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a 
            href="/login.html"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-ksp-saffron px-8 py-4 text-base font-bold text-ksp-navy shadow-xl hover:bg-ksp-saffron/90 hover:scale-105 transition-all w-full sm:w-auto"
          >
            Access Intelligence Platform
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 container mx-auto px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3 text-white/60">
                <p className="text-xs font-semibold uppercase tracking-wider">{label}</p>
                <Icon className="h-5 w-5 text-ksp-saffron" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-white">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-white/5 py-4 text-center text-xs text-white/40">
        Karnataka State Police © 2025 · Powered by Zoho Catalyst AppSail & Slate
      </footer>
    </main>
  );
}
