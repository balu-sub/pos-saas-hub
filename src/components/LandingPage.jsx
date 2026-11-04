import React, { useState } from 'react';
import {
  Laptop,
  Cpu,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Server,
  Zap,
  Printer,
  Scale,
  Barcode,
  Cloud,
  Check,
  Sparkles,
  Play,
  Layers,
  Database
} from 'lucide-react';

export default function LandingPage({ onOpenAuth }) {
  const [activeWorkflowTab, setActiveWorkflowTab] = useState('scan');

  return (
    <div className="min-h-screen bg-[#FDFDFE] text-[#0F172A] flex flex-col font-sans selection:bg-[#00478c] selection:text-white">
      {/* 1. Sticky Floating Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer">
            <img
              src="/Logo.png"
              alt="Plannest POS"
              className="h-14 md:h-16 w-auto max-w-[260px] object-contain"
              loading="eager"
            />
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#platform" className="hover:text-[#00478c] transition">Platform</a>
            <a href="#workflow" className="hover:text-[#00478c] transition">Workflow</a>
            <a href="#peripherals" className="hover:text-[#00478c] transition">Peripherals</a>
            <a href="#pricing" className="hover:text-[#00478c] transition">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAuth('signin')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-4 py-2 text-xs font-bold bg-[#00478c] hover:bg-[#003870] text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <span>Sign Up</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-14 md:pt-22 md:pb-20 overflow-hidden bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F5F9]/50 border-b border-slate-200/60">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100/90 border border-slate-200 text-slate-700 text-xs font-medium mb-6 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>High-Speed Retail Billing &amp; Offline SQLite Engine</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12] max-w-4xl mx-auto">
            The ultra-fast, offline-first POS for modern supermarkets.
          </h1>

          <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Eliminate checkout queues with 0.3s barcode scans, instant RS232 auto-tare digital scales, and 100% local database autonomy that never stops when internet drops.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-6 py-3.5 text-sm font-bold bg-[#00478c] hover:bg-[#003870] text-white rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <span>Get Started with Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Micro Benefits Checkmarks */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>1-Click Windows &amp; Linux installer</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>0.3s Barcode scan response</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Zero cloud downtime risk</span>
            </div>
          </div>

          {/* POS Terminal Screenshot Preview */}
          <div className="mt-12 relative rounded-2xl p-2 bg-gradient-to-b from-slate-200/80 to-slate-300/40 border border-slate-300/60 shadow-2xl">
            <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
              <img
                src="/screenshot-pos.png"
                alt="Plannest POS Terminal Interface"
                className="w-full h-auto object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Platform Architecture Tiers */}
      <section id="platform" className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00478c]">Multi-Tier Hardware Architecture</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">One Unified Cloud, Every Terminal Type</h2>
            <p className="text-slate-600 text-sm mt-2">
              Whether you run a touchscreen Windows terminal with dual thermal printers, an embedded ESP32 CrowPanel counter, or an Android floor tablet, Plannest connects them all.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#00478c] flex items-center justify-center mb-4">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Windows PC POS (Pro)</h3>
              <p className="text-xs text-slate-500 mt-1">High-throughput checkout lanes &amp; supermarkets</p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Zero-latency embedded SQLite</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> RS232 auto-tare digital scales</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> ESC/POS 58mm/80mm thermal receipts</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Single-terminal machine license locking</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">CrowPanel ESP32 (Lite)</h3>
              <p className="text-xs text-slate-500 mt-1">Dedicated embedded 7.0" hardware counter</p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Direct Supabase REST synchronization</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> 170+ items grocery/produce catalog</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Ultra-low power consumption (&lt; 5W)</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Cloud manager at poslite.plannestapp.com</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Android Tablet POS</h3>
              <p className="text-xs text-slate-500 mt-1">Mobile waitstaff &amp; floor queue-busting</p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Bluetooth mobile thermal printing</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Barcode scanning via device camera</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Offline IndexedDB cache</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Central fleet management</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00478c]">Straightforward Pricing</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Transparent Plans for Independent Retailers</h2>
            <p className="text-slate-600 text-sm mt-2">
              Every plan includes offline billing capability, inventory management, and automatic cloud backup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Lite Embedded</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">CrowPanel Hardware</h3>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-slate-900">₹499</span>
                  <span className="text-xs text-slate-500"> / month / terminal</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> poslite.plannestapp.com access</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Direct Supabase cloud sync</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Firmware OTA updates</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuth('signup')}
                className="mt-8 w-full py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
              >
                Choose Lite
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border-2 border-[#00478c] shadow-lg relative flex flex-col justify-between">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#00478c] text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                Most Popular
              </span>
              <div>
                <span className="text-xs font-bold text-[#00478c] uppercase">Windows POS Pro</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Local Terminal</h3>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-slate-900">₹1,299</span>
                  <span className="text-xs text-slate-500"> / month / store</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Full Windows offline billing terminal</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> pospro.plannestapp.com cloud manager</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Single-terminal machine license &amp; MAC lock</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> RS232 auto-tare digital scale driver</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuth('signup')}
                className="mt-8 w-full py-2.5 rounded-xl text-xs font-bold bg-[#00478c] hover:bg-[#003870] text-white transition shadow-sm"
              >
                Start Free Trial
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-purple-600 uppercase">Enterprise Fleet</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Multi-Store Chain</h3>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-slate-900">₹2,499</span>
                  <span className="text-xs text-slate-500"> / month / chain</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Unlimited mixed terminals (ESP + Windows)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> pos.plannestapp.com Master SaaS Hub</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Live fleet telemetry &amp; heartbeat tracking</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuth('signup')}
                className="mt-8 w-full py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
              >
                Contact Enterprise
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Minimalist Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Plannest POS</span>
            <span>•</span>
            <span>pos.plannestapp.com</span>
            <span>•</span>
            <button
              onClick={() => onOpenAuth('admin')}
              className="text-slate-400 hover:text-purple-600 font-semibold transition underline cursor-pointer"
            >
              Super Admin Cockpit
            </button>
          </div>
          <p>© 2026 Plannest Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
