import React, { useState } from 'react';
import { supabase } from '../supabase';
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
  Database,
  Phone,
  Mail,
  Send,
  MessageSquare,
  Building,
  User,
  MapPin,
  Clock,
  HelpCircle,
  CheckCircle
} from 'lucide-react';

export default function LandingPage({ onOpenAuth }) {
  const [activeWorkflowTab, setActiveWorkflowTab] = useState('scan');

  // Contact for Pricing & Details Form State
  const [submittedData, setSubmittedData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    phone: '',
    email: '',
    city: '',
    storeType: 'Supermarket & Grocery',
    counterCount: '1 Counter',
    hardwareRequirements: ['Windows POS Terminal', '80mm Thermal Printer'],
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleCheckboxToggle = (hw) => {
    setFormData((prev) => {
      const exists = prev.hardwareRequirements.includes(hw);
      return {
        ...prev,
        hardwareRequirements: exists
          ? prev.hardwareRequirements.filter((h) => h !== hw)
          : [...prev.hardwareRequirements, hw],
      };
    });
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      if (!formData.fullName.trim() || !formData.phone.trim() || !formData.businessName.trim()) {
        throw new Error('Please fill in your name, store name, and contact phone number.');
      }

      const inquiryId = `INQ-${Date.now().toString().slice(-5)}`;
      const { error } = await supabase.from('stores').insert([
        {
          id: inquiryId,
          name: formData.businessName.trim(),
          phone: formData.phone.trim(),
          address_line1: formData.city.trim() || 'India',
          apptype: 'pricing_inquiry',
          bill_prefix: 'INQ',
          starting_bill_no: 1,
          is_active: false,
          bill_config: {
            contact_person: formData.fullName.trim(),
            email: formData.email.trim(),
            city: formData.city.trim(),
            store_type: formData.storeType,
            counter_count: formData.counterCount,
            hardware_requirements: formData.hardwareRequirements.join(', '),
            notes: formData.notes.trim(),
            source: 'pos.plannestapp.com landing contact form',
            requested_at: new Date().toISOString(),
          },
        },
      ]);

      if (error) throw error;
      setSubmittedData({
        ...formData,
        inquiryId,
        submittedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      });
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <a href="#contact-pricing" className="hover:text-[#00478c] transition">Pricing &amp; Quote</a>
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
              onClick={() => {
                const el = document.getElementById('contact-pricing');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 text-sm font-bold bg-[#00478c] hover:bg-[#003870] text-white rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <span>Ask for Demonstration</span>
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

      {/* 4. Pricing & Details Contact Form Section */}
      <section id="contact-pricing" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00478c] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Custom Quote &amp; Demo
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Request Pricing &amp; System Details
            </h2>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              Every retail store has unique counter, weighing scale, and multi-terminal requirements. 
              Fill in your details below and our retail specialist will provide customized plan pricing, 
              hardware compatibility notes, and an instant demonstration.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-start">
            {/* Left: Contact & Price Request Form */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#00478c] via-blue-600 to-indigo-600"></div>

              {submitSuccess && submittedData ? (
                <div className="py-6 space-y-5 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900">
                    <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0" />
                    <div>
                      <h3 className="text-base font-extrabold text-emerald-950">Demonstration Request Submitted!</h3>
                      <p className="text-xs text-emerald-800">
                        Thank you! We have logged your store specification. Our technical specialist will contact you with pricing and schedule your live trial.
                      </p>
                    </div>
                  </div>

                  {/* Submitted Details Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#00478c]" />
                        <span>Submitted Store Specification</span>
                      </span>
                      <span className="font-mono text-[11px] px-2 py-0.5 bg-blue-100 text-[#00478c] rounded font-bold">
                        {submittedData.inquiryId}
                      </span>
                    </div>
                    <table className="w-full text-xs divide-y divide-slate-100">
                      <tbody className="divide-y divide-slate-100">
                        <tr className="divide-x divide-slate-100">
                          <td className="px-3.5 py-2.5 bg-slate-50/70 font-semibold text-slate-600 w-1/3">Store / Business Name</td>
                          <td className="px-3.5 py-2.5 font-bold text-slate-900">{submittedData.businessName}</td>
                        </tr>
                        <tr className="divide-x divide-slate-100">
                          <td className="px-3.5 py-2.5 bg-slate-50/70 font-semibold text-slate-600">Contact Person</td>
                          <td className="px-3.5 py-2.5 font-medium text-slate-800">{submittedData.fullName}</td>
                        </tr>
                        <tr className="divide-x divide-slate-100">
                          <td className="px-3.5 py-2.5 bg-slate-50/70 font-semibold text-slate-600">Phone / WhatsApp</td>
                          <td className="px-3.5 py-2.5 font-mono font-bold text-[#00478c]">{submittedData.phone}</td>
                        </tr>
                        {submittedData.email && (
                          <tr className="divide-x divide-slate-100">
                            <td className="px-3.5 py-2.5 bg-slate-50/70 font-semibold text-slate-600">Official Email</td>
                            <td className="px-3.5 py-2.5 text-slate-700">{submittedData.email}</td>
                          </tr>
                        )}
                        <tr className="divide-x divide-slate-100">
                          <td className="px-3.5 py-2.5 bg-slate-50/70 font-semibold text-slate-600">City / Location</td>
                          <td className="px-3.5 py-2.5 text-slate-700">{submittedData.city || 'India'}</td>
                        </tr>
                        <tr className="divide-x divide-slate-100">
                          <td className="px-3.5 py-2.5 bg-slate-50/70 font-semibold text-slate-600">Retail Store Type</td>
                          <td className="px-3.5 py-2.5 text-slate-700">{submittedData.storeType}</td>
                        </tr>
                        <tr className="divide-x divide-slate-100">
                          <td className="px-3.5 py-2.5 bg-slate-50/70 font-semibold text-slate-600">Billing Counters</td>
                          <td className="px-3.5 py-2.5 font-bold text-slate-800">{submittedData.counterCount}</td>
                        </tr>
                        <tr className="divide-x divide-slate-100">
                          <td className="px-3.5 py-2.5 bg-slate-50/70 font-semibold text-slate-600">Selected Hardware</td>
                          <td className="px-3.5 py-2.5 text-slate-700">
                            {submittedData.hardwareRequirements?.length > 0
                              ? submittedData.hardwareRequirements.join(', ')
                              : 'Standard PC POS'}
                          </td>
                        </tr>
                        {submittedData.notes && (
                          <tr className="divide-x divide-slate-100">
                            <td className="px-3.5 py-2.5 bg-slate-50/70 font-semibold text-slate-600">Specific Notes</td>
                            <td className="px-3.5 py-2.5 text-slate-700 italic">{submittedData.notes}</td>
                          </tr>
                        )}
                        <tr className="divide-x divide-slate-100">
                          <td className="px-3.5 py-2.5 bg-slate-50/70 font-semibold text-slate-600">Status</td>
                          <td className="px-3.5 py-2.5">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" />
                              <span>Queued for Demonstration</span>
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitSuccess(false);
                        setSubmittedData(null);
                        setFormData({
                          fullName: '',
                          businessName: '',
                          phone: '',
                          email: '',
                          city: '',
                          storeType: 'Supermarket & Grocery',
                          counterCount: '1 Counter',
                          hardwareRequirements: ['Windows POS Terminal', '80mm Thermal Printer'],
                          notes: '',
                        });
                      }}
                      className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                    >
                      Submit Another Store Inquiry
                    </button>
                    <span className="text-[11px] text-slate-400">Ref: {submittedData.inquiryId}</span>
                  </div>
                </div>) : (
                <form onSubmit={handleInquirySubmit} className="space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Tell Us About Your Store</h3>
                    <p className="text-xs text-slate-500">We will tailor the pricing and terminal options specifically for your counter setup.</p>
                  </div>

                  {submitError && (
                    <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
                      {submitError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00478c]/20 focus:border-[#00478c] outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Business / Store Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={formData.businessName}
                          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                          placeholder="e.g. Fresh Daily Supermarket"
                          className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00478c]/20 focus:border-[#00478c] outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone / WhatsApp Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00478c]/20 focus:border-[#00478c] outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Official Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. contact@freshdaily.in"
                          className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00478c]/20 focus:border-[#00478c] outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        City / Outlet Location
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="e.g. Chennai, Tamil Nadu"
                          className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00478c]/20 focus:border-[#00478c] outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Retail Store Type
                      </label>
                      <select
                        value={formData.storeType}
                        onChange={(e) => setFormData({ ...formData, storeType: e.target.value })}
                        className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00478c]/20 focus:border-[#00478c] outline-hidden bg-white"
                      >
                        <option value="Supermarket & Grocery">Supermarket &amp; Grocery</option>
                        <option value="Fruits & Mandi Produce">Fruits &amp; Mandi Fresh Produce</option>
                        <option value="Bakery & Sweets">Bakery &amp; Sweets</option>
                        <option value="Restaurant & QSR">Restaurant &amp; Quick Service Food</option>
                        <option value="Departmental / General Store">Departmental / General Store</option>
                        <option value="Apparel & Footwear">Apparel &amp; Footwear</option>
                        <option value="Other Retail">Other Retail Business</option>
                      </select>
                    </div>
                  </div>

                  {/* Counter count selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Number of Billing Counters
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['1 Counter', '2 - 3 Counters', '4 - 8 Counters', 'Multi-Store Chain'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFormData({ ...formData, counterCount: c })}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-center cursor-pointer ${
                            formData.counterCount === c
                              ? 'bg-[#00478c] text-white border-[#00478c] shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hardware & Peripheral interests */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Required Devices &amp; Peripherals (Select all that apply)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        'Windows POS Terminal (Local PC)',
                        'Digital Weighing Scale (RS232 Auto-Tare)',
                        '80mm Thermal Receipt Printer',
                        'CrowPanel Hardware (ESP Touch POS)',
                        'Handheld 1D/2D Barcode Scanner',
                        'Customer Display Kiosk'
                      ].map((hw) => {
                        const checked = formData.hardwareRequirements.includes(hw);
                        return (
                          <label
                            key={hw}
                            onClick={() => handleCheckboxToggle(hw)}
                            className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none transition ${
                              checked
                                ? 'bg-blue-50/60 border-blue-300 text-slate-900 font-semibold'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {}}
                              className="rounded text-[#00478c] focus:ring-0"
                            />
                            <span className="text-[11px]">{hw}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes / Special requirements */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Specific Inquiries or Existing Hardware Setup (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="e.g. We currently use Essae digital scales and require offline billing with cloud sync for 2 counters."
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00478c]/20 focus:border-[#00478c] outline-hidden"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-[#00478c] hover:bg-[#003870] text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Sending Your Request...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Request Pricing &amp; System Details</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-slate-400">
                    🔒 No spam. Your information is kept strictly confidential and used only to prepare your customized retail quotation.
                  </p>
                </form>
              )}
            </div>

            {/* Right: Why Choose Plannest + Direct Contact Sidebar */}
            <div className="lg:col-span-5 space-y-6">
              {/* Process Highlights Card */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>What You Receive</span>
                </h3>

                <ul className="space-y-4 text-xs">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#00478c] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                      1
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-bold">Custom Counter Pricing</strong>
                      <span className="text-slate-500">Transparent pricing for single counter or multi-terminal chains with zero hidden charges.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#00478c] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                      2
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-bold">Hardware Compatibility Assessment</strong>
                      <span className="text-slate-500">We verify your existing PCs, thermal printers, barcode scanners, and weighing scale models.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#00478c] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                      3
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-bold">Free Live Demonstration &amp; Trial</strong>
                      <span className="text-slate-500">Test the lightning-fast offline billing terminal on your computer before making any commitment.</span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Hardware & Terminal Compatibility Matrix Table */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-[#00478c]" />
                    <span>Hardware Compatibility Matrix</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Plug &amp; Play Ready
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">Terminal Type</th>
                        <th className="px-3 py-2">Weighing Scale</th>
                        <th className="px-3 py-2">Printer &amp; Scanner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      <tr>
                        <td className="px-3 py-2.5 font-bold text-slate-900">
                          Windows Touch POS
                          <span className="block text-[10px] text-slate-500 font-normal">Offline SQLite</span>
                        </td>
                        <td className="px-3 py-2.5">
                          RS232 Auto-Tare
                          <span className="block text-[10px] text-emerald-600 font-semibold">Essae, Phoenix</span>
                        </td>
                        <td className="px-3 py-2.5">
                          80mm ESC/POS
                          <span className="block text-[10px] text-slate-500 font-normal">2D QR &amp; Barcode</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2.5 font-bold text-slate-900">
                          CrowPanel ESP32
                          <span className="block text-[10px] text-slate-500 font-normal">7.0" Embedded</span>
                        </td>
                        <td className="px-3 py-2.5">
                          USB Scale Hub
                          <span className="block text-[10px] text-slate-500 font-normal">Direct Weight Read</span>
                        </td>
                        <td className="px-3 py-2.5">
                          58mm Thermal
                          <span className="block text-[10px] text-slate-500 font-normal">Instant Slip Print</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2.5 font-bold text-slate-900">
                          Multi-Counter Chain
                          <span className="block text-[10px] text-slate-500 font-normal">2 to 8+ Lanes</span>
                        </td>
                        <td className="px-3 py-2.5">
                          Multi-Lane Tare
                          <span className="block text-[10px] text-slate-500 font-normal">Central Price Sync</span>
                        </td>
                        <td className="px-3 py-2.5">
                          Kiosk &amp; Cash Drawer
                          <span className="block text-[10px] text-slate-500 font-normal">RJ11 Auto Kickout</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Our engineers verify and configure your exact hardware brands before deployment so you can start billing immediately.
                </p>
              </div>
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
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/help/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-[#00478c] font-semibold underline"
            >
              Operator Help &amp; User Guide
            </a>
            <span>•</span>
            <a
              href="/help/index.html#help-mod-08-terms-conditions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-[#00478c] font-semibold underline"
            >
              Terms &amp; Conditions (India)
            </a>
          </div>
          <p>© 2026 Plannest Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
