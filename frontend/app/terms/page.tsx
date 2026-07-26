"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-ksp-navy via-slate-900 to-black text-white px-6 py-16 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-ksp-saffron transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        
        <div className="inline-flex items-center gap-2 rounded-full border border-ksp-saffron/30 bg-ksp-saffron/10 px-4 py-1.5 text-xs font-semibold text-ksp-saffron mb-6">
          <Shield className="h-4 w-4" />
          KSP CrimeIntel Terms
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6">Terms of Service</h1>
        
        <div className="space-y-6 text-white/70 leading-relaxed">
          <p>
            Please read these Terms of Service carefully before accessing the KSP CrimeIntel platform created by Team <strong>buddhijaala</strong>.
          </p>
          
          <h2 className="text-xl font-bold text-white mt-8">1. Authorized Use Only</h2>
          <p>
            This intelligence system is intended strictly for authorized law enforcement personnel belonging to the Karnataka State Police. Unauthorized access, sharing of login credentials, or copying of intelligence data is strictly prohibited and subject to legal prosecution.
          </p>
          
          <h2 className="text-xl font-bold text-white mt-8">2. Account Responsibility</h2>
          <p>
            Users are solely responsible for all activities conducted under their specific role credentials. Password credentials (e.g. for Investigators, Analysts, Supervisors, and Policymakers) must be kept secure at all times.
          </p>
          
          <h2 className="text-xl font-bold text-white mt-8">3. Compliance Audits</h2>
          <p>
            By accessing this platform, you consent to continuous, immutable compliance auditing of all actions and queries performed within the platform.
          </p>
        </div>
      </div>
      
      <footer className="mt-16 text-center text-xs text-white/30 max-w-3xl mx-auto w-full border-t border-white/10 pt-8">
        Karnataka State Police © 2026 · Powered by Team buddhijaala
      </footer>
    </main>
  );
}
