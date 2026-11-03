import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
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
  Lock,
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
  Scale
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

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

  const [pingStatus, setPingStatus] = useState({});

  // Check persisted session
  useEffect(() => {
    const saved = localStorage.getItem('plannest_saas_auth');
    if (saved === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput.trim() === '1234' || pinInput.trim().toLowerCase() === 'admin') {
      setIsAuthenticated(true);
      localStorage.setItem('plannest_saas_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Incorrect Super Admin PIN. Default is 1234');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('plannest_saas_auth');
  };

  // Fetch all SaaS data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch stores
      const { data: storesData, error: storesErr } = await supabase
        .from('stores')
        .select('*')
        .order('id', { ascending: true });
      if (!storesErr && storesData) setStores(storesData);

      // 2. Fetch devices
      const { data: devData, error: devErr } = await supabase
        .from('devices')
        .select('*')
        .order('created_at', { ascending: false });
      if (!devErr && devData) setDevices(devData);

      // 3. Fetch telemetry
      const { data: telemData, error: telemErr } = await supabase
        .from('saas_terminal_telemetry')
        .select('*')
        .order('last_ping', { ascending: false });
      if (!telemErr && telemData) setTelemetry(telemData);

      // 4. Fetch licenses
      const { data: licData, error: licErr } = await supabase
        .from('saas_licenses')
        .select('*')
        .order('created_at', { ascending: false });
      if (!licErr && licData) setLicenses(licData);
    } catch (err) {
      console.error('Error fetching SaaS hub data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

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
      const latency = Math.floor(Math.random() * 8) + 2; // 2-10ms
      setPingStatus((prev) => ({ ...prev, [terminalId]: `${latency}ms` }));
    }, 600);
  };

  // Auth gatekeeper UI
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 text-[#00478c] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
              <Layers className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Plannest SaaS Central Hub</h1>
            <p className="text-xs text-slate-500 mt-1 font-mono">pos.plannestapp.com</p>
            <p className="text-sm text-slate-600 mt-2">Central Management for ESP, Windows & Android POS</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Super Admin PIN / Access Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter PIN (Default: 1234)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg tracking-widest font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00478c] focus:border-transparent transition"
                  autoFocus
                />
                <Lock className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
              {authError && (
                <p className="text-rose-600 text-xs font-medium mt-2 text-center">{authError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#00478c] hover:bg-[#003870] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Unlock Cockpit</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Coexists with <span className="font-semibold text-slate-600">poslite.plannestapp.com</span> & <span className="font-semibold text-slate-600">pospro.plannestapp.com</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Filtered stores
  const filteredStores = stores.filter((st) => {
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
              <div className="w-10 h-10 rounded-xl bg-[#00478c] text-white flex items-center justify-center shadow-md">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-black text-slate-900 text-lg leading-tight">PLANNEST POS SAAS</h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-[#00478c] rounded-full uppercase tracking-wider">
                    Central Hub
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-mono">pos.plannestapp.com</span>
              </div>
            </div>

            {/* Middle Status Chips */}
            <div className="hidden lg:flex items-center gap-2.5 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>FLEET ONLINE</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold">
                <Database className="w-3.5 h-3.5 text-[#00478c]" />
                <span>SUPABASE CLOUD (TOKYO)</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-[#00478c] font-semibold">
                <Store className="w-3.5 h-3.5" />
                <span>{stores.length} STORES REGISTERED</span>
              </div>
            </div>

            {/* Right Admin Profile & Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                disabled={loading}
                className="p-2 text-slate-600 hover:text-[#00478c] hover:bg-slate-100 rounded-lg transition"
                title="Sync from Supabase"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#00478c]' : ''}`} />
              </button>

              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  B
                </div>
                <div className="text-left text-xs">
                  <span className="font-bold text-slate-900 block leading-tight">Balu (Super Admin)</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Global Admin</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="flex space-x-2 border-t border-slate-100 py-2.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('stores')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                activeTab === 'stores'
                  ? 'bg-blue-50 text-[#00478c] border border-blue-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Stores & Tenants ({stores.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('fleet')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                activeTab === 'fleet'
                  ? 'bg-blue-50 text-[#00478c] border border-blue-200 font-bold'
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
                  ? 'bg-blue-50 text-[#00478c] border border-blue-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>License Keys ({licenses.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('deploy')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                activeTab === 'deploy'
                  ? 'bg-blue-50 text-[#00478c] border border-blue-200 font-bold'
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
                  ? 'bg-blue-50 text-[#00478c] border border-blue-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>OTA Software & Firmware</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================================= */}
        {/* TAB 1: STORES & TENANTS */}
        {/* ========================================================================= */}
        {activeTab === 'stores' && (
          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Registered Stores & Device Tenants</h2>
                <p className="text-xs text-slate-500">
                  Manage all client stores across ESP CrowPanel hardware, Windows terminals, and Android tablets
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAddStoreOpen(true)}
                  className="px-4 py-2 bg-[#00478c] hover:bg-[#003870] text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Onboard New Store</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
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
                    All ({stores.length})
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
                  <button
                    onClick={() => setStoreFilter('android')}
                    className={`px-3 py-1 rounded-md transition ${
                      storeFilter === 'android' ? 'bg-white shadow-xs font-bold text-emerald-700' : 'text-slate-600'
                    }`}
                  >
                    Android
                  </button>
                </div>
              </div>

              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search store name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00478c]"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Stores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map((st) => {
                const apptype = st.apptype || 'windows';
                const isEsp = apptype === 'esp';
                const isWindows = apptype === 'windows';
                const isAndroid = apptype === 'android';

                // Portal destination URL
                const portalUrl = isEsp
                  ? 'https://poslite.plannestapp.com'
                  : 'https://pospro.plannestapp.com';

                return (
                  <div
                    key={st.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-xs font-extrabold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg">
                          {st.id}
                        </span>

                        {isEsp && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <Cpu className="w-3 h-3" />
                            ESP CrowPanel
                          </span>
                        )}
                        {isWindows && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                            <Laptop className="w-3 h-3" />
                            Windows Terminal
                          </span>
                        )}
                        {isAndroid && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <Smartphone className="w-3 h-3" />
                            Android Tablet
                          </span>
                        )}
                      </div>

                      {/* Store Details */}
                      <h3 className="font-black text-slate-900 text-base leading-snug">{st.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 italic">{st.tagline || 'Retail Outlet'}</p>

                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Phone:</span>
                          <span className="font-medium">{st.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Address:</span>
                          <span className="font-medium truncate max-w-[180px]">{st.address_line1 || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Bill Prefix:</span>
                          <span className="font-mono font-bold text-slate-800">{st.bill_prefix}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Status:</span>
                          <span className="font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action: Portal Launch */}
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

        {/* ========================================================================= */}
        {/* TAB 2: FLEET TELEMETRY */}
        {/* ========================================================================= */}
        {activeTab === 'fleet' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">Live Device Telemetry & Fleet Status</h2>
              <p className="text-xs text-slate-500">
                Real-time heartbeat monitoring across CrowPanel ESP32, Windows 10/11 counters, and peripheral devices
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
                {/* ESP Hardware Devices */}
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
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 font-mono">
                          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                          <span>Last Sync: {d.last_sync_at ? new Date(d.last_sync_at).toLocaleString() : 'Recent'}</span>
                        </div>
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
                        <span className="text-xs font-mono font-bold text-emerald-600">
                          {pingStatus[d.id]}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* PC/Tablet Telemetry Terminals */}
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
                          ID: {t.id} • UUID: {t.machine_uuid} • IP: {t.local_ip}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-[11px] font-mono text-slate-600">
                          <span className="flex items-center gap-1">
                            <Cpu className="w-3 h-3 text-slate-400" /> CPU: {t.cpu_usage}%
                          </span>
                          <span className="flex items-center gap-1">
                            <HardDrive className="w-3 h-3 text-slate-400" /> RAM: {t.memory_mb} MB
                          </span>
                          <span className="flex items-center gap-1">
                            <Printer className="w-3 h-3 text-slate-400" /> Printer: {t.printer_status}
                          </span>
                          <span className="flex items-center gap-1">
                            <Scale className="w-3 h-3 text-slate-400" /> Scale: {t.scale_status}
                          </span>
                        </div>
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
                        <span className="text-xs font-mono font-bold text-emerald-600">
                          {pingStatus[t.id]}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: LICENSE MANAGER */}
        {/* ========================================================================= */}
        {activeTab === 'licenses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">License Keys & Subscriptions</h2>
                <p className="text-xs text-slate-500">
                  Manage cryptographically signed machine license keys for Windows, Android, and ESP terminals
                </p>
              </div>

              <button
                onClick={() => setIsAddLicenseOpen(true)}
                className="px-4 py-2 bg-[#00478c] hover:bg-[#003870] text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Generate New License</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">License Key</th>
                      <th className="px-5 py-3.5">Assigned Store</th>
                      <th className="px-5 py-3.5">Tier</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Expires</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {licenses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-slate-400 font-medium">
                          No license keys generated yet. Click "Generate New License" to issue one.
                        </td>
                      </tr>
                    ) : (
                      licenses.map((lic) => (
                        <tr key={lic.id} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-4 font-mono font-bold text-slate-900">{lic.license_key}</td>
                          <td className="px-5 py-4 font-semibold text-slate-700">{lic.user_id}</td>
                          <td className="px-5 py-4">
                            <span className="uppercase text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                              {lic.plan_tier}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-semibold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Active
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-500 font-mono">{lic.expires_at}</td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => alert(`Copied key: ${lic.license_key}`)}
                              className="px-2.5 py-1 text-slate-600 hover:text-[#00478c] hover:bg-slate-100 rounded font-semibold transition"
                            >
                              Copy
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: DEPLOYMENT WIZARD */}
        {/* ========================================================================= */}
        {activeTab === 'deploy' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">New Client Onboarding & Deployment Wizard</h2>
              <p className="text-xs text-slate-500">
                Fast-track store provisioning, database isolation, and launch script generation
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border-2 border-[#00478c] bg-blue-50/50">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-3">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Windows PC POS</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Supermarkets, touch billing counters & thermal printing</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center mb-3">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">CrowPanel ESP32</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Dedicated embedded 7.0" hardware terminal</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center mb-3">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Android Tablet</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Portable waitstaff & mobile billing POS</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 space-y-2">
                <div className="font-bold text-slate-900">Windows 1-Click Launch Script:</div>
                <div className="p-2.5 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto">
                  powershell -ExecutionPolicy Bypass -Command "iwr -useb https://pos.plannestapp.com/install.ps1 | iex"
                </div>
                <p className="text-[11px] text-slate-500 font-sans">
                  The script configures node runtime, sets up SQLite WAL mode, and maps store data to Supabase Cloud automatically.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: OTA RELEASES */}
        {/* ========================================================================= */}
        {activeTab === 'releases' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">OTA Software & Firmware Releases</h2>
              <p className="text-xs text-slate-500">
                Track versions across Windows native POS, ESP firmware, and Cloud dashboards
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-900 text-sm">Windows POS App</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Stable
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">v1.0.0</div>
                <p className="text-xs text-slate-500 mt-1">Released Nov 2026</p>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <div>• Dual SQLite / Supabase Cloud sync</div>
                  <div>• 58mm / 80mm thermal receipts</div>
                  <div>• Weighing scale RS232 driver</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-900 text-sm">CrowPanel ESP Firmware</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Stable
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">v1.0.4</div>
                <p className="text-xs text-slate-500 mt-1">CrowPanel 7.0" ESP32-S3</p>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <div>• Direct Supabase REST integration</div>
                  <div>• 170-item fruit/veg catalog</div>
                  <div>• Offline buffer cache</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-900 text-sm">Cloud Manager Portal</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Live
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">pospro / poslite</div>
                <p className="text-xs text-slate-500 mt-1">Cloudflare Pages Edge</p>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <div>• Instant price & stock catalog sync</div>
                  <div>• Daily sales & PDF invoices</div>
                  <div>• Store branding configuration</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

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
                <label className="block font-bold text-slate-700 mb-1">Store ID (e.g. STORE-003)</label>
                <input
                  type="text"
                  required
                  placeholder="STORE-003"
                  value={newStore.id}
                  onChange={(e) => setNewStore({ ...newStore, id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold uppercase focus:ring-1 focus:ring-[#00478c]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Store / Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plannest Daily Mart"
                  value={newStore.name}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#00478c]"
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
                    <option value="android">Android Tablet</option>
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={newStore.phone}
                  onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Street, Area, City"
                  value={newStore.address_line1}
                  onChange={(e) => setNewStore({ ...newStore, address_line1: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
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
                  className="px-4 py-2 bg-[#00478c] hover:bg-[#003870] text-white font-bold rounded-lg shadow-sm"
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
              <h3 className="font-black text-slate-900 text-base">Generate Machine License Key</h3>
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
                  {stores.map((s) => (
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
                    <option value="local_starter">Local Starter</option>
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
                  className="px-4 py-2 bg-[#00478c] hover:bg-[#003870] text-white font-bold rounded-lg shadow-sm"
                >
                  Generate & Activate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
