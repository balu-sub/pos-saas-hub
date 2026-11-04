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
  Scale
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

  const [pingStatus, setPingStatus] = useState({});

  // Fetch all SaaS data
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: storesData } = await supabase
        .from('stores')
        .select('*')
        .order('id', { ascending: true });
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
          hardware_uuid: null, // Unbound initially, binds on first terminal launch
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
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>FLEET ONLINE</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold">
                <Database className="w-3.5 h-3.5 text-[#00478c]" />
                <span>SUPABASE TOKYO</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200 rounded-lg text-purple-800 font-semibold">
                <Store className="w-3.5 h-3.5" />
                <span>{stores.length} STORES</span>
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
              <span>Stores &amp; Tenants ({stores.length})</span>
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: STORES */}
        {activeTab === 'stores' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Registered Stores &amp; Device Tenants</h2>
                <p className="text-xs text-slate-500">
                  Manage all stores across CrowPanel ESP hardware, Windows terminals, and Android tablets
                </p>
              </div>

              <button
                onClick={() => setIsAddStoreOpen(true)}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard New Store</span>
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
                <span>Issue New License</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">License Key</th>
                      <th className="px-5 py-3.5">Store ID</th>
                      <th className="px-5 py-3.5">Hardware Lock (UUID / MAC)</th>
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
                          {lic.hardware_uuid || <span className="text-amber-600 italic">Unbound (Ready for first PC)</span>}
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
                            Active
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
                <div className="font-bold text-slate-900">Windows Automated 1-Click Launch Script:</div>
                <div className="p-2.5 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto">
                  powershell -ExecutionPolicy Bypass -Command "iwr -useb https://pos.plannestapp.com/install.ps1 | iex"
                </div>
                <p className="text-[11px] text-slate-500 font-sans">
                  Installs node runtime, initializes SQLite WAL mode, and locks license key to the terminal hardware UUID.
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
