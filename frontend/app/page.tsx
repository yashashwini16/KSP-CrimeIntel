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

      {/* Role-Based Workspaces Section */}
      <section className="relative z-10 container mx-auto px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Workspace Segregation & Security
            </h2>
            <p className="text-white/60 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
              CrimeIntel isolates access using strict Role-Based Access Control (RBAC) to ensure operational security, chain of custody integrity, and role-specific utility.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                role: 'Investigator Workspace',
                why: 'Field officers require rapid case retrieval and contextual summaries without distraction.',
                features: [
                  'AI Chat: Natural language querying powered by Gemini AI',
                  'Cases: Detailed view and benzer/similar case identification',
                  'Network: Dynamic co-offender relationship diagrams',
                  'Offenders: Comprehensive history and risk profiling'
                ]
              },
              {
                role: 'Supervisor Control',
                why: 'Command staff need centralized oversight of database changes and system auditability.',
                features: [
                  'Dashboard: Real-time precinct metric summaries',
                  'Cases: Complete database visibility and review',
                  'Audit Log: Track system compliance and actions',
                  'Import Excel: Batch ingest legacy crime datasets',
                  'Alerts: High-severity system anomaly triggers'
                ]
              },
              {
                role: 'Analyst Dashboard',
                why: 'Intelligence divisions need advanced spatial and relational tools to map criminal patterns.',
                features: [
                  'Dashboard: Analytics summary and crime tracking',
                  'Crime Map: GIS spatiotemporal hotspot heatmaps',
                  'Network: Deep co-offender relation graphing',
                  'Cases: Full analytical case database access',
                  'Forecast: Emerging crime trend projections'
                ]
              },
              {
                role: 'Policymaker Portal',
                why: 'Executive leadership needs macro trends to design preventative state-wide strategies.',
                features: [
                  'Dashboard: Strategic overview of state crime metrics',
                  'Crime Map: High-level district hotspot distribution',
                  'Forecast: Predictive crime volume forecasting models'
                ]
              }
            ].map(r => (
              <div key={r.role} className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 p-8 hover:border-ksp-saffron/30 transition-all duration-300">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">{r.role}</h3>
                    <div className="mb-6">
                      <span className="text-xs uppercase font-semibold text-ksp-saffron tracking-wider block mb-1">Operational Purpose</span>
                      <p className="text-sm text-white/70 leading-relaxed">{r.why}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs uppercase font-semibold text-white/40 tracking-wider block mb-2">Core Capabilities</span>
                    <ul className="space-y-2">
                      {r.features.map((f, i) => (
                        <li key={i} className="text-sm text-white/50 flex items-start gap-2">
                          <span className="text-ksp-saffron mt-1.5 h-1.5 w-1.5 rounded-full bg-ksp-saffron flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Startup Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/40 pt-16 pb-8">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold text-white mb-3">Karnataka State Police</h3>
              <p className="text-sm text-white/50 max-w-sm mb-4 leading-relaxed">
                CrimeIntel Intelligence Platform. Secure, role-based analytics enabling spatiotemporal analysis and proactive law enforcement tracking.
              </p>
              <div className="text-xs text-white/30">
                Authorized personnel usage only. Activities are subject to compliance auditing.
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li><a href="/login.html" className="hover:text-white transition-colors">Case Management</a></li>
                <li><a href="/login.html" className="hover:text-white transition-colors">GIS Hotspot Map</a></li>
                <li><a href="/login.html" className="hover:text-white transition-colors">Network Graphs</a></li>
                <li><a href="/login.html" className="hover:text-white transition-colors">Crime Forecasting</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li><a href="/about.html" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="/privacy.html" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms.html" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/contact.html" className="hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/40">
              Karnataka State Police © 2026 · Powered by Zoho Catalyst AppSail & Slate
            </p>
            <div className="flex gap-6 text-xs text-white/40">
              <a href="/privacy.html" className="hover:text-white transition-colors">Security Policy</a>
              <a href="/privacy.html" className="hover:text-white transition-colors">Audit Compliance</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
