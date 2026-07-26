"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Shield } from "lucide-react";

export default function ContactPage() {
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
          KSP CrimeIntel Support
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6">Contact Support</h1>
        
        <div className="space-y-6 text-white/70 leading-relaxed">
          <p>
            If you experience issues accessing your role-based workspace or require technical assistance with the KSP CrimeIntel platform, please reach out to Team <strong>buddhijaala</strong>.
          </p>
          
          <h2 className="text-xl font-bold text-white mt-8">Support Channels</h2>
          
          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <div className="border border-white/10 bg-white/5 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-white mb-2">Yashaswini B</h3>
                <p className="text-sm text-white/50 mb-4">Lead Developer & Integration Specialist</p>
              </div>
              <a 
                href="mailto:yashaswinib1603@gmail.com" 
                className="inline-flex items-center gap-2 text-sm text-ksp-saffron hover:underline"
              >
                <Mail className="h-4 w-4" />
                yashaswinib1603@gmail.com
              </a>
            </div>
            
            <div className="border border-white/10 bg-white/5 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-white mb-2">Vinay</h3>
                <p className="text-sm text-white/50 mb-4">Backend Architect & Security Engineer</p>
              </div>
              <a 
                href="mailto:vinay1359b@gmail.com" 
                className="inline-flex items-center gap-2 text-sm text-ksp-saffron hover:underline"
              >
                <Mail className="h-4 w-4" />
                vinay1359b@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="mt-16 text-center text-xs text-white/30 max-w-3xl mx-auto w-full border-t border-white/10 pt-8">
        Karnataka State Police © 2026 · Powered by Team buddhijaala
      </footer>
    </main>
  );
}
