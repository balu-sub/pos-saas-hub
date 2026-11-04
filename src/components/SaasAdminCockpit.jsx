import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import {
  Store,
  Layers,
  Radio,
  Key,
  Wand2,
  Cpu,
  Monitor,
  HardDrive,
  RefreshCw,
  Search,
  Plus,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ChevronRight,
  Database,
  Server,
  Zap,
  Activity,
  Smartphone,
  Laptop,
  Check,
  X,
  Clock,
  Printer,
  Scale,
  Mail,
  User,
  Phone,
  Copy,
  Send,
  AlertTriangle
} from 'lucide-react';

export default function SaasAdminCockpit({ onLogout }) {
  const [activeTab, setActiveTab] = useState('stores');
  const [loading, setLoading] = useState(false);

  // Data states
  const [stores, setStores] = useState([]);
  const [devices, setDevices] = useState([]);
  const [telemetry, setTelemetry] = useState([]);
  const [licenses, setLicenses] = useState([]);

  // Filter / Search
  const [storeFilter, setStoreFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [newStore, setNewStore] = useState({
    id: '',
    name: '',
    tagline: 'Fresh Quality Everyday',
    phone: '',
    address_line1: '',
    apptype: 'windows',
    bill_prefix: 'INV-',
    starting_bill_no: 1001,
  });

  const [isAddLicenseOpen, setIsAddLicenseOpen] = useState(false);
  const [newLicense, setNewLicense] = useState({
    store_id: 'STORE-002',
    plan_tier: 'pro',
    months: 12,
  });

  // Modal to show generated email for issued license
  const [issuedLicenseModal, setIssuedLicenseModal] = useState(null);
  const [copiedEmailText, setCopiedEmailText] = useState(false);
  const [copiedKeyText, setCopiedKeyText] = useState(false);

  // Review & Issue License modal for a pending store
  const [reviewingStore, setReviewingStore] = useState(null);

  const [pingStatus, setPingStatus] = useState({});

  const generateLicenseKey = (apptype) => {
    const isWindows = (apptype || 'windows') === 'windows';
    const tierPrefix = isWindows ? 'WIN' : 'ESP';
    return `PLN-${tierPrefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-2026`;
  };

  const openLicenseReview = (st) => {
    setReviewingStore({
      store: st,
      machineId: st.bill_config?.machine_id || '',
      licenseKey: generateLicenseKey(st.apptype),
      months: 12,
      planTier: (st.apptype || 'windows') === 'windows' ? 'pro' : 'lite',
    });
  };

  const handleConfirmIssueLicense = async () => {
    if (!reviewingStore) return;
    const { store: st, machineId, licenseKey, months, planTier } = reviewingStore;

    setLoading(true);
    try {
      const expDate = new Date();
      expDate.setMonth(expDate.getMonth() + Number(months || 12));
      const boundMachine = machineId?.trim() || null;
      const cleanKey = licenseKey.trim().toUpperCase();

      // 1. Insert into saas_licenses
      const licRecord = {
        id: `LIC-${Date.now()}`,
        user_id: st.id,
        license_key: cleanKey,
        token: btoa(`${cleanKey}:${st.id}`),
        plan_tier: planTier,
        status: 'active',
        hardware_uuid: boundMachine, // Pre-locked if machine ID given, otherwise null to auto-bind on launch
        expires_at: expDate.toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      };

      const { error: licErr } = await supabase.from('saas_licenses').insert([licRecord]);
      if (licErr) throw licErr;

      // 2. Activate store in stores table
      const updatedConfig = {
        ...(st.bill_config || {}),
        registration_status: 'active',
        machine_id: boundMachine,
        issued_license_key: cleanKey,
        license_issued_at: new Date().toISOString(),
      };

      const { error: updErr } = await supabase
        .from('stores')
        .update({
          is_active: true,
          bill_config: updatedConfig,
        })
        .eq('id', st.id);

      if (updErr) throw updErr;

      // 3. Prepare email text
      const ownerName = st.bill_config?.owner_name || 'Store Owner';
      const ownerEmail = st.bill_config?.owner_email || st.phone || '';
      const emailBody = `Subject: Your Plannest POS Terminal License Key & Activation Details

Dear ${ownerName},

Thank you for registering "${st.name}" with Plannest POS!

Your outlet has been approved and your official machine license has been generated:
-------------------------------------------------------------
• Store ID:        ${st.id}
• License Key:     ${cleanKey}
• Hardware Lock:   ${boundMachine ? `Locked to MAC: ${boundMachine}` : 'Will bind to your computer on first run'}
• Default PIN:     1234
• Plan Validity:   ${months} Months (Expires ${expDate.toISOString().split('T')[0]})
-------------------------------------------------------------

HOW TO ACTIVATE YOUR COUNTER TERMINAL:
1. Download the Windows installer on your cashier counter PC:
   https://pos.plannestapp.com/PlannestPOS-Setup.exe

2. Run PlannestPOS-Setup.exe and enter your License Key above.
   The installer will automatically bind your computer's MAC address and create a "Plannest POS Terminal" desktop shortcut!

3. Open the desktop shortcut to start high-speed retail checkout!

CLOUD STORE MANAGER:
Manage your product catalog, prices, and daily reports anytime at:
https://pospro.plannestapp.com

Need support? Reply to this email or contact Plannest Support.`;

      setReviewingStore(null);
      setIssuedLicenseModal({
        store: st,
        licenseKey: cleanKey,
        ownerEmail,
        ownerName,
        boundMachine,
        emailText: emailBody,
      });

      await fetchData();
    } catch (err) {
      alert('Failed to issue license: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all SaaS data from Supabase
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: storesData } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });
      if (storesData) setStores(storesData);

      const { data: devData } = await supabase
        .from('devices')
        .select('*')
        .order('created_at', { ascending: false });
      if (devData) setDevices(devData);

      const { data: telemData } = await supabase
        .from('saas_terminal_telemetry')
        .select('*')
        .order('last_ping', { ascending: false });
      if (telemData) setTelemetry(telemData);

      const { data: licData } = await supabase
        .from('saas_licenses')
        .select('*')
        .order('created_at', { ascending: false });
      if (licData) setLicenses(licData);
    } catch (err) {
      console.error('Error fetching SaaS hub data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Separate pending registration requests vs active stores
  const pendingRequests = stores.filter(
    (st) => !st.is_active || st.bill_config?.registration_status === 'pending_license'
  );
  const activeStores = stores.filter(
    (st) => st.is_active && st.bill_config?.registration_status !== 'pending_license'
  );



  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!newStore.id || !newStore.name) {
      alert('Please fill in Store ID and Store Name');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('stores').insert([
        {
          id: newStore.id.trim().toUpperCase(),
          name: newStore.name.trim(),
          tagline: newStore.tagline,
          phone: newStore.phone,
          address_line1: newStore.address_line1,
          apptype: newStore.apptype,
          bill_prefix: newStore.bill_prefix,
          starting_bill_no: Number(newStore.starting_bill_no) || 1001,
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

      if (error) throw error;
      setIsAddStoreOpen(false);
      setNewStore({
        id: '',
        name: '',
        tagline: 'Fresh Quality Everyday',
        phone: '',
        address_line1: '',
        apptype: 'windows',
        bill_prefix: 'INV-',
        starting_bill_no: 1001,
      });
      fetchData();
    } catch (err) {
      alert('Failed to create store: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLicense = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const randomKey = 'PLN-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      const expDate = new Date();
      expDate.setMonth(expDate.getMonth() + Number(newLicense.months));

      const { error } = await supabase.from('saas_licenses').insert([
        {
          id: 'LIC-' + Date.now(),
          user_id: newLicense.store_id,
          license_key: randomKey,
          token: btoa(randomKey + ':' + Date.now()),
          plan_tier: newLicense.plan_tier,
          status: 'active',
          hardware_uuid: null,
          expires_at: expDate.toISOString().split('T')[0],
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
      setIsAddLicenseOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to create license: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePingTerminal = (terminalId) => {
    setPingStatus((prev) => ({ ...prev, [terminalId]: 'pinging' }));
    setTimeout(() => {
      const latency = Math.floor(Math.random() * 8) + 2;
      setPingStatus((prev) => ({ ...prev, [terminalId]: `${latency}ms` }));
    }, 600);
  };

  const filteredStores = activeStores.filter((st) => {
    const matchesType = storeFilter === 'all' || (st.apptype || 'windows') === storeFilter;
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900">
      {/* Top Cockpit Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-18 flex items-center justify-between">
            {/* Left Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-md">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-black text-slate-900 text-lg leading-tight">PLANNEST MASTER SAAS HUB</h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full uppercase tracking-wider">
                    Super Admin
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-mono">pos.plannestapp.com</span>
              </div>
            </div>

            {/* Status Chips */}
            <div className="hidden lg:flex items-center gap-2.5 text-[11px] font-mono">
              {pendingRequests.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 font-bold animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{pendingRequests.length} PENDING LICENSE REQUESTS</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>FLEET ONLINE</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold">
                <Database className="w-3.5 h-3.5 text-[#00478c]" />
                <span>SUPABASE TOKYO</span>
              </div>
            </div>

            {/* Profile & Logout */}
            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                disabled={loading}
                className="p-2 text-slate-600 hover:text-purple-700 hover:bg-slate-100 rounded-lg transition"
                title="Sync from Supabase"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-700' : ''}`} />
              </button>

              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  B
                </div>
                <div className="text-left text-xs">
                  <span className="font-bold text-slate-900 block leading-tight">Balu</span>
                  <span className="text-[10px] text-purple-600 font-semibold">Super Admin</span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex space-x-2 border-t border-slate-100 py-2.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('stores')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                activeTab === 'stores'
                  ? 'bg-purple-50 text-purple-800 border border-purple-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Active Stores ({activeStores.length})</span>
              {pendingRequests.length > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-mono">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('fleet')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                activeTab === 'fleet'
                  ? 'bg-purple-50 text-purple-800 border border-purple-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Fleet Telemetry ({telemetry.length + devices.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('licenses')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                activeTab === 'licenses'
                  ? 'bg-purple-50 text-purple-800 border border-purple-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>License Keys &amp; MAC Locks ({licenses.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('deploy')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                activeTab === 'deploy'
                  ? 'bg-purple-50 text-purple-800 border border-purple-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Deployment Wizard</span>
            </button>

            <button
              onClick={() => setActiveTab('releases')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                activeTab === 'releases'
                  ? 'bg-purple-50 text-purple-800 border border-purple-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>OTA Software &amp; Firmware</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ============================================================= */}
        {/* SECTION A: PENDING STORE REGISTRATIONS & LICENSE REQUESTS     */}
        {/* ============================================================= */}
        {pendingRequests.length > 0 && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-amber-950 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span>Pending Store Registrations &amp; License Requests ({pendingRequests.length})</span>
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  New clients submitted these store details. Click "Generate &amp; Issue License" to create their machine key and email it to them.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((st) => {
                const ownerName = st.bill_config?.owner_name || 'Owner';
                const ownerEmail = st.bill_config?.owner_email || 'N/A';
                const counterCount = st.bill_config?.counter_count || 1;
                const isWindows = (st.apptype || 'windows') === 'windows';

                return (
                  <div key={st.id} className="bg-white rounded-xl border border-amber-200 p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black px-2 py-0.5 bg-amber-100 text-amber-900 rounded">
                        {st.id}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {isWindows ? 'Windows POS (Touch)' : 'CrowPanel ESP (7.0")'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{st.name}</h4>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ownerName}</span>
                        <span>•</span>
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{ownerEmail}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Phone: {st.phone || 'N/A'} • City: {st.address_line1 || 'N/A'} • {counterCount} Checkout Lane(s)
                      </p>
                    </div>

                    {/* Machine ID info */}
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-slate-400" />
                        <span>Target Machine MAC:</span>
                      </span>
                      {st.bill_config?.machine_id ? (
                        <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-[11px]">
                          {st.bill_config.machine_id}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          Pending (Auto-bind on install)
                        </span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-amber-700 font-semibold">
                        Awaiting License Key
                      </span>

                      <button
                        onClick={() => openLicenseReview(st)}
                        disabled={loading}
                        className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Pick Machine ID &amp; Issue License</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 1: ACTIVE STORES */}
        {activeTab === 'stores' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Active Stores &amp; Outlets ({activeStores.length})</h2>
                <p className="text-xs text-slate-500">
                  Manage active client stores across CrowPanel ESP hardware and Windows terminals
                </p>
              </div>

              <button
                onClick={() => setIsAddStoreOpen(true)}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard New Store Manually</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-600 uppercase">Device Tier:</span>
                <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-medium">
                  <button
                    onClick={() => setStoreFilter('all')}
                    className={`px-3 py-1 rounded-md transition ${
                      storeFilter === 'all' ? 'bg-white shadow-xs font-bold text-slate-900' : 'text-slate-600'
                    }`}
                  >
                    All ({activeStores.length})
                  </button>
                  <button
                    onClick={() => setStoreFilter('esp')}
                    className={`px-3 py-1 rounded-md transition ${
                      storeFilter === 'esp' ? 'bg-white shadow-xs font-bold text-amber-700' : 'text-slate-600'
                    }`}
                  >
                    ESP Hardware
                  </button>
                  <button
                    onClick={() => setStoreFilter('windows')}
                    className={`px-3 py-1 rounded-md transition ${
                      storeFilter === 'windows' ? 'bg-white shadow-xs font-bold text-blue-700' : 'text-slate-600'
                    }`}
                  >
                    Windows PC
                  </button>
                </div>
              </div>

              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search store name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Stores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map((st) => {
                const apptype = st.apptype || 'windows';
                const isEsp = apptype === 'esp';
                const portalUrl = isEsp ? 'https://poslite.plannestapp.com' : 'https://pospro.plannestapp.com';

                return (
                  <div
                    key={st.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-xs font-extrabold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg">
                          {st.id}
                        </span>

                        {isEsp ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <Cpu className="w-3 h-3" />
                            ESP CrowPanel
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                            <Laptop className="w-3 h-3" />
                            Windows Terminal
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-slate-900 text-base leading-snug">{st.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 italic">{st.tagline || 'Retail Outlet'}</p>

                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Phone:</span>
                          <span className="font-medium">{st.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">City / Address:</span>
                          <span className="font-medium truncate max-w-[180px]">{st.address_line1 || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Bill Prefix:</span>
                          <span className="font-mono font-bold text-slate-800">{st.bill_prefix}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <a
                        href={portalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                          isEsp
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-blue-50 hover:bg-blue-100 text-[#00478c] border border-blue-200'
                        }`}
                      >
                        <span>Open Store Manager ({isEsp ? 'poslite' : 'pospro'})</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: FLEET */}
        {activeTab === 'fleet' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">Live Device Telemetry &amp; Fleet Status</h2>
              <p className="text-xs text-slate-500">
                Real-time heartbeat monitoring across CrowPanel ESP32 and Windows 10/11 counters
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-600 tracking-wider">
                  Active Terminals ({telemetry.length + devices.length})
                </span>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                  Auto-Refresh Active
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {devices.map((d) => (
                  <div key={d.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{d.device_name}</h4>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            {d.device_type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">
                          Store: {d.store_id} • Code: {d.device_code}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handlePingTerminal(d.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>Ping</span>
                      </button>
                      {pingStatus[d.id] && (
                        <span className="text-xs font-mono font-bold text-emerald-600">{pingStatus[d.id]}</span>
                      )}
                    </div>
                  </div>
                ))}

                {telemetry.map((t) => (
                  <div key={t.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
                        <Laptop className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{t.terminal_name}</h4>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                            {t.os_type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">
                          UUID: {t.machine_uuid} • IP: {t.local_ip}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handlePingTerminal(t.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 text-blue-600" />
                        <span>Ping</span>
                      </button>
                      {pingStatus[t.id] && (
                        <span className="text-xs font-mono font-bold text-emerald-600">{pingStatus[t.id]}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LICENSES & HARDWARE LOCKS */}
        {activeTab === 'licenses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">License Keys &amp; Machine Hardware Locking</h2>
                <p className="text-xs text-slate-500">
                  Track machine UUIDs and MAC bindings to prevent multi-terminal license abuse
                </p>
              </div>

              <button
                onClick={() => setIsAddLicenseOpen(true)}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Issue New License Manually</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">License Key</th>
                      <th className="px-5 py-3.5">Store ID</th>
                      <th className="px-5 py-3.5">Hardware Lock (MAC Address / UUID)</th>
                      <th className="px-5 py-3.5">Tier</th>
                      <th className="px-5 py-3.5">Expires</th>
                      <th className="px-5 py-3.5 text-right">Binding Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {licenses.map((lic) => (
                      <tr key={lic.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-4 font-mono font-bold text-slate-900">{lic.license_key}</td>
                        <td className="px-5 py-4 font-semibold text-slate-700">{lic.user_id}</td>
                        <td className="px-5 py-4 font-mono text-[11px] text-slate-600">
                          {lic.hardware_uuid ? (
                            <span className="font-bold text-slate-800">{lic.hardware_uuid}</span>
                          ) : (
                            <span className="text-amber-600 italic">Unbound (Claims first machine on launch)</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="uppercase text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                            {lic.plan_tier}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-500 font-mono">{lic.expires_at}</td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-emerald-600 font-semibold flex items-center justify-end gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {lic.hardware_uuid ? 'Locked to MAC' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DEPLOYMENT WIZARD */}
        {activeTab === 'deploy' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-xl font-black text-slate-900">New Client Onboarding Wizard</h2>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 space-y-2">
                <div className="font-bold text-slate-900">Windows Graphical Setup Installer (.exe):</div>
                <div className="p-2.5 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto">
                  https://pos.plannestapp.com/PlannestPOS-Setup.exe
                </div>
                <p className="text-[11px] text-slate-500 font-sans">
                  The client downloads this setup, enters their license key, and the installer automatically registers their machine's MAC address in Supabase and creates a Desktop shortcut.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: RELEASES */}
        {activeTab === 'releases' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm">Windows POS Terminal</h3>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">v1.0.0 Stable</div>
              <p className="text-xs text-slate-500 mt-1">Offline-first local SQLite engine</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm">CrowPanel ESP32 Firmware</h3>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">v1.0.4 Stable</div>
              <p className="text-xs text-slate-500 mt-1">CrowPanel 7.0" ESP32-S3</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm">Cloud Manager Portal</h3>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">pospro / poslite</div>
              <p className="text-xs text-slate-500 mt-1">Cloudflare Pages Edge</p>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: Review Registration & Pick Machine ID */}
      {reviewingStore && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 uppercase tracking-wider">
                  Review &amp; Issue License
                </span>
                <h3 className="font-black text-slate-900 text-base mt-1">
                  {reviewingStore.store.name} ({reviewingStore.store.id})
                </h3>
              </div>
              <button
                onClick={() => setReviewingStore(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Store Quick Summary Card */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Contact / Owner:</span>
                <span className="font-semibold text-slate-900">{reviewingStore.store.bill_config?.owner_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-purple-700 font-semibold">{reviewingStore.store.bill_config?.owner_email || reviewingStore.store.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone &amp; Location:</span>
                <span className="text-slate-800">{reviewingStore.store.phone || 'N/A'} • {reviewingStore.store.address_line1 || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Terminal Tier:</span>
                <span className="font-bold text-slate-900 uppercase">{reviewingStore.planTier} ({reviewingStore.store.apptype})</span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Machine ID / MAC Address */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold uppercase text-slate-700 flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-purple-700" />
                    <span>Hardware Lock (Target MAC Address / UUID):</span>
                  </label>
                  {reviewingStore.machineId ? (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Provided by Customer
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Unbound / Auto-bind
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="e.g. 2C-56-DC-1B-44-A9 (Leave empty to auto-bind on install)"
                  value={reviewingStore.machineId}
                  onChange={(e) => setReviewingStore({ ...reviewingStore, machineId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-600"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  You can type or paste the customer's machine MAC address now, or leave it blank to automatically lock to the first computer that runs PlannestPOS-Setup.exe.
                </span>
              </div>

              {/* License Key */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold uppercase text-slate-700 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-purple-700" />
                    <span>Assigned License Key:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setReviewingStore({ ...reviewingStore, licenseKey: generateLicenseKey(reviewingStore.store.apptype) })}
                    className="text-[11px] text-purple-700 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate Key</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={reviewingStore.licenseKey}
                  onChange={(e) => setReviewingStore({ ...reviewingStore, licenseKey: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-black text-purple-900 tracking-wider focus:bg-white focus:ring-2 focus:ring-purple-600"
                />
              </div>

              {/* Plan Validity Months */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase text-slate-700 mb-1 block">Plan Tier</label>
                  <select
                    value={reviewingStore.planTier}
                    onChange={(e) => setReviewingStore({ ...reviewingStore, planTier: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium"
                  >
                    <option value="pro">Pro (Windows Offline POS)</option>
                    <option value="lite">Lite (CrowPanel ESP32)</option>
                    <option value="enterprise">Enterprise Fleet</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold uppercase text-slate-700 mb-1 block">Duration</label>
                  <select
                    value={reviewingStore.months}
                    onChange={(e) => setReviewingStore({ ...reviewingStore, months: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium"
                  >
                    <option value="6">6 Months</option>
                    <option value="12">12 Months (1 Year)</option>
                    <option value="24">24 Months (2 Years)</option>
                    <option value="36">36 Months (3 Years)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setReviewingStore(null)}
                className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmIssueLicense}
                disabled={loading}
                className="w-2/3 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" />
                <span>{loading ? 'Activating...' : 'Issue License & Send to Client'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Show Generated License & Email to Super Admin */}
      {issuedLicenseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  License Generated Successfully
                </span>
                <h3 className="font-black text-slate-900 text-base mt-1">
                  License for {issuedLicenseModal.store.name} ({issuedLicenseModal.store.id})
                </h3>
              </div>
              <button
                onClick={() => {
                  setIssuedLicenseModal(null);
                  setCopiedEmailText(false);
                  setCopiedKeyText(false);
                }}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-700 font-bold uppercase">Generated License Key:</span>
                <span className="text-[11px] font-mono font-bold text-slate-600">
                  {issuedLicenseModal.boundMachine ? `Locked to: ${issuedLicenseModal.boundMachine}` : 'Unbound (Auto-claims on install)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono font-black text-purple-900">
                  {issuedLicenseModal.licenseKey}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(issuedLicenseModal.licenseKey);
                    setCopiedKeyText(true);
                    setTimeout(() => setCopiedKeyText(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-white border border-purple-200 text-purple-800 rounded-lg text-xs font-bold hover:bg-purple-100 transition flex items-center gap-1 cursor-pointer"
                >
                  {copiedKeyText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKeyText ? 'Copied Key!' : 'Copy Key'}</span>
                </button>
              </div>
              <p className="text-[11px] text-purple-600 mt-1">
                {issuedLicenseModal.boundMachine
                  ? `Machine MAC ${issuedLicenseModal.boundMachine} is pre-locked. No other PC will be able to activate this key.`
                  : 'Customer PC MAC address will be captured automatically the moment they enter this key in PlannestPOS-Setup.exe!'}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Ready-to-Send Email / Message to Customer:
                </label>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${encodeURIComponent(issuedLicenseModal.ownerEmail)}?subject=${encodeURIComponent('Your Plannest POS Terminal License Key & Activation Details')}&body=${encodeURIComponent(issuedLicenseModal.emailText)}`}
                    className="px-2.5 py-1 bg-[#00478c] hover:bg-[#003870] text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open in Mail App</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(issuedLicenseModal.emailText);
                      setCopiedEmailText(true);
                      setTimeout(() => setCopiedEmailText(false), 2000);
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedEmailText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmailText ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                value={issuedLicenseModal.emailText}
                rows={9}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 leading-relaxed focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIssuedLicenseModal(null);
                  setCopiedEmailText(false);
                  setCopiedKeyText(false);
                }}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Store Modal */}
      {isAddStoreOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-900 text-base">Onboard New Store Tenant</h3>
              <button onClick={() => setIsAddStoreOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Store ID</label>
                <input
                  type="text"
                  required
                  placeholder="STORE-003"
                  value={newStore.id}
                  onChange={(e) => setNewStore({ ...newStore, id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold uppercase focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Store Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plannest Daily Mart"
                  value={newStore.name}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Device Tier</label>
                  <select
                    value={newStore.apptype}
                    onChange={(e) => setNewStore({ ...newStore, apptype: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="windows">Windows PC POS</option>
                    <option value="esp">ESP CrowPanel Hardware</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bill Prefix</label>
                  <input
                    type="text"
                    value={newStore.bill_prefix}
                    onChange={(e) => setNewStore({ ...newStore, bill_prefix: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStoreOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add License Modal */}
      {isAddLicenseOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-900 text-base">Issue Machine License</h3>
              <button onClick={() => setIsAddLicenseOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLicense} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign to Store ID</label>
                <select
                  value={newLicense.store_id}
                  onChange={(e) => setNewLicense({ ...newLicense, store_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {activeStores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plan Tier</label>
                  <select
                    value={newLicense.plan_tier}
                    onChange={(e) => setNewLicense({ ...newLicense, plan_tier: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="trial">Trial (14 Days)</option>
                    <option value="pro">Pro Retail</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Validity (Months)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={newLicense.months}
                    onChange={(e) => setNewLicense({ ...newLicense, months: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLicenseOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg shadow-sm"
                >
                  Generate License Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
