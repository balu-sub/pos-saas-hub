import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Mail,
  User,
  Phone,
  MapPin,
  Download,
  Copy,
  Send,
  Plus
} from 'lucide-react';

// Phone and store name normalization helpers
function normalizePhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

function normalizeStoreName(name) {
  if (!name) return '';
  return String(name).trim().toLowerCase().replace(/\s+/g, ' ');
}

export default function AuthModal({ isOpen, initialMode, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState(initialMode || 'signup'); // 'signin' | 'signup'
  const [storeIdInput, setStoreIdInput] = useState('');
  const [pinInput, setPinInput] = useState('1234');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Duplicate verification state
  const [existingStores, setExistingStores] = useState([]);
  const [nameWarning, setNameWarning] = useState(null);
  const [phoneWarning, setPhoneWarning] = useState(null);
  const [comboError, setComboError] = useState(null);

  // Sign up fields
  const [newStore, setNewStore] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    city: 'Chennai',
    apptype: 'windows',
    counterCount: 1,
    machineId: '',
    agreedTerms: false,
  });

  // Success state after submitting registration
  const [registeredStore, setRegisteredStore] = useState(null);

  // Fetch all existing registered stores for uniqueness validation
  const fetchExistingStores = async () => {
    try {
      const { data: storesList } = await supabase
        .from('stores')
        .select('id, name, phone');
      const { data: profilesList } = await supabase
        .from('Windows_outlet_profile')
        .select('store_id, outlet_name, phone');

      const combined = [];
      if (Array.isArray(storesList)) {
        storesList.forEach((s) => {
          if (s.name || s.phone) {
            combined.push({ id: s.id, name: s.name || '', phone: s.phone || '' });
          }
        });
      }
      if (Array.isArray(profilesList)) {
        profilesList.forEach((p) => {
          if ((p.outlet_name || p.phone) && !combined.some((c) => c.id === p.store_id)) {
            combined.push({ id: p.store_id, name: p.outlet_name || '', phone: p.phone || '' });
          }
        });
      }
      setExistingStores(combined);
      return combined;
    } catch (err) {
      console.warn('Could not prefetch stores:', err);
      return [];
    }
  };

  // Evaluate duplicate rules
  const evaluateDuplicates = (nameInput, phoneInput, storeList = existingStores) => {
    const cleanName = normalizeStoreName(nameInput);
    const cleanPhone = normalizePhone(phoneInput);

    if (!cleanName && !cleanPhone) {
      setComboError(null);
      setNameWarning(null);
      setPhoneWarning(null);
      return { comboError: null, nameWarning: null, phoneWarning: null };
    }

    let combo = null;
    let nameOnly = null;
    let phoneOnly = null;

    for (const st of storeList) {
      const stName = normalizeStoreName(st.name);
      const stPhone = normalizePhone(st.phone);

      const isNameMatch = Boolean(cleanName && stName && cleanName.length >= 3 && cleanName === stName);
      const isPhoneMatch = Boolean(cleanPhone && stPhone && cleanPhone.length >= 7 && cleanPhone === stPhone);

      if (isNameMatch && isPhoneMatch) {
        combo = st;
        break; // Both name and phone match the same store
      }
      if (isNameMatch && !nameOnly) nameOnly = st;
      if (isPhoneMatch && !phoneOnly) phoneOnly = st;
    }

    if (combo) {
      setComboError(combo);
      setNameWarning(null);
      setPhoneWarning(null);
      return { comboError: combo, nameWarning: null, phoneWarning: null };
    }

    setComboError(null);

    if (nameOnly) {
      setNameWarning(`⚠️ Note: A store named "${nameOnly.name}" is already registered. If this is a separate branch or outlet, you can proceed.`);
    } else {
      setNameWarning(null);
    }

    if (phoneOnly) {
      setPhoneWarning(`⚠️ Note: Phone number is already associated with another store (${phoneOnly.name || phoneOnly.id}). You can proceed if you operate multiple stores.`);
    } else {
      setPhoneWarning(null);
    }

    return { comboError: null, nameWarning: nameOnly, phoneWarning: phoneOnly };
  };

  // Sync mode and prefetch stores whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'signup');
      setErrorMsg('');
      setRegisteredStore(null);
      setNameWarning(null);
      setPhoneWarning(null);
      setComboError(null);
      fetchExistingStores();
    }
  }, [initialMode, isOpen]);

  // Real-time duplicate evaluation as the merchant types
  useEffect(() => {
    if (mode === 'signup' && (newStore.businessName || newStore.phone)) {
      evaluateDuplicates(newStore.businessName, newStore.phone, existingStores);
    } else {
      setComboError(null);
      setNameWarning(null);
      setPhoneWarning(null);
    }
  }, [newStore.businessName, newStore.phone, existingStores, mode]);

  if (!isOpen) return null;

  // Handle Unified Sign In (Identifies Store Owner vs Super Admin automatically)
  const handleStoreSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const rawId = storeIdInput.trim();
    const pin = pinInput.trim().toLowerCase();

    if (!rawId) {
      setErrorMsg('Please enter your Store ID');
      return;
    }

    // INTERNAL SUPER ADMIN DETECTION:
    // If entered login ID is admin/superadmin/balu/master with PIN 1234, route to Super Admin Cockpit
    const lowerId = rawId.toLowerCase();
    if (
      (lowerId === 'admin' || lowerId === 'superadmin' || lowerId === 'balu' || lowerId === 'balu-sub' || lowerId === 'master' || lowerId === 'pln-admin') &&
      (pin === '1234' || pin === 'admin')
    ) {
      const session = {
        role: 'super_admin',
        username: 'Balu (Admin)',
      };
      localStorage.setItem('plannest_session', JSON.stringify(session));
      onLoginSuccess(session);
      onClose();
      return;
    }

    const idToSearch = rawId.toUpperCase();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', idToSearch)
        .single();

      if (error || !data) {
        const altId = idToSearch.startsWith('STORE-') ? idToSearch : `STORE-${idToSearch.padStart(3, '0')}`;
        const { data: altData, error: altErr } = await supabase
          .from('stores')
          .select('*')
          .eq('id', altId)
          .single();

        if (altErr || !altData) {
          setErrorMsg(`Store ID "${idToSearch}" not found. Please check your Store ID or register below.`);
          setLoading(false);
          return;
        }

        await verifyStorePinAndLogin(altData);
        return;
      }

      await verifyStorePinAndLogin(data);
    } catch (err) {
      setErrorMsg('Connection error: ' + err.message);
      setLoading(false);
    }
  };

  const verifyStorePinAndLogin = async (storeData) => {
    const rawPin = pinInput.trim();
    if (!rawPin) {
      setErrorMsg('Please enter your Store PIN or Password.');
      setLoading(false);
      return;
    }

    if (storeData.apptype === 'pricing_inquiry' || storeData.bill_config?.source?.includes('landing')) {
      setErrorMsg('This ID belongs to a pricing inquiry, not an activated store account.');
      setLoading(false);
      return;
    }

    const configuredSecrets = [
      storeData.bill_config?.portal_password,
      storeData.bill_config?.pin,
      storeData.pin,
    ]
      .filter((val) => val !== undefined && val !== null && String(val).trim() !== '')
      .map((val) => String(val).trim());

    let userSecrets = [];
    const { data: usersData, error: usersErr } = await supabase
      .from('Windows_users')
      .select('pin, password, status')
      .eq('store_id', storeData.id);

    if (!usersErr && Array.isArray(usersData)) {
      userSecrets = usersData
        .filter((u) => !u.status || u.status === 'active')
        .flatMap((u) => [u.pin, u.password])
        .filter((val) => val !== undefined && val !== null && String(val).trim() !== '')
        .map((val) => String(val).trim());
    }

    const allSecrets = [...configuredSecrets, ...userSecrets];
    const hasConfiguredSecrets = allSecrets.length > 0;
    const matches = hasConfiguredSecrets
      ? allSecrets.includes(rawPin)
      : rawPin === '1234';

    if (!matches) {
      setErrorMsg('Invalid Store PIN or Password. Please check your credentials.');
      setLoading(false);
      return;
    }

    // If store already has an active license, skip the intermediate welcome portal and go directly to pospro/poslite
    const todayStr = new Date().toISOString().split('T')[0];
    let hasActiveLicense = Boolean(
      storeData.bill_config?.issued_license_key &&
        storeData.bill_config?.registration_status === 'active' &&
        storeData.is_active !== false
    );

    if (!hasActiveLicense) {
      const { data: activeLic, error: licErr } = await supabase
        .from('saas_licenses')
        .select('id, status, expires_at')
        .eq('user_id', storeData.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!licErr && activeLic && (!activeLic.expires_at || String(activeLic.expires_at) >= todayStr)) {
        hasActiveLicense = true;
      }
    }

    if (hasActiveLicense || (storeData.apptype || 'windows') !== 'esp') {
      try {
        localStorage.removeItem('plannest_session');
      } catch {}
      setLoading(false);
      onClose();
      const apptype = storeData.apptype || 'windows';
      if (apptype === 'esp') {
        window.location.assign('https://poslite.plannestapp.com');
      } else {
        window.location.assign(
          `https://pospro.plannestapp.com/#store=${encodeURIComponent(storeData.id)}&pin=${encodeURIComponent(rawPin)}`
        );
      }
      return;
    }

    loginAsStore(storeData);
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

  // Handle New Store Registration & License Request
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!newStore.businessName.trim() || !newStore.email.trim()) {
      setErrorMsg('Please fill in both your Store Name and Email Address.');
      return;
    }
    if (!newStore.agreedTerms) {
      setErrorMsg('Please read and agree to the Terms & Conditions (India) before registering.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      // Final duplicate check against latest store database:
      // Block registration if both store name and phone number combination already exists
      const freshStores = await fetchExistingStores();
      const finalDupCheck = evaluateDuplicates(newStore.businessName, newStore.phone, freshStores);
      if (finalDupCheck.comboError) {
        setErrorMsg(`Registration not allowed: A store with this exact name ("${finalDupCheck.comboError.name}") and phone number is already registered (Store ID: ${finalDupCheck.comboError.id}). Duplicate store registrations are not permitted.`);
        setLoading(false);
        return;
      }

      // Generate clean reservation Store ID: STORE-XXX
      const randNum = Math.floor(Math.random() * 900) + 100;
      const generatedId = `STORE-${randNum}`;

      // Insert store in Supabase with is_active: false (pending approval / license issuance)
      const { error: storeErr } = await supabase.from('stores').insert([
        {
          id: generatedId,
          name: newStore.businessName.trim(),
          phone: newStore.phone.trim(),
          address_line1: newStore.city.trim(),
          apptype: newStore.apptype,
          bill_prefix: 'INV-',
          starting_bill_no: 1001,
          is_active: false, // Marked as pending license generation by Super Admin
          bill_config: {
            owner_name: newStore.ownerName.trim() || 'Store Owner',
            owner_email: newStore.email.trim(),
            counter_count: Number(newStore.counterCount) || 1,
            machine_id: newStore.machineId?.trim() || null,
            registration_status: 'pending_license',
            requested_at: new Date().toISOString(),
          },
        },
      ]);

      if (storeErr) throw storeErr;

      // Automatically provision the store's initial outlet profile & admin user in Supabase
      try {
        const { error: outletErr } = await supabase.from('Windows_outlet_profile').insert([
          {
            id: `outlet_${generatedId}`,
            store_id: generatedId,
            outlet_name: newStore.businessName.trim(),
            branch_name: 'Main Counter',
            address_line1: newStore.city.trim(),
            city: newStore.city.trim(),
            state: 'Tamil Nadu',
            pincode: '600001',
            phone: newStore.phone.trim(),
            email: newStore.email.trim(),
            receipt_header_note: `${newStore.businessName.trim().toUpperCase()} - BILLING COUNTER`,
            receipt_footer_note: 'Thank you for shopping with us! Visit again.',
            return_terms: 'Goods once sold can be exchanged within 24 hours with original bill receipt.',
            bill_prefix: 'INV-',
            bill_start_number: 1001,
            bill_increment_step: 1,
            bill_number_padding: 4,
            print_branch: 1,
            print_address: 1,
            print_phone: 1,
            print_email: 0,
            print_gstin: 1,
            print_pan: 0,
            print_fssai: 1,
            print_header_note: 1,
            print_return_terms: 1,
          },
        ]);
        if (outletErr) throw outletErr;

        const { error: userErr } = await supabase.from('Windows_users').insert([
          {
            id: `usr_${generatedId}_admin`,
            store_id: generatedId,
            name: newStore.ownerName.trim() || 'Admin',
            pin: '1234',
            role: 'Admin (Full Access & User Mgmt)',
            role_title: 'Store Administrator',
            user_role: 'Admin',
            email: newStore.email.trim(),
            phone: newStore.phone.trim(),
            initials: (newStore.ownerName.trim() || 'Admin').substring(0, 2).toUpperCase(),
            status: 'active',
          },
        ]);
        if (userErr) throw userErr;
      } catch (provisionErr) {
        console.warn('Initial store provisioning notice:', provisionErr);
      }

      // Show success screen with instructions
      setRegisteredStore({
        id: generatedId,
        name: newStore.businessName.trim(),
        email: newStore.email.trim(),
        apptype: newStore.apptype,
        machineId: newStore.machineId?.trim() || null,
      });
      setLoading(false);
    } catch (err) {
      setErrorMsg('Registration failed: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ------------------------------------------------------------- */}
        {/* SUCCESS STATE: Registration Submitted */}
        {/* ------------------------------------------------------------- */}
        {registeredStore ? (
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Registration Received
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Store ID Reserved: <span className="text-[#00478c] font-mono">{registeredStore.id}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                For <strong>{registeredStore.name}</strong>
              </p>
            </div>

            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 text-left text-xs space-y-1.5 text-slate-700">
              <div className="font-bold text-[#00478c] uppercase tracking-wider text-[10px]">
                Temporary Portal Login Credentials
              </div>
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-blue-100">
                <div>
                  <span className="text-[11px] text-slate-500">Store ID: </span>
                  <strong className="font-mono text-slate-900">{registeredStore.id}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Default Password / PIN: </span>
                  <strong className="font-mono text-[#00478c]">1234</strong>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2 text-slate-700">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-[#00478c]" />
                <span>What Happens Next:</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc list-inside">
                <li>
                  Use your Store ID (<strong>{registeredStore.id}</strong>) and default PIN{' '}
                  <strong>1234</strong> to access <strong>Terminal App &amp; Downloads</strong>.
                </li>
                <li>
                  Your machine-locked License Key is being generated and will be sent to{' '}
                  <strong className="text-slate-900">{registeredStore.email}</strong>.
                </li>
                <li>
                  Once your license is generated, <strong>Admin Hub</strong>, <strong>Replenishment</strong>, and{' '}
                  <strong>Analytics</strong> will unlock automatically.
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => {
                setStoreIdInput(registeredStore.id);
                setPinInput('1234');
                setRegisteredStore(null);
                setErrorMsg('');
                setMode('signin');
              }}
              className="w-full py-3 bg-[#00478c] hover:bg-[#003870] text-white font-bold rounded-xl shadow-md text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Open Store Portal with {registeredStore.id}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setRegisteredStore(null);
                onClose();
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 pt-2 block mx-auto underline"
            >
              Back to Home
            </button>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* FORM STATE: Sign In vs Sign Up */
          /* ------------------------------------------------------------- */
          <div>
            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: STORE OWNER SIGN IN */}
            {mode === 'signin' && (
              <form onSubmit={handleStoreSignIn} className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Store Owner Portal Sign In</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sign in with your assigned Store ID to manage your product catalog, prices, and reports.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Store ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. STORE-002"
                      value={storeIdInput}
                      onChange={(e) => setStoreIdInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00478c]"
                      autoFocus
                    />
                    <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Enter your assigned Store ID (check your activation email from Plannest).
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Store PIN / Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="Enter Store PIN or Password"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00478c]"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#00478c] hover:bg-[#003870] text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
                >
                  <span>{loading ? 'Verifying Store in Supabase...' : 'Open Store Manager'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="pt-2 text-center text-xs text-slate-500">
                  New store owner?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setErrorMsg(''); }}
                    className="text-[#00478c] font-bold underline"
                  >
                    Register Store &amp; Request License →
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: NEW STORE SIGN UP & LICENSE REQUEST */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Register Outlet &amp; Request License</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Submit your store details. Your machine-locked License Key will be generated and delivered to your email.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-600 mb-1">
                    Store / Supermarket Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Annai Supermarket"
                      value={newStore.businessName}
                      onChange={(e) => setNewStore({ ...newStore, businessName: e.target.value })}
                      className={`w-full pl-9 pr-3.5 py-2 border rounded-xl font-medium focus:ring-2 focus:ring-[#00478c] transition ${
                        comboError
                          ? 'border-rose-400 bg-rose-50/20'
                          : nameWarning
                          ? 'border-amber-400 bg-amber-50/20'
                          : 'border-slate-200'
                      }`}
                    />
                    <Store className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  {nameWarning && (
                    <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-[11px] flex items-start gap-1.5 animate-fadeIn">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                      <span>{nameWarning}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold uppercase text-slate-600 mb-1">Owner Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Kumar"
                        value={newStore.ownerName}
                        onChange={(e) => setNewStore({ ...newStore, ownerName: e.target.value })}
                        className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-slate-600 mb-1">Email (License Delivery)</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="owner@supermarket.com"
                        value={newStore.email}
                        onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                        className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold uppercase text-slate-600 mb-1">Phone Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="+91 98765 43210"
                        value={newStore.phone}
                        onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
                        className={`w-full pl-9 pr-3.5 py-2 border rounded-xl font-medium focus:ring-2 focus:ring-[#00478c] transition ${
                          comboError
                            ? 'border-rose-400 bg-rose-50/20'
                            : phoneWarning
                            ? 'border-amber-400 bg-amber-50/20'
                            : 'border-slate-200'
                        }`}
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                    {phoneWarning && (
                      <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-[11px] flex items-start gap-1.5 animate-fadeIn">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                        <span>{phoneWarning}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-slate-600 mb-1">City / Region</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Chennai"
                        value={newStore.city}
                        onChange={(e) => setNewStore({ ...newStore, city: e.target.value })}
                        className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl"
                      />
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold uppercase text-slate-600 mb-1">Primary Terminal Tier</label>
                    <select
                      value={newStore.apptype}
                      onChange={(e) => setNewStore({ ...newStore, apptype: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium"
                    >
                      <option value="windows">Windows PC POS (Local Touch)</option>
                      <option value="esp">CrowPanel ESP32 Hardware (7.0")</option>
                      <option value="android">Android Mobile/Tablet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-slate-600 mb-1">Checkout Counters</label>
                    <select
                      value={newStore.counterCount}
                      onChange={(e) => setNewStore({ ...newStore, counterCount: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium"
                    >
                      <option value="1">1 Checkout Lane</option>
                      <option value="2">2 Checkout Lanes</option>
                      <option value="3">3+ Checkout Lanes</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold uppercase text-slate-600">
                      Machine ID / MAC Address (Optional)
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">e.g. 2C-56-DC-1B-44-A9</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Leave blank if unknown (installer will auto-bind)"
                      value={newStore.machineId}
                      onChange={(e) => setNewStore({ ...newStore, machineId: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#00478c]"
                    />
                    <Laptop className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <span className="text-[10.5px] text-slate-400 mt-1 block">
                    If known, enter your counter PC's MAC address or Computer UUID. If blank, our 1-click installer detects it automatically.
                  </span>
                </div>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={Boolean(newStore.agreedTerms)}
                    onChange={(e) => setNewStore({ ...newStore, agreedTerms: e.target.checked })}
                    className="mt-0.5 rounded text-[#00478c] focus:ring-[#00478c]"
                  />
                  <span className="text-[11px] text-slate-700 leading-snug">
                    I have read and agree to the{' '}
                    <a
                      href="/help/index.html#help-mod-08-terms-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00478c] font-bold underline"
                    >
                      Plannest Retail POS Terms &amp; Conditions and Software License Agreement (India)
                    </a>
                    .
                  </span>
                </label>

                {comboError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs flex items-start gap-2.5 shadow-2xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <div>
                      <strong className="block font-bold text-rose-900 mb-0.5">Registration Not Allowed</strong>
                      <span>
                        A store with this exact name ("{comboError.name}") and phone number is already registered in the system (Store ID: {comboError.id}). This combination cannot be registered again. Please verify your store name and phone number.
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || Boolean(comboError)}
                  className={`w-full py-3 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-2 ${
                    comboError
                      ? 'bg-rose-400 cursor-not-allowed opacity-80'
                      : 'bg-[#00478c] hover:bg-[#003870] cursor-pointer'
                  }`}
                >
                  <span>
                    {loading
                      ? 'Submitting Registration...'
                      : comboError
                      ? 'Combination Already Registered'
                      : 'Submit & Request Machine License'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="text-center text-slate-400 pt-2 text-[11px]">
                  <span>Your machine-locked license and store activation details will be delivered to your email.</span>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
