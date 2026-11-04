import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import {
  Download,
  Laptop,
  Cpu,
  Key,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  AlertTriangle,
  HardDrive,
  Terminal,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function StoreOwnerPortal({ session, onLogout }) {
  const store = session.store || {};
  const storeId = session.storeId || store.id || 'STORE-002';
  const apptype = session.apptype || store.apptype || 'windows';
  const isWindows = apptype === 'windows';
  const isEsp = apptype === 'esp';

  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Fetch license for this store from Supabase
  const fetchLicense = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saas_licenses')
        .select('*')
        .eq('user_id', storeId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setLicense(data);
      } else {
        setLicense(null);
      }
    } catch (err) {
      console.error('License fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicense();
  }, [storeId]);

  const handleCopyKey = () => {
    if (!license?.license_key) return;
    navigator.clipboard.writeText(license.license_key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const installCommand = `powershell -ExecutionPolicy Bypass -Command "iwr -useb https://pos.plannestapp.com/install.ps1 | iex"`;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(installCommand);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  const handleResetHardwareLock = async () => {
    if (!window.confirm('Are you sure you want to unbind the current terminal? The next machine you launch will claim this license.')) {
      return;
    }
    setLoading(true);
    try {
      await supabase
        .from('saas_licenses')
        .update({ hardware_uuid: null })
        .eq('id', license.id);

      setResetSuccess(true);
      fetchLicense();
      setTimeout(() => setResetSuccess(false), 3000);
    } catch (err) {
      alert('Error resetting hardware lock: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const portalDomain = isEsp ? 'https://poslite.plannestapp.com' : 'https://pospro.plannestapp.com';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/Logo.png" alt="Plannest POS" className="h-12 w-auto object-contain" />
            <div className="border-l border-slate-200 pl-3">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">{store.name || 'Store Portal'}</span>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {storeId}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                {isWindows ? 'Windows POS Pro Store' : 'CrowPanel ESP Hardware Store'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={portalDomain}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-[#00478c] hover:bg-[#003870] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <span>Open Store Manager ({isEsp ? 'poslite' : 'pospro'})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner: Quick Link to Cloud Manager */}
        <div className="bg-gradient-to-r from-[#00478c] to-[#00305e] text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider">
              {isWindows ? 'Windows POS Pro Active' : 'CrowPanel ESP Active'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">
              Welcome, {store.name || 'Store Owner'}!
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
              Manage your live product catalog, daily sales invoices, and PDF export anytime from your Cloud Manager at{' '}
              <strong className="underline">{portalDomain.replace('https://', '')}</strong>.
            </p>
          </div>

          <a
            href={portalDomain}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 bg-white text-[#00478c] hover:bg-blue-50 font-bold rounded-xl shadow-md text-xs transition flex items-center justify-center gap-2 shrink-0"
          >
            <span>Launch Cloud Manager</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* SECTION 1: DOWNLOAD & 1-CLICK INSTALLATION CENTER (FOR WINDOWS POS) */}
        {isWindows && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Download className="w-5 h-5 text-[#00478c]" />
                  <span>Terminal App Download &amp; Re-Installation</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Download or restore the offline billing terminal on your counter PC anytime without data loss.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Windows 10 / 11 64-bit Ready
              </span>
            </div>

            {/* Graphical Windows Installer Download Card */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50/60 rounded-2xl border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">Plannest POS Windows Installer</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#00478c]">
                    PlannestPOS-Setup.exe
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-lg">
                  Single-click graphical installer. Double-click to run, choose your install folder, enter your License Key, and it automatically binds your computer's MAC address, creates a Desktop Icon, and launches checkout!
                </p>
              </div>

              <a
                href="/PlannestPOS-Setup.exe"
                download="PlannestPOS-Setup.exe"
                className="px-5 py-3 bg-[#00478c] hover:bg-[#003870] text-white font-bold rounded-xl shadow-md text-xs transition flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Windows Installer (.exe)</span>
              </a>
            </div>

            {/* 3 Step Visual Workflow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-[#00478c] text-white font-bold text-xs flex items-center justify-center">1</span>
                <h4 className="font-bold text-slate-900 text-xs">Download & Run Installer</h4>
                <p className="text-[11px] text-slate-600">
                  Click the button above to download <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-800">PlannestPOS-Setup.exe</code> and double-click to open.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-[#00478c] text-white font-bold text-xs flex items-center justify-center">2</span>
                <h4 className="font-bold text-slate-900 text-xs">Enter License Key</h4>
                <p className="text-[11px] text-slate-600">
                  Choose your target directory and enter your License Key (received via email or copied below).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-[#00478c] text-white font-bold text-xs flex items-center justify-center">3</span>
                <h4 className="font-bold text-slate-900 text-xs">Auto MAC Lock & Shortcut</h4>
                <p className="text-[11px] text-slate-600">
                  Binds your computer's MAC address in our database, puts a Desktop Icon on your PC, and launches checkout!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: MACHINE LICENSE & HARDWARE LOCKING (MAC / UUID) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-[#00478c]" />
                <span>Machine License &amp; Terminal Locking</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every retail license is locked to your specific counter hardware UUID / MAC address to prevent unauthorized cloning.
              </p>
            </div>

            <button
              onClick={fetchLicense}
              disabled={loading}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg flex items-center gap-1.5 font-semibold transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>

          {license && license.status !== 'revoked' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: License Key Card */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase">Cryptographic License Key</span>
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                  <span className="font-mono font-black text-sm text-slate-900">{license.license_key}</span>
                  <button
                    onClick={handleCopyKey}
                    className="p-1.5 text-slate-600 hover:text-[#00478c] transition"
                    title="Copy Key"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex justify-between text-xs text-slate-600 pt-1">
                  <span>Assigned Store ID: <strong>{license.user_id}</strong></span>
                  <span>Expires: <strong className="font-mono">{license.expires_at}</strong></span>
                </div>
              </div>

              {/* Right: Terminal Hardware UUID / MAC Lock */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Hardware Binding (MAC / UUID)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {license.hardware_uuid ? 'Locked to Device' : 'Ready to Bind'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-500">Bound Hardware UUID / MAC:</div>
                  <div className="font-mono font-bold text-xs text-slate-800 mt-0.5">
                    {license.hardware_uuid || 'Unbound (Claims first machine on launch)'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Single-Terminal Protection Active
                  </span>

                  {license.hardware_uuid && (
                    <button
                      onClick={handleResetHardwareLock}
                      disabled={loading}
                      className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline cursor-pointer"
                    >
                      Reset Hardware Binding
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>License Pending or Under Reset</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Your store license is currently pending assignment or was reset by the administrator. Please check your email or contact Plannest Support to receive your fresh terminal license key.
              </p>
            </div>
          )}

          {resetSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Hardware binding has been reset. The next machine you launch will claim this license key!</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
