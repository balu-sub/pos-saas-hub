import React, { useState } from 'react';
import { supabase } from '../supabase';
import {
  Lock,
  Store,
  ShieldCheck,
  ChevronRight,
  X,
  Laptop,
  Cpu,
  Smartphone,
  Check,
  AlertCircle
} from 'lucide-react';

export default function AuthModal({ isOpen, initialMode, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState(initialMode || 'signin'); // 'signin' | 'signup' | 'admin'
  const [storeIdInput, setStoreIdInput] = useState('');
  const [pinInput, setPinInput] = useState('1234');
  const [adminPinInput, setAdminPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Sign up fields
  const [newStore, setNewStore] = useState({
    businessName: '',
    phone: '',
    city: 'Chennai',
    apptype: 'windows',
  });

  if (!isOpen) return null;

  // Handle Store Owner Sign In
  const handleStoreSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const idToSearch = storeIdInput.trim().toUpperCase();

    if (!idToSearch) {
      setErrorMsg('Please enter your Store ID (e.g. STORE-002)');
      return;
    }

    setLoading(true);
    try {
      // 1. Look up in Supabase stores table
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', idToSearch)
        .single();

      if (error || !data) {
        // Fallback check if user entered STORE-001 or STORE-002 without prefix
        const altId = idToSearch.startsWith('STORE-') ? idToSearch : `STORE-${idToSearch.padStart(3, '0')}`;
        const { data: altData, error: altErr } = await supabase
          .from('stores')
          .select('*')
          .eq('id', altId)
          .single();

        if (altErr || !altData) {
          setErrorMsg(`Store ID "${idToSearch}" not found in Supabase database.`);
          setLoading(false);
          return;
        }

        loginAsStore(altData);
        return;
      }

      loginAsStore(data);
    } catch (err) {
      setErrorMsg('Connection error: ' + err.message);
      setLoading(false);
    }
  };

  const loginAsStore = (storeData) => {
    setLoading(false);
    const session = {
      role: 'store_owner',
      store: storeData,
      storeId: storeData.id,
      apptype: storeData.apptype || 'windows',
    };
    localStorage.setItem('plannest_session', JSON.stringify(session));
    onLoginSuccess(session);
    onClose();
  };

  // Handle Super Admin Sign In
  const handleAdminSignIn = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const val = adminPinInput.trim().toLowerCase();
    if (val === '1234' || val === 'admin' || val === 'balu' || val === 'balu-sub') {
      const session = {
        role: 'super_admin',
        username: 'Balu (Super Admin)',
      };
      localStorage.setItem('plannest_session', JSON.stringify(session));
      onLoginSuccess(session);
      onClose();
    } else {
      setErrorMsg('Invalid Super Admin PIN. Default is 1234');
    }
  };

  // Handle New Store Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!newStore.businessName.trim()) {
      setErrorMsg('Please enter your store name');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      // Generate clean store ID: STORE-XXX
      const randNum = Math.floor(Math.random() * 900) + 100;
      const generatedId = `STORE-${randNum}`;

      // Insert store in Supabase
      const { error: storeErr } = await supabase.from('stores').insert([
        {
          id: generatedId,
          name: newStore.businessName.trim(),
          phone: newStore.phone.trim(),
          address_line1: newStore.city.trim(),
          apptype: newStore.apptype,
          bill_prefix: 'INV-',
          starting_bill_no: 1001,
          is_active: true,
          bill_config: {
            terms: 'Goods once sold cannot be returned.',
            gstRate: '5',
            showCashier: true,
            showDualGst: true,
            showDateTime: true,
            footerMessage: 'Thank you for shopping with us!\nPlease visit again!',
            showTaxBreakdown: true,
          },
        },
      ]);

      if (storeErr) throw storeErr;

      // Auto-issue Machine License in Supabase
      const licenseKey = `PLN-${newStore.apptype.toUpperCase().substring(0, 3)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-2026`;
      const expDate = new Date();
      expDate.setFullYear(expDate.getFullYear() + 1);

      await supabase.from('saas_licenses').insert([
        {
          id: `LIC-${Date.now()}`,
          user_id: generatedId,
          license_key: licenseKey,
          token: btoa(`${licenseKey}:${generatedId}`),
          plan_tier: 'pro',
          status: 'active',
          expires_at: expDate.toISOString().split('T')[0],
          created_at: new Date().toISOString(),
        },
      ]);

      // Login immediately into their new store portal
      loginAsStore({
        id: generatedId,
        name: newStore.businessName.trim(),
        apptype: newStore.apptype,
        bill_prefix: 'INV-',
        phone: newStore.phone,
      });
    } catch (err) {
      setErrorMsg('Registration failed: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Tabs */}
        <div className="flex border-b border-slate-100 pb-3 mb-6 gap-4 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => { setMode('signin'); setErrorMsg(''); }}
            className={`pb-2 border-b-2 transition ${
              mode === 'signin' ? 'border-[#00478c] text-[#00478c]' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Store Login
          </button>
          <button
            onClick={() => { setMode('signup'); setErrorMsg(''); }}
            className={`pb-2 border-b-2 transition ${
              mode === 'signup' ? 'border-[#00478c] text-[#00478c]' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            New Free Trial
          </button>
          <button
            onClick={() => { setMode('admin'); setErrorMsg(''); }}
            className={`pb-2 border-b-2 transition ml-auto ${
              mode === 'admin' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-400 hover:text-purple-600'
            }`}
          >
            Super Admin
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* MODE 1: STORE OWNER LOGIN */}
        {mode === 'signin' && (
          <form onSubmit={handleStoreSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Store ID
              </label>
              <input
                type="text"
                required
                placeholder="e.g. STORE-002 or STORE-001"
                value={storeIdInput}
                onChange={(e) => setStoreIdInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00478c] uppercase"
                autoFocus
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Use <strong>STORE-002</strong> for Windows POS, or <strong>STORE-001</strong> for ESP POS
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Store PIN / Password
              </label>
              <input
                type="password"
                required
                placeholder="Default: 1234"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00478c]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00478c] hover:bg-[#003870] text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
            >
              <span>{loading ? 'Verifying with Supabase...' : 'Enter Store Portal'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* MODE 2: NEW STORE SIGN UP */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">Business / Store Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Daily Supermarket"
                value={newStore.businessName}
                onChange={(e) => setNewStore({ ...newStore, businessName: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#00478c]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={newStore.phone}
                  onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-1">City</label>
                <input
                  type="text"
                  placeholder="Chennai"
                  value={newStore.city}
                  onChange={(e) => setNewStore({ ...newStore, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1">Primary Device Tier</label>
              <select
                value={newStore.apptype}
                onChange={(e) => setNewStore({ ...newStore, apptype: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white font-medium"
              >
                <option value="windows">Windows PC POS (Local Touchscreen)</option>
                <option value="esp">CrowPanel ESP32 Hardware (7.0")</option>
                <option value="android">Android Mobile/Tablet</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00478c] hover:bg-[#003870] text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Creating store on Supabase...' : 'Start Instant Trial'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* MODE 3: SUPER ADMIN LOGIN */}
        {mode === 'admin' && (
          <form onSubmit={handleAdminSignIn} className="space-y-4">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs">
              <span className="font-bold">Super Admin Access:</span> Unlocks Master Fleet Telemetry, Global Store Registry, License Generator, and OTA firmware channels across all stores.
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Admin Master PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Default: 1234"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg tracking-widest font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  autoFocus
                />
                <Lock className="w-5 h-5 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
            >
              <span>Open Master SaaS Cockpit</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
