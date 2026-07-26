"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function AboutPage() {
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
          KSP CrimeIntel Platform
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6">About Us</h1>
        
        <div className="space-y-6 text-white/70 leading-relaxed">
          <p>
            Welcome to KSP CrimeIntel, an advanced spatiotemporal analytics and intelligence platform built exclusively for the Karnataka State Police (KSP) Datathon 2026.
          </p>
          
          <h2 className="text-xl font-bold text-white mt-8">Our Team: buddhijaala</h2>
          <p>
            We are <strong>buddhijaala</strong> (meaning &quot;Intellectual Web&quot;), a team of passionate engineers committed to solving modern-day societal and law enforcement challenges using bleeding-edge technology.
          </p>
          <p>
            Our core mission is to bring high-performance analytics, interactive relationship mapping, and state-of-the-art AI tooling to law enforcement agencies, empowering them to make faster, data-driven decisions that build a safer Karnataka.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">Our Vision</h2>
          <p>
            By leveraging Zoho Catalyst serverless infrastructure, ZCQL datastores, and integrated LLM solutions, we build secure, compliant, and highly operational workspaces designed specifically for different echelons of law enforcement.
          </p>
        </div>
      </div>
      
      <footer className="mt-16 text-center text-xs text-white/30 max-w-3xl mx-auto w-full border-t border-white/10 pt-8">
        Karnataka State Police © 2026 · Powered by Team buddhijaala
      </footer>
    </main>
  );
}
