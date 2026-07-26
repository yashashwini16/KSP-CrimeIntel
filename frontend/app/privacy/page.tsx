"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
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
          KSP CrimeIntel Security
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6">Privacy Policy</h1>
        
        <div className="space-y-6 text-white/70 leading-relaxed">
          <p>
            At CrimeIntel, built by Team <strong>buddhijaala</strong>, we prioritize data privacy and compliance. This policy outlines how information is securely handled within our platform.
          </p>
          
          <h2 className="text-xl font-bold text-white mt-8">1. Data Encryption & Storage</h2>
          <p>
            All crime record databases (including mock datasets and legacy uploads) are hosted securely within Zoho Catalyst Cloud Scale Datastores. Data in transit is fully encrypted using standard secure protocols (HTTPS/SSL).
          </p>
          
          <h2 className="text-xl font-bold text-white mt-8">2. Immutable Audit Logging</h2>
          <p>
            For compliance and security purposes, all user actions within this platform (including login attempts, case lookups, and downloads) are logged into an immutable audit trail system. This ensures operational accountability and prevents unauthorized data leaks.
          </p>
          
          <h2 className="text-xl font-bold text-white mt-8">3. Access Controls</h2>
          <p>
            Access to data is restricted strictly based on your role (Investigator, Supervisor, Analyst, Policymaker). Users can only view datasets relevant to their operational authorization.
          </p>
        </div>
      </div>
      
      <footer className="mt-16 text-center text-xs text-white/30 max-w-3xl mx-auto w-full border-t border-white/10 pt-8">
        Karnataka State Police © 2026 · Powered by Team buddhijaala
      </footer>
    </main>
  );
}
