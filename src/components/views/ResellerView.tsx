import React, { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc, addDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/firebaseError';
import { 
  Award, 
  Globe, 
  Sparkles, 
  Palette, 
  DollarSign, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  Layers, 
  Settings, 
  CreditCard, 
  Plus, 
  Search, 
  Building2, 
  ExternalLink, 
  ShieldCheck, 
  HelpCircle, 
  RefreshCw, 
  Sliders, 
  Download, 
  ArrowUpRight, 
  Activity, 
  Trash2,
  FileText
} from 'lucide-react';

interface WhiteLabelConfig {
  storeName: string;
  headline: string;
  supportEmail: string;
  themeColor: string;
  accentColor: string;
  logoPreset: string;
  customDomain: string;
  domainStatus: 'Configuring' | 'Pending' | 'Active';
  globalMarkup: number;
  regionalMarkup: number;
  countryMarkup: number;
  autoPayoutEnabled: boolean;
  autoPayoutThreshold: number;
  payoutMethod: string;
  payoutDetails: string;
  partnerType: 'travel' | 'telecom' | 'hosting' | 'digital' | 'enterprise';
}

interface ResellerCustomer {
  id: string;
  name: string;
  email: string;
  partnerType: string;
  planPurchased: string;
  status: 'Active' | 'Suspended' | 'Provisioning';
  joinedDate: string;
  totalSpent: number;
  simulatedLines: number;
}

interface CommissionRecord {
  id: string;
  customerName: string;
  planPurchased: string;
  baseCost: number;
  retailPrice: number;
  commission: number;
  date: string;
  status: 'Paid' | 'Pending' | 'processing';
}

interface PayoutTransaction {
  id: string;
  amount: number;
  method: string;
  date: string;
  status: 'Completed' | 'Pending';
  details: string;
}

const PRESETS: Record<string, Partial<WhiteLabelConfig>> = {
  travel: {
    storeName: 'Wanderlust Roam',
    headline: 'Seamless Mobile Data for Your Next Adventure',
    supportEmail: 'concierge@wanderlustroam.com',
    themeColor: 'Emerald',
    accentColor: '#10b981',
    logoPreset: 'Sky SIM',
    customDomain: 'roam.wanderlust-trips.net',
    globalMarkup: 25,
    regionalMarkup: 20,
    countryMarkup: 15,
    partnerType: 'travel'
  },
  telecom: {
    storeName: 'NextGen Cellular',
    headline: 'Instant Virtual eSIM Profiles on Any Device',
    supportEmail: 'wholesale@nextgencell.com',
    themeColor: 'Violet',
    accentColor: '#8b5cf6',
    logoPreset: 'Global Link',
    customDomain: 'esim.nextgencell.co.uk',
    globalMarkup: 12,
    regionalMarkup: 10,
    countryMarkup: 8,
    partnerType: 'telecom'
  },
  hosting: {
    storeName: 'NodeBack Connectivity',
    headline: 'High-Speed Worldwide Roaming Hooks & SIMs',
    supportEmail: 'infrastructure@nodeback.io',
    themeColor: 'Blue',
    accentColor: '#3b82f6',
    logoPreset: 'Nomad Grid',
    customDomain: 'telecom.nodebackhq.com',
    globalMarkup: 15,
    regionalMarkup: 12,
    countryMarkup: 10,
    partnerType: 'hosting'
  },
  digital: {
    storeName: 'NomadNetwork',
    headline: 'Outfitter for Global Tech Professionals & Remote Teams',
    supportEmail: 'help@nomadnetwork.app',
    themeColor: 'Charcoal',
    accentColor: '#374151',
    logoPreset: 'Nomad Grid',
    customDomain: 'sims.nomadnetwork.com',
    globalMarkup: 20,
    regionalMarkup: 18,
    countryMarkup: 12,
    partnerType: 'digital'
  },
  enterprise: {
    storeName: 'GlobalConnect Corporate',
    headline: 'Enterprise Global Roaming & Fleet SIM Management',
    supportEmail: 'telecom-manager@globalcorporate.com',
    themeColor: 'Coral',
    accentColor: '#f43f5e',
    logoPreset: 'Jet Connect',
    customDomain: 'lines.companies-travel.net',
    globalMarkup: 8,
    regionalMarkup: 6,
    countryMarkup: 5,
    partnerType: 'enterprise'
  }
};

export const ResellerView = ({ activeTab }: { activeTab?: string }) => {
  const [currentSub, setCurrentSub] = useState<'White-Label Setup' | 'Reseller Dashboard' | 'Revenue Config' | 'Partner Types'>('Reseller Dashboard');

  // Loading indicator for operations
  const [loading, setLoading] = useState(true);
  const [dnsVerifying, setDnsVerifying] = useState(false);

  // Core configuration state
  const [config, setConfig] = useState<WhiteLabelConfig>({
    storeName: 'My Branded eSIMs',
    headline: 'Unlock 4G/5G Cellular Roaming in 190+ Countries Instantly',
    supportEmail: 'support@mybrand-esim.com',
    themeColor: 'Blue',
    accentColor: '#3b82f6',
    logoPreset: 'Global Link',
    customDomain: 'esim.mycustomdomain.com',
    domainStatus: 'Configuring',
    globalMarkup: 15,
    regionalMarkup: 12,
    countryMarkup: 10,
    autoPayoutEnabled: true,
    autoPayoutThreshold: 100,
    payoutMethod: 'PayPal Account',
    payoutDetails: 'partner-finance@myshop.com',
    partnerType: 'travel'
  });

  // Data layers
  const [customers, setCustomers] = useState<ResellerCustomer[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [payouts, setPayouts] = useState<PayoutTransaction[]>([]);

  // Search Filter / Managed Items Modals
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<ResellerCustomer | null>(null);
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPlan, setNewCustPlan] = useState('Global SuperPass 10GB');
  const [newCustSpent, setNewCustSpent] = useState('45');
  const [isAddingCust, setIsAddingCust] = useState(false);

  // New Payout form state
  const [payoutAmountText, setPayoutAmountText] = useState('150');
  const [payoutError, setPayoutError] = useState('');

  useEffect(() => {
    // Map initial tab selected from Sidebar subItems
    if (activeTab === 'White-Label Setup' || activeTab === 'Custom domain support' || activeTab === 'Custom logos') {
      setCurrentSub('White-Label Setup');
    } else if (activeTab === 'Reseller Dashboard' || activeTab === 'Manage customers' || activeTab === 'Commission tracking') {
      setCurrentSub('Reseller Dashboard');
    } else if (activeTab === 'Revenue Config' || activeTab === 'Commission management' || activeTab === 'Automatic payouts') {
      setCurrentSub('Revenue Config');
    } else if (activeTab === 'Partner Programs' || activeTab === 'Partner Types') {
      setCurrentSub('Partner Types');
    }
  }, [activeTab]);

  // Load configuration and data from Firestore
  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    const bootstrapReseller = async () => {
      try {
        setLoading(true);

        // Load configuration doc
        const configDocRef = doc(db, 'users', uid, 'whiteLabel', 'settings');
        const configSnap = await getDoc(configDocRef);

        if (configSnap.exists()) {
          setConfig(configSnap.data() as WhiteLabelConfig);
        } else {
          // Initialize default configurations
          await setDoc(configDocRef, config);
        }

        // Load or initialize customers
        const custColSnap = await getDocs(collection(db, 'users', uid, 'resellCustomers'));
        if (custColSnap.empty) {
          const defaultCustomers: ResellerCustomer[] = [
            { id: 'rc-1', name: 'Sophia Martinez', email: 'sophia.m@travelvibe.org', partnerType: 'Traveler', planPurchased: 'France 10GB Plan', status: 'Active', joinedDate: '2026-05-10', totalSpent: 28.00, simulatedLines: 1 },
            { id: 'rc-2', name: 'Alex Thompson', email: 'alex@thompsonventures.io', partnerType: 'Digital Nomad', planPurchased: 'USA Unlimited Pass', status: 'Active', joinedDate: '2026-05-22', totalSpent: 64.50, simulatedLines: 2 },
            { id: 'rc-3', name: 'Dr. Evelyn Carter', email: 'e.carter@berlin-hosp.de', partnerType: 'Enterprise', planPurchased: 'Regional Europe 5GB', status: 'Active', joinedDate: '2026-06-01', totalSpent: 18.00, simulatedLines: 1 },
            { id: 'rc-4', name: 'Jonathan Finch', email: 'finchy@nomadhaven.cloud', partnerType: 'Business Traveler', planPurchased: 'Global SuperPass 20GB', status: 'Suspended', joinedDate: '2026-04-12', totalSpent: 110.00, simulatedLines: 1 }
          ];
          for (const item of defaultCustomers) {
            await setDoc(doc(db, 'users', uid, 'resellCustomers', item.id), item);
          }
          setCustomers(defaultCustomers);
        } else {
          setCustomers(custColSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ResellerCustomer)));
        }

        // Load or initialize commission log
        const commColSnap = await getDocs(collection(db, 'users', uid, 'resellCommissions'));
        if (commColSnap.empty) {
          const defaultComms: CommissionRecord[] = [
            { id: 'com-1', customerName: 'Sophia Martinez', planPurchased: 'France 10GB Plan', baseCost: 18.00, retailPrice: 28.00, commission: 10.00, date: '2026-05-10', status: 'Paid' },
            { id: 'com-2', customerName: 'Alex Thompson', planPurchased: 'USA Unlimited Pass', baseCost: 45.00, retailPrice: 64.50, commission: 19.50, date: '2026-05-22', status: 'Paid' },
            { id: 'com-3', customerName: 'Dr. Evelyn Carter', planPurchased: 'Regional Europe 5GB', baseCost: 12.00, retailPrice: 18.00, commission: 6.00, date: '2026-06-01', status: 'Pending' },
            { id: 'com-4', customerName: 'Jonathan Finch', planPurchased: 'Global SuperPass 20GB', baseCost: 80.00, retailPrice: 110.00, commission: 30.00, date: '2026-04-12', status: 'Paid' }
          ];
          for (const item of defaultComms) {
            await setDoc(doc(db, 'users', uid, 'resellCommissions', item.id), item);
          }
          setCommissions(defaultComms);
        } else {
          setCommissions(commColSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommissionRecord)));
        }

        // Load or initialize payouts history
        const payoutColSnap = await getDocs(collection(db, 'users', uid, 'resellPayouts'));
        if (payoutColSnap.empty) {
          const defaultPayouts: PayoutTransaction[] = [
            { id: 'po-1', amount: 30.00, method: 'PayPal (partner-finance@myshop.com)', date: '2026-04-18', status: 'Completed', details: 'Finch transaction validation completed' },
            { id: 'po-2', amount: 29.50, method: 'PayPal (partner-finance@myshop.com)', date: '2026-05-25', status: 'Completed', details: 'Sophia & Alex payouts automated sweep' }
          ];
          for (const item of defaultPayouts) {
            await setDoc(doc(db, 'users', uid, 'resellPayouts', item.id), item);
          }
          setPayouts(defaultPayouts);
        } else {
          setPayouts(payoutColSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PayoutTransaction)));
        }

      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `/users/${uid}`);
      } finally {
        setLoading(false);
      }
    };

    bootstrapReseller();
  }, []);

  // Save WhiteLabel configuration changes
  const saveConfig = async (updatedConfig: WhiteLabelConfig) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    try {
      await updateDoc(doc(db, 'users', uid, 'whiteLabel', 'settings'), updatedConfig as any);
      setConfig(updatedConfig);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `/users/${uid}/whiteLabel/settings`);
    }
  };

  // Preset quick applier
  const applyPreset = async (partnerKey: keyof typeof PRESETS) => {
    const selectedPreset = PRESETS[partnerKey];
    const newConfig = { ...config, ...selectedPreset } as WhiteLabelConfig;
    await saveConfig(newConfig);
    alert(`Applied the optimal ${partnerKey.toUpperCase()} partner presets for '${newConfig.storeName}'!`);
  };

  // Verify Custom Domain action (simulation)
  const verifyCustomDomainDNS = () => {
    setDnsVerifying(true);
    setTimeout(async () => {
      setDnsVerifying(false);
      const newConfig = { ...config, domainStatus: 'Active' as const };
      await saveConfig(newConfig);
      alert(`DNS validation completed! CNAME records mapped successfully on ${config.customDomain}. SSL certificate activated automatically.`);
    }, 1800);
  };

  // Add simulated customer
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newCustName || !newCustEmail) return;
    const uid = auth.currentUser.uid;

    const retailVal = parseFloat(newCustSpent) || 30.00;
    const baseVal = Math.round(retailVal * 0.7 * 100) / 100; // 30% margin base cost
    const commissionVal = Math.round((retailVal - baseVal) * 100) / 100;

    const newCust: ResellerCustomer = {
      id: 'rc-' + Date.now().toString().slice(-4),
      name: newCustName,
      email: newCustEmail,
      partnerType: config.partnerType.toUpperCase() + ' Customer',
      planPurchased: newCustPlan,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
      totalSpent: retailVal,
      simulatedLines: 1
    };

    const newComm: CommissionRecord = {
      id: 'com-' + Date.now().toString().slice(-4),
      customerName: newCustName,
      planPurchased: newCustPlan,
      baseCost: baseVal,
      retailPrice: retailVal,
      commission: commissionVal,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };

    try {
      // Save customer
      await setDoc(doc(db, 'users', uid, 'resellCustomers', newCust.id), newCust);
      // Save commission record
      await setDoc(doc(db, 'users', uid, 'resellCommissions', newComm.id), newComm);

      setCustomers(prev => [newCust, ...prev]);
      setCommissions(prev => [newComm, ...prev]);

      // Reset
      setNewCustName('');
      setNewCustEmail('');
      setIsAddingCust(false);
      alert(`Branded customer '${newCust.name}' and eSIM purchasing pipeline registered!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `/users/${uid}/resellCustomers`);
    }
  };

  // Remove a simulated customer
  const handleRemoveCustomer = async (id: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const isConfirmed = window.confirm("Are you sure you want to remove this customer and their connected billing records?");
    if (!isConfirmed) return;

    try {
      await deleteDoc(doc(db, 'users', uid, 'resellCustomers', id));
      setCustomers(prev => prev.filter(c => c.id !== id));
      alert('Reseller customer successfully deleted.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `/users/${uid}/resellCustomers/${id}`);
    }
  };

  // Request payout trigger (manual trigger)
  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    const amount = parseFloat(payoutAmountText);
    if (isNaN(amount) || amount <= 0) {
      setPayoutError('Please enter a valid payout amount.');
      return;
    }

    if (amount > pendingCommissionTotal) {
      setPayoutError(`Insufficient commission balance. Max withdrawal: $${pendingCommissionTotal.toFixed(2)}`);
      return;
    }

    setPayoutError('');
    const newTx: PayoutTransaction = {
      id: 'po-' + Date.now().toString().slice(-4),
      amount: amount,
      method: config.payoutMethod + ` (${config.payoutDetails})`,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      details: 'Manual withdrawal request from dashboard'
    };

    try {
      await setDoc(doc(db, 'users', uid, 'resellPayouts', newTx.id), newTx);
      setPayouts(prev => [newTx, ...prev]);

      // Update commission status to processed/Paid for items matching withdrawal size
      const commDocsSnap = await getDocs(collection(db, 'users', uid, 'resellCommissions'));
      let runningSum = 0;
      for (const docObj of commDocsSnap.docs) {
        const data = docObj.data() as CommissionRecord;
        if (data.status === 'Pending' && runningSum < amount) {
          runningSum += data.commission;
          await updateDoc(docObj.ref, { status: 'Paid' });
          setCommissions(prev => prev.map(c => c.id === data.id ? { ...c, status: 'Paid' } : c));
        }
      }

      alert(`Your payout request of $${amount.toFixed(2)} has been submitted! Our automated system will disburse to your configured payout details shortly.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `/users/${uid}/resellPayouts`);
    }
  };

  // Computations
  const totalResellerSales = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  
  // Total profit across ALL transactions
  const totalEarnedCommissions = commissions.reduce((sum, c) => sum + c.commission, 0);

  // Profit pending payout (Pending status)
  const pendingCommissionTotal = commissions.filter(c => c.status === 'Pending').reduce((sum, c) => sum + c.commission, 0);

  // Total paid out commissions
  const paidOutTotal = payouts.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
    c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.planPurchased.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Quick Wholesale & Retail plan lists to map custom pricing structures
  const basePlansList = [
    { name: 'Global SuperPass 10GB', region: 'Global', baseCost: 35.00, markupPct: config.globalMarkup },
    { name: 'Regional Europe 5GB', region: 'Regional', baseCost: 12.00, markupPct: config.regionalMarkup },
    { name: 'France 5GB Pass', region: 'Country', baseCost: 8.50, markupPct: config.countryMarkup },
    { name: 'USA Unlimited 14D', region: 'Country', baseCost: 26.00, markupPct: config.countryMarkup },
    { name: 'Asia Explorer 8GB', region: 'Regional', baseCost: 16.00, markupPct: config.regionalMarkup }
  ];

  if (loading) {
    return <div className="text-text-p p-8 text-center bg-bg-app min-h-screen">Spinning up Whitelabel architecture and loading database...</div>;
  }

  return (
    <div className="p-8 text-text-p bg-bg-app min-h-screen max-w-7xl mx-auto">
      {/* Super Header with partner status indicators */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-border-custom pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-accent/15 text-accent text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-accent/25">
              Whitelabel Reseller
            </span>
            <span className="bg-neutral-900 text-text-s text-[10px] px-2 py-0.5 rounded-full border border-border-custom">
              Store: {config.storeName}
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">White-Label Reseller Hub</h2>
          <p className="text-text-s text-sm mt-0.5">Deploy, brand, configure pricing, and scale your global eSIM sales engine seamlessly.</p>
        </div>

        {/* Dynamic sub-tab picker styled as sleek pill button group */}
        <div className="flex flex-wrap gap-1.5 bg-bg-card p-1 rounded-xl border border-border-custom shadow-lg">
          {(['Reseller Dashboard', 'White-Label Setup', 'Revenue Config', 'Partner Types'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentSub(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                currentSub === tab 
                  ? 'bg-accent text-white shadow-md shadow-accent/20 font-bold' 
                  : 'text-text-s hover:text-text-p hover:bg-neutral-900/40'
              }`}
            >
              {tab === 'White-Label Setup' && '🎨 Brand Setup'}
              {tab === 'Reseller Dashboard' && '📊 Reseller Desk'}
              {tab === 'Revenue Config' && '💰 Pricing & Payouts'}
              {tab === 'Partner Types' && '🤝 Partner Presets'}
            </button>
          ))}
        </div>
      </div>

      {/* RENDER VIEW CONTROLS */}
      {currentSub === 'Reseller Dashboard' && (
        <div className="space-y-8">
          {/* Bento Stats Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-bg-card border border-border-custom p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute right-4 top-4 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/10">
                <DollarSign className="text-emerald-400" size={18} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-s">Your Store Gross Volume</span>
              <p className="text-3xl font-extrabold text-text-p mt-2">${totalResellerSales.toFixed(2)}</p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-2 font-medium">
                <ArrowUpRight size={12} />
                <span>Active eSIM sales channels</span>
              </div>
            </div>

            <div className="bg-bg-card border border-border-custom p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute right-4 top-4 bg-accent/15 p-2.5 rounded-xl border border-accent/15">
                <TrendingUp className="text-accent" size={18} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-s">Net Earned Commission</span>
              <p className="text-3xl font-extrabold text-text-p mt-2">${totalEarnedCommissions.toFixed(2)}</p>
              <div className="text-[10px] text-text-s mt-2 font-medium flex justify-between">
                <span>Withdrawn: ${paidOutTotal.toFixed(2)}</span>
                <span className="text-accent font-bold">Unclaimed: ${pendingCommissionTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-bg-card border border-border-custom p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute right-4 top-4 bg-indigo-500/15 p-2.5 rounded-xl border border-indigo-500/15">
                <Users className="text-indigo-400" size={18} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-s">Ported Store Customers</span>
              <p className="text-3xl font-extrabold text-text-p mt-2">{customers.length}</p>
              <div className="flex items-center gap-1 text-[10px] text-indigo-400 mt-2 font-medium">
                <CheckCircle size={10} />
                <span>100% cloud-provisioned lines</span>
              </div>
            </div>

            <div className="bg-bg-card border border-border-custom p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute right-4 top-4 bg-orange-500/10 p-2.5 rounded-xl border border-orange-500/10">
                <Globe className="text-orange-400" size={18} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-s">Domain Mapping Status</span>
              <p className="text-2xl font-bold text-text-p mt-2.5 truncate">{config.customDomain}</p>
              <div className="flex items-center gap-1.5 text-[10px] mt-2">
                <span className={`inline-block w-2 h-2 rounded-full ${config.domainStatus === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-yellow-500 animate-pulse'}`} />
                <span className={config.domainStatus === 'Active' ? 'text-emerald-400 uppercase font-bold' : 'text-yellow-400 uppercase font-bold'}>
                  {config.domainStatus}
                </span>
                {config.domainStatus !== 'Active' && <span className="text-text-s">(Needs DNS Mapping)</span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sales performance graph (SVG styling) and managed customers */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-bg-card border border-border-custom p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center pb-2">
                  <div>
                    <h3 className="font-bold text-lg text-text-p">Reseller Daily Volume Analytics</h3>
                    <p className="text-text-s text-xs mt-0.5">Gross sales and accumulated profit margin metrics.</p>
                  </div>
                  <span className="text-[10px] text-text-s bg-neutral-900 border border-border-custom py-1.5 px-3 rounded-lg flex items-center gap-1">
                    <Activity size={12} className="text-emerald-400" /> Real-time active pipelines
                  </span>
                </div>

                <div className="h-64 flex flex-col justify-end">
                  {/* High Quality Custom SVG Line Chart representation of gross revenue vs net commission */}
                  <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="0" y1="50" x2="500" y2="50" stroke="#1f2937" strokeDasharray="3,3" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#1f2937" strokeDasharray="3,3" />
                    <line x1="0" y1="150" x2="500" y2="150" stroke="#1f2937" strokeDasharray="3,3" />
                    
                    {/* Gross Sales Area */}
                    <path 
                      d="M 10,180 Q 90,140 170,110 T 330,70 T 490,40 L 490,190 L 10,190 Z" 
                      fill="url(#grossGrad)" 
                    />
                    {/* Gross Sales Line */}
                    <path 
                      d="M 10,180 Q 90,140 170,110 T 330,70 T 490,40" 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="2.5" 
                    />

                    {/* Profit Area */}
                    <path 
                      d="M 10,190 Q 90,175 170,160 T 330,145 T 490,130 L 490,190 L 10,190 Z" 
                      fill="url(#profitGrad)" 
                    />
                    {/* Profit Line */}
                    <path 
                      d="M 10,190 Q 90,175 170,160 T 330,145 T 490,130" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="2.5" 
                    />

                    {/* Dots indicating data highlights */}
                    <circle cx="170" cy="110" r="4.5" fill="#3b82f6" stroke="#000" strokeWidth="1.5" />
                    <circle cx="330" cy="70" r="4.5" fill="#3b82f6" stroke="#000" strokeWidth="1.5" />
                    <circle cx="490" cy="40" r="4.5" fill="#3b82f6" stroke="#000" strokeWidth="1.5" />

                    <circle cx="170" cy="160" r="4.5" fill="#10b981" stroke="#000" strokeWidth="1.5" />
                    <circle cx="330" cy="145" r="4.5" fill="#10b981" stroke="#000" strokeWidth="1.5" />
                    <circle cx="490" cy="130" r="4.5" fill="#10b981" stroke="#000" strokeWidth="1.5" />
                  </svg>
                  <div className="flex justify-between text-[9px] text-text-s px-1 mt-1 font-mono">
                    <span>May 10</span>
                    <span>May 18</span>
                    <span>May 25</span>
                    <span>June 01</span>
                    <span>Today (June 04)</span>
                  </div>
                </div>

                <div className="flex justify-end gap-5 text-[10px] pt-2 font-semibold">
                  <div className="flex items-center gap-1.5 text-blue-400">
                    <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block" />
                    <span>Reseller Customer Gross Orders</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                    <span>Net Takehome Profit (Commission)</span>
                  </div>
                </div>
              </div>

              {/* Customers management sub-view */}
              <div className="bg-bg-card border border-border-custom p-6 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="font-bold text-lg">Branded Store Customers</h3>
                    <p className="text-text-s text-xs mt-0.5">Real-time user base purchasing cellular credits through your custom storefront.</p>
                  </div>
                  <button
                    onClick={() => setIsAddingCust(true)}
                    className="bg-accent text-white py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-accent/80 transition"
                  >
                    <Plus size={14} /> Add Customer
                  </button>
                </div>

                <div className="flex items-center bg-neutral-900/60 border border-border-custom px-3 py-2 rounded-lg gap-2">
                  <Search className="text-text-s" size={14} />
                  <input
                    type="text"
                    placeholder="Search customers by name, email, plan..."
                    className="bg-transparent text-xs w-full focus:outline-none placeholder-text-s"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                </div>

                <div className="overflow-x-auto border border-border-custom/40 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-950/50 border-b border-border-custom text-text-s text-[10px] uppercase font-bold">
                        <th className="py-3 px-4">Client Name</th>
                        <th className="py-3 px-4">Active Plan</th>
                        <th className="py-3 px-4">Spent (Retail)</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-custom/30 font-medium">
                      {filteredCustomers.map(c => (
                        <tr key={c.id} className="hover:bg-neutral-900/20 transition-all cursor-pointer" onClick={() => setSelectedCustomer(c)}>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-text-p">{c.name}</p>
                            <p className="text-[10px] text-text-s font-mono">{c.email}</p>
                          </td>
                          <td className="py-3.5 px-4 text-text-p">{c.planPurchased}</td>
                          <td className="py-3.5 px-4 font-mono text-text-p">${c.totalSpent.toFixed(2)}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${
                              c.status === 'Active' 
                                ? 'bg-emerald-950/35 text-emerald-400 border-emerald-500/10' 
                                : 'bg-red-950/35 text-red-400 border-red-500/10'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleRemoveCustomer(c.id)} className="text-text-s hover:text-red-400 p-1 bg-neutral-900 hover:bg-neutral-800 rounded border border-border-custom">
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Commissions Tracking Sidebar & Payout Tools */}
            <div className="space-y-6">
              <div className="bg-bg-card border border-border-custom p-6 rounded-2xl space-y-4">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-text-s">Commission Pipeline Ledger</h4>
                <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                  {commissions.map(cc => (
                    <div key={cc.id} className="p-3.5 bg-neutral-900/60 border border-border-custom/75 rounded-xl space-y-1.5 hover:border-accent/40 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-xs text-text-p">{cc.customerName}</p>
                          <p className="text-[9px] text-text-s font-mono">{cc.planPurchased}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                          cc.status === 'Paid' 
                            ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/10' 
                            : 'bg-yellow-950/30 text-yellow-400 border border-yellow-500/10'
                        }`}>
                          {cc.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-border-custom/40 text-[10px]">
                        <span className="text-text-s font-medium">{cc.date}</span>
                        <span className="font-bold text-text-p text-right">
                          Reseller Cut: <span className="text-emerald-400">+${cc.commission.toFixed(2)}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automatic Payout setup widget */}
              <div className="bg-gradient-to-br from-bg-card to-emerald-950/15 border border-border-custom p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-emerald-400" size={18} />
                  <h4 className="font-bold text-sm text-text-p">Payout Management</h4>
                </div>
                <p className="text-text-s text-xs leading-relaxed">Automatic payouts are routed once commissions reach your designated threshold.</p>

                <div className="p-3 bg-black/40 border border-border-custom rounded-xl space-y-1">
                  <span className="text-[10px] text-text-s uppercase font-semibold">Available Commission Balance</span>
                  <p className="text-2xl font-black text-emerald-400">${pendingCommissionTotal.toFixed(2)}</p>
                  <p className="text-[9px] text-text-s">Primary target: {config.payoutMethod}</p>
                </div>

                <form onSubmit={handleRequestPayout} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-text-s uppercase mb-1">Request Manual Draft ($ USD)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        className="bg-neutral-950 text-xs text-text-p border border-border-custom rounded-lg p-2 flex-1 focus:outline-none font-mono"
                        value={payoutAmountText}
                        onChange={(e) => setPayoutAmountText(e.target.value)}
                      />
                      <button 
                        type="submit"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-2 rounded-lg text-xs transition"
                      >
                        Request Payout
                      </button>
                    </div>
                    {payoutError && <p className="text-[10px] text-red-400 mt-1">{payoutError}</p>}
                  </div>
                </form>

                <div className="pt-2">
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-text-s mb-2 border-b border-border-custom/50 pb-1">Payout Actions Log</h5>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {payouts.map(p => (
                      <div key={p.id} className="flex justify-between items-center text-[10px] p-1.5 bg-black/20 rounded">
                        <div>
                          <p className="font-bold text-text-p">${p.amount.toFixed(2)} USD Passed</p>
                          <p className="text-[8px] text-text-s">{p.date}</p>
                        </div>
                        <span className="text-[8px] px-1.5 py-0.5 font-bold uppercase bg-neutral-900 border border-border-custom rounded text-emerald-400">
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentSub === 'White-Label Setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Side - Column width 7 */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-bg-card border border-border-custom p-8 rounded-2xl space-y-6">
              <div className="flex gap-2 items-center border-b border-border-custom pb-4">
                <Palette className="text-accent" size={18} />
                <h3 className="text-xl font-bold">Custom Brand Customization</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider mb-2">My Branded eSIM Store Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-neutral-900 border border-border-custom rounded-lg py-3 px-4 text-sm focus:outline-none"
                    value={config.storeName}
                    onChange={(e) => saveConfig({ ...config, storeName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider mb-2">Configured Support Email</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-neutral-900 border border-border-custom rounded-lg py-3 px-4 text-sm focus:outline-none"
                    value={config.supportEmail}
                    onChange={(e) => saveConfig({ ...config, supportEmail: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider mb-2">Store slogan & Primary Header</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-neutral-900 border border-border-custom rounded-lg py-3 px-4 text-sm focus:outline-none"
                    value={config.headline}
                    onChange={(e) => saveConfig({ ...config, headline: e.target.value })}
                  />
                </div>

                {/* Theme presets and Custom Hex code block */}
                <div>
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider mb-2">Primary Color Theme</label>
                  <div className="flex flex-wrap gap-2.5">
                    {['Blue', 'Emerald', 'Violet', 'Coral', 'Charcoal'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          const hexMap: Record<string, string> = { Blue: '#3b82f6', Emerald: '#10b981', Violet: '#8b5cf6', Coral: '#f43f5e', Charcoal: '#374151' };
                          saveConfig({ ...config, themeColor: c, accentColor: hexMap[c] });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          config.themeColor === c 
                            ? 'bg-neutral-800 border-accent text-accent font-bold scale-105' 
                            : 'bg-neutral-900 border-border-custom text-text-s hover:text-text-p'
                        }`}
                      >
                        <span className={`inline-block w-2.5 h-2.5 rounded-full mr-1.5`} style={{ 
                          backgroundColor: c === 'Blue' ? '#3b82f6' : c === 'Emerald' ? '#10b981' : c === 'Violet' ? '#8b5cf6' : c === 'Coral' ? '#f43f5e' : '#374151'
                        }} />
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider mb-2">Exact Accent Hex Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      className="bg-transparent border border-border-custom rounded-lg w-12 h-10 cursor-pointer p-0.5"
                      value={config.accentColor}
                      onChange={(e) => saveConfig({ ...config, accentColor: e.target.value })}
                    />
                    <input
                      type="text"
                      className="bg-neutral-900 border border-border-custom rounded-lg px-3 py-2 text-xs flex-1 focus:outline-none font-mono"
                      value={config.accentColor}
                      onChange={(e) => saveConfig({ ...config, accentColor: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider mb-2">Branded Logo Presets</label>
                  <div className="flex flex-wrap gap-2">
                    {['Global Link', 'Sky SIM', 'Jet Connect', 'Nomad Grid'].map(l => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => saveConfig({ ...config, logoPreset: l })}
                        className={`text-xs py-1.5 px-3 rounded-lg border transition ${
                          config.logoPreset === l 
                            ? 'bg-accent/10 border-accent text-accent font-bold' 
                            : 'bg-neutral-900 border-border-custom text-text-s hover:text-text-p'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Domain Section card */}
            <div className="bg-bg-card border border-border-custom p-8 rounded-2xl space-y-6">
              <div className="flex gap-2 items-center border-b border-border-custom pb-4">
                <Globe className="text-indigo-400" size={18} />
                <h3 className="text-xl font-bold">Custom Domain SSL Mapping</h3>
              </div>
              <p className="text-xs text-text-s">Allow your customers to order and provision eSIM lines under your private website domain address. Perfect for premium white-label setups.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider mb-2">Reseller Domain URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="w-full bg-neutral-900 border border-border-custom rounded-lg py-2.5 px-4 text-sm font-mono focus:outline-none flex-1"
                      placeholder="e.g. esim.yourtravelblog.com"
                      value={config.customDomain}
                      onChange={(e) => saveConfig({ ...config, customDomain: e.target.value, domainStatus: 'Pending' })}
                    />
                    <button
                      onClick={verifyCustomDomainDNS}
                      disabled={dnsVerifying}
                      className="bg-accent hover:bg-accent/80 text-white text-xs font-semibold px-4 rounded-lg transition disabled:opacity-40"
                    >
                      {dnsVerifying ? 'Verifying...' : 'Verify DNS Records'}
                    </button>
                  </div>
                </div>

                {/* Dynamic Mapping Instructions */}
                <div className="p-5 bg-neutral-950 border border-border-custom rounded-xl space-y-3.5">
                  <h4 className="font-bold text-xs text-text-p uppercase tracking-wider">Required DNS Records configuration</h4>
                  <p className="text-[11px] text-text-s">Login to your domain provider (GoDaddy, Namecheap, Cloudflare) and append the target CNAME config:</p>
                  
                  <div className="overflow-x-auto text-[10px] font-mono">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border-custom/50 text-text-s text-left">
                          <th className="pb-1.5 font-bold">Type</th>
                          <th className="pb-1.5 font-bold">Host / Subdomain</th>
                          <th className="pb-1.5 font-bold">Target Proxy Server</th>
                          <th className="pb-1.5 font-bold">TTL</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="text-text-p border-b border-border-custom/30">
                          <td className="py-2 text-emerald-400">CNAME</td>
                          <td className="py-2">esim</td>
                          <td className="py-2">proxy.danscom.net</td>
                          <td className="py-2">3600 (1 Hr)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Branded Store Live Simulator - Column width 5 */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-bg-dark border border-neutral-800 p-1.5 rounded-3xl space-y-2 sticky top-6 shadow-2xl">
              {/* Simulator Header mock border */}
              <div className="flex justify-between items-center px-4 pt-4 pb-2 border-b border-border-custom/40 bg-bg-card rounded-t-2xl">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block" />
                  <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full inline-block" />
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" />
                </div>
                <div className="bg-neutral-900 border border-border-custom/75 px-4 py-1.5 rounded-lg text-[9px] font-mono text-text-s flex items-center gap-1.5 w-60 truncate">
                  <ShieldCheck size={10} className="text-emerald-400 flex-shrink-0" /> https://{config.customDomain || 'esim.custom-shop.com'}
                </div>
                <ExternalLink size={12} className="text-text-s" />
              </div>

              {/* Simulator Content Area */}
              <div className="p-6 bg-gradient-to-b from-neutral-950 to-neutral-900 rounded-b-2xl min-h-[460px] space-y-6 text-center select-none animate-fade-in relative overflow-hidden">
                
                {/* Background flare dynamically colored using config gradient theme */}
                <div 
                  className="absolute left-1/2 top-11 -translate-x-1/2 w-48 h-48 rounded-full blur-[80px] opacity-15 pointer-events-none transition-all duration-300"
                  style={{ backgroundColor: config.accentColor }}
                />

                {/* Logo and Brand header */}
                <div className="space-y-2.5 relative pt-4">
                  <div className="mx-auto w-10 h-10 rounded-xl flex items-center justify-center border transition shadow-inner font-black text-xs text-white"
                       style={{ borderColor: config.accentColor, backgroundColor: config.accentColor + '1b' }}
                  >
                    {config.logoPreset === 'Global Link' && '🌐'}
                    {config.logoPreset === 'Sky SIM' && '✈️'}
                    {config.logoPreset === 'Jet Connect' && '🚀'}
                    {config.logoPreset === 'Nomad Grid' && '⊞'}
                  </div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">{config.storeName}</h3>
                  <p className="text-[10px] text-text-s max-w-xs mx-auto leading-normal">{config.headline}</p>
                </div>

                {/* Custom plan retail cards (Markup active in simulator!) */}
                <div className="space-y-2.5 relative pt-4 text-left">
                  <span className="text-[9px] font-bold text-text-s uppercase tracking-widest block mb-1">Available cellular plans:</span>
                  {[
                    { name: 'Global Unlimited 10D', base: 30.00, markupValue: config.globalMarkup },
                    { name: 'Europe Regional 5GB', base: 12.00, markupValue: config.regionalMarkup },
                    { name: 'US Local Explorer 3GB', base: 7.00, markupValue: config.countryMarkup }
                  ].map((p, i) => {
                    const markupAmt = p.base * (p.markupValue / 100);
                    const retailCost = p.base + markupAmt;
                    return (
                      <div key={i} className="p-3 bg-neutral-900/90 border border-neutral-800/80 rounded-xl flex justify-between items-center transition hover:scale-[1.01]">
                        <div>
                          <p className="font-bold text-xs text-neutral-100">{p.name}</p>
                          <p className="text-[9px] text-text-s">Instant high-speed 4G/5G proxy routing</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-extrabold" style={{ color: config.accentColor }}>${retailCost.toFixed(2)}</p>
                          <button className="text-[8px] font-bold text-white rounded px-2.5 py-1 mt-1 transition"
                                  style={{ backgroundColor: config.accentColor }}>
                            Buy eSIM
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Branded Footer */}
                <div className="pt-8 text-[9px] text-text-s border-t border-neutral-800/40 space-y-1 relative">
                  <p>Secure SIM profiles powered by DANSCOM Whitelabel Proxy Node</p>
                  <p>Customer Support: <span className="text-neutral-300 font-medium">{config.supportEmail}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentSub === 'Revenue Config' && (
        <div className="space-y-8">
          
          {/* Custom plan markups management */}
          <div className="bg-bg-card border border-border-custom p-8 rounded-2xl space-y-6">
            <div className="flex gap-2 items-center border-b border-border-custom pb-4">
              <Sliders className="text-accent" size={18} />
              <div>
                <h3 className="text-xl font-bold">Reseller Custom Pricing & Markup Rates</h3>
                <p className="text-text-s text-xs mt-0.5">Control individual preset markups added to our standard wholesale wholesale catalog pricing.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Global Markup */}
              <div className="p-5 bg-neutral-900/60 border border-border-custom/80 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm">Global Plan Markup</h4>
                  <span className="text-sm font-black text-accent">{config.globalMarkup}%</span>
                </div>
                <p className="text-text-s text-xs">Standard markup rate applied globally to multi-continent roaming passports.</p>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full accent-accent bg-neutral-900"
                  value={config.globalMarkup}
                  onChange={(e) => saveConfig({ ...config, globalMarkup: parseInt(e.target.value) })}
                />
              </div>

              {/* Regional Markup */}
              <div className="p-5 bg-neutral-900/60 border border-border-custom/80 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm">Regional Markup</h4>
                  <span className="text-sm font-black text-accent">{config.regionalMarkup}%</span>
                </div>
                <p className="text-text-s text-xs">Markup applied to continent regional bundles like EU plans, LATAM or Asia Packs.</p>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full accent-accent bg-neutral-900"
                  value={config.regionalMarkup}
                  onChange={(e) => saveConfig({ ...config, regionalMarkup: parseInt(e.target.value) })}
                />
              </div>

              {/* Country-Specific Markup */}
              <div className="p-5 bg-neutral-900/60 border border-border-custom/80 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm">Single Country Markup</h4>
                  <span className="text-sm font-black text-accent">{config.countryMarkup}%</span>
                </div>
                <p className="text-text-s text-xs">Markup added to local native networks (e.g., France Local, US Local T-Mobile).</p>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full accent-accent bg-neutral-900"
                  value={config.countryMarkup}
                  onChange={(e) => saveConfig({ ...config, countryMarkup: parseInt(e.target.value) })}
                />
              </div>
            </div>

            {/* Simulated Live Pricing Grid */}
            <div className="pt-4 space-y-4">
              <h4 className="font-bold text-sm">Real-time Retail Price Catalog Simulator</h4>
              <div className="overflow-x-auto border border-border-custom/40 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-950/40 border-b border-border-custom text-text-s text-[10px] uppercase font-semibold">
                      <th className="py-3 px-4">Standard Plan Asset Name</th>
                      <th className="py-3 px-4">Pass Type</th>
                      <th className="py-3 px-4">Base Wholesale Cost</th>
                      <th className="py-3 px-4">Reseller Markup Pct</th>
                      <th className="py-3 px-4">Branded Retail Price</th>
                      <th className="py-3 px-4 text-right">Estimated Yield</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom/30 font-medium font-mono text-text-p">
                    {basePlansList.map((p, idx) => {
                      const markupValueAmt = p.baseCost * (p.markupPct / 100);
                      const finalRetail = p.baseCost + markupValueAmt;
                      return (
                        <tr key={idx} className="hover:bg-neutral-900/10">
                          <td className="py-3 px-4 font-sans font-semibold text-text-p">{p.name}</td>
                          <td className="py-3 px-4 text-text-s font-sans">{p.region} connectivity</td>
                          <td className="py-3 px-4">${p.baseCost.toFixed(2)}</td>
                          <td className="py-3 px-4 text-accent">+{p.markupPct}%</td>
                          <td className="py-3 px-4 text-emerald-400 font-bold">${finalRetail.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-bold text-text-p">+${markupValueAmt.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Automatic PPayout controls */}
          <div className="bg-bg-card border border-border-custom p-8 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Commission Automatic Sweep Payouts</h3>
              <p className="text-xs text-text-s leading-relaxed">Establish continuous revenue sweeps directly to your banking or financial destination when threshold levels trigger.</p>
              
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center bg-neutral-900/60 p-4 border border-border-custom rounded-xl">
                  <div>
                    <h4 className="font-bold text-xs text-text-p uppercase tracking-wider">Enable Automated Disbursal</h4>
                    <p className="text-[10px] text-text-s">Sweep balance upon hitting target amount.</p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-accent cursor-pointer"
                    checked={config.autoPayoutEnabled}
                    onChange={(e) => saveConfig({ ...config, autoPayoutEnabled: e.target.checked })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider mb-2">Automated Sweep Threshold Amount ($ USD)</label>
                  <select
                    className="w-full bg-neutral-900 border border-border-custom rounded-lg py-2.5 px-4 text-xs focus:outline-none"
                    value={config.autoPayoutThreshold}
                    onChange={(e) => saveConfig({ ...config, autoPayoutThreshold: parseInt(e.target.value) })}
                  >
                    <option value={50}>$50.00 Minimum Draft</option>
                    <option value={100}>$100.00 Standard Tier</option>
                    <option value={200}>$200.00 Medium business</option>
                    <option value={500}>$500.00 Wholesale priority</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm">Disbursal Destination Method</h4>
              <p className="text-xs text-text-s">Select the primary bank, wire transfer or wallet pipeline where funds are delivered.</p>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider mb-2">Payout Gateway Provider</label>
                  <select
                    className="w-full bg-neutral-900 border border-border-custom rounded-lg py-2.5 px-4 text-xs focus:outline-none"
                    value={config.payoutMethod}
                    onChange={(e) => saveConfig({ ...config, payoutMethod: e.target.value })}
                  >
                    <option value="PayPal Account">PayPal Instant Email Gateway</option>
                    <option value="Stripe Transfer">Stripe Connect Balance Port</option>
                    <option value="Direct ACH Wire">Direct ACH / SEPA Corporate Wire</option>
                    <option value="USDT TRC20 Wallet">Crypto Tether USDT (TRC-20 protocol)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider mb-2">Destination Address / Email / IBAN details</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-neutral-900 border border-border-custom rounded-lg py-2.5 px-4 text-xs font-mono focus:outline-none"
                    value={config.payoutDetails}
                    onChange={(e) => saveConfig({ ...config, payoutDetails: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentSub === 'Partner Types' && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-bg-card border border-border-custom p-8 rounded-2xl space-y-6">
            <div>
              <h3 className="text-xl font-bold">Partner Configuration & Target Templates</h3>
              <p className="text-text-s text-xs mt-1">Accelerate deployment by choosing your partner type. Clicking on any target profile applies best-practice branding themes, default markups, and workflow integrations immediately.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Travel Agencies */}
              <div className={`p-6 border rounded-2xl space-y-3 cursor-pointer transition hover:scale-[1.01] hover:border-accent/40 ${config.partnerType === 'travel' ? 'bg-emerald-950/20 border-emerald-500/40 relative' : 'bg-neutral-900/60 border-border-custom'}`}
                   onClick={() => applyPreset('travel')}>
                {config.partnerType === 'travel' && <span className="absolute top-3 right-3 text-emerald-400 text-xs font-bold">✓ Active Target</span>}
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                    <Sparkles className="text-emerald-400" size={18} />
                  </div>
                  <h4 className="font-extrabold text-sm text-text-p">Travel Agencies & Tour Operators</h4>
                </div>
                <p className="text-text-s text-xs leading-normal">Perfect for adding roaming packages directly to hotel, flight and cruise ticket booking confirmations.</p>
                <div className="p-3 bg-black/45 rounded-xl border border-border-custom/50 text-[10px] space-y-1">
                  <p className="font-bold text-text-p">Optimal Theme: Emerald Green</p>
                  <p className="text-text-s">Includes: Auto-generate printable setup PDF itineraries.</p>
                </div>
              </div>

              {/* Telecom Providers */}
              <div className={`p-6 border rounded-2xl space-y-3 cursor-pointer transition hover:scale-[1.01] hover:border-accent/40 ${config.partnerType === 'telecom' ? 'bg-violet-950/20 border-violet-500/40 relative' : 'bg-neutral-900/60 border-border-custom'}`}
                   onClick={() => applyPreset('telecom')}>
                {config.partnerType === 'telecom' && <span className="absolute top-3 right-3 text-violet-400 text-xs font-bold">✓ Active Target</span>}
                <div className="flex items-center gap-3">
                  <div className="bg-violet-500/10 p-2 rounded-xl border border-violet-500/20">
                    <Building2 className="text-violet-400" size={18} />
                  </div>
                  <h4 className="font-extrabold text-sm text-text-p">Telecom Providers & ISPs</h4>
                </div>
                <p className="text-text-s text-xs leading-normal">Extend your local domestic network and allow your cellular subscribers to access global networks under your brand.</p>
                <div className="p-3 bg-black/45 rounded-xl border border-border-custom/50 text-[10px] space-y-1">
                  <p className="font-bold text-text-p">Optimal Theme: Deep Violet</p>
                  <p className="text-text-s">Includes: Live wholesale mapping controls & direct API nodes.</p>
                </div>
              </div>

              {/* Hosting Companies */}
              <div className={`p-6 border rounded-2xl space-y-3 cursor-pointer transition hover:scale-[1.01] hover:border-accent/40 ${config.partnerType === 'hosting' ? 'bg-blue-950/20 border-blue-500/40 relative' : 'bg-neutral-900/60 border-border-custom'}`}
                   onClick={() => applyPreset('hosting')}>
                {config.partnerType === 'hosting' && <span className="absolute top-3 right-3 text-blue-400 text-xs font-bold">✓ Active Target</span>}
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2 rounded-xl border border-blue-500/20">
                    <Globe className="text-blue-400" size={18} />
                  </div>
                  <h4 className="font-extrabold text-sm text-text-p">Hosting & Domain Registry Groups</h4>
                </div>
                <p className="text-text-s text-xs leading-normal">Cross-sell virtual worldwide SIM cards during domain name registration and hosting checks.</p>
                <div className="p-3 bg-black/45 rounded-xl border border-border-custom/50 text-[10px] space-y-1">
                  <p className="font-bold text-text-p">Optimal Theme: Classic Ocean Royal</p>
                  <p className="text-text-s">Includes: Auto-generate custom store hosting and reverse proxy.</p>
                </div>
              </div>

              {/* Digital Businesses */}
              <div className={`p-6 border rounded-2xl space-y-3 cursor-pointer transition hover:scale-[1.01] hover:border-accent/40 ${config.partnerType === 'digital' ? 'bg-gray-850 border-neutral-500/40 relative animate-pulse-slow' : 'bg-neutral-900/60 border-border-custom'}`}
                   onClick={() => applyPreset('digital')}>
                {config.partnerType === 'digital' && <span className="absolute top-3 right-3 text-neutral-300 text-xs font-bold">✓ Active Target</span>}
                <div className="flex items-center gap-3">
                  <div className="bg-neutral-500/10 p-2 rounded-xl border border-neutral-500/20">
                    <Award className="text-neutral-400" size={18} />
                  </div>
                  <h4 className="font-extrabold text-sm text-text-p">Digital Businesses & SaaS Groups</h4>
                </div>
                <p className="text-text-s text-xs leading-normal">SaaS overlay widgets and custom dashboards for remote web workers, consultants, and offshore teams.</p>
                <div className="p-3 bg-black/45 rounded-xl border border-border-custom/50 text-[10px] space-y-1">
                  <p className="font-bold text-text-p">Optimal Theme: Dark Charcoal Slate</p>
                  <p className="text-text-s">Includes: Branded customer auth portal & client settings widget.</p>
                </div>
              </div>

              {/* Enterprise Partners */}
              <div className={`p-6 border rounded-2xl space-y-3 cursor-pointer transition hover:scale-[1.01] hover:border-accent/40 ${config.partnerType === 'enterprise' ? 'bg-rose-950/20 border-rose-500/40 relative' : 'bg-neutral-900/60 border-border-custom'}`}
                   onClick={() => applyPreset('enterprise')}>
                {config.partnerType === 'enterprise' && <span className="absolute top-3 right-3 text-rose-400 text-xs font-bold">✓ Active Target</span>}
                <div className="flex items-center gap-3">
                  <div className="bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                    <Layers className="text-rose-400" size={18} />
                  </div>
                  <h4 className="font-extrabold text-sm text-text-p">Enterprise Groups & Corporations</h4>
                </div>
                <p className="text-text-s text-xs leading-normal">Deploy branded fleet interfaces for executive traveling staffs with centralized corporate expense billing.</p>
                <div className="p-3 bg-black/45 rounded-xl border border-border-custom/50 text-[10px] space-y-1">
                  <p className="font-bold text-text-p">Optimal Theme: Deep Coral Warm</p>
                  <p className="text-text-s">Includes: Bulk member enrollment tools and consolidated VAT bills.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* 1. View Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-bg-card border border-border-custom rounded-2xl p-8 max-w-md w-full space-y-6">
            <div className="border-b border-border-custom pb-4">
              <h3 className="font-bold text-xl text-text-p">Branded Customer Profile Details</h3>
              <p className="text-[11px] text-text-s mt-1 font-mono">ID: {selectedCustomer.id}</p>
            </div>
            
            <div className="space-y-4 text-xs">
              <div className="flex justify-between py-1 border-b border-border-custom/45">
                <span className="text-text-s font-medium">Customer Name:</span>
                <span className="font-bold text-text-p">{selectedCustomer.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-custom/45">
                <span className="text-text-s font-medium">Customer Email:</span>
                <span className="font-mono text-text-p">{selectedCustomer.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-custom/45">
                <span className="text-text-s font-medium">Registered Category:</span>
                <span className="font-bold text-indigo-400">{selectedCustomer.partnerType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-custom/45">
                <span className="text-text-s font-medium">Active Connected Plan:</span>
                <span className="font-bold text-text-p">{selectedCustomer.planPurchased}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-custom/45">
                <span className="text-text-s font-medium font-mono">Lines Active / Swapped:</span>
                <span className="font-bold text-text-p">{selectedCustomer.simulatedLines} Cellular Profile</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-custom/45">
                <span className="text-text-s font-medium">Total Lifetime Spend:</span>
                <span className="font-black text-emerald-400">${selectedCustomer.totalSpent.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-custom/45">
                <span className="text-text-s font-medium font-mono">Date Registered:</span>
                <span className="text-text-p font-medium">{selectedCustomer.joinedDate}</span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedCustomer(null)}
              className="w-full bg-accent text-white py-2.5 px-4 rounded-lg text-xs font-semibold hover:bg-accent/80 transition"
            >
              Close Customer Details
            </button>
          </div>
        </div>
      )}

      {/* 2. Add Simulated Customer Modal */}
      {isAddingCust && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleAddCustomer} className="bg-bg-card border border-border-custom rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div>
              <h3 className="font-bold text-lg text-text-p">Register Branded eSIM Order</h3>
              <p className="text-text-s text-xs mt-0.5">This simulates an end-customer checking out on your white-label storefront.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-text-s uppercase mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam Parker"
                  className="w-full bg-neutral-900 border border-border-custom rounded-lg p-2.5 text-xs text-text-p focus:outline-none"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-s uppercase mb-1">Customer Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. liam@parker.com"
                  className="w-full bg-neutral-900 border border-border-custom rounded-lg p-2.5 text-xs text-text-p focus:outline-none"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-s uppercase mb-1 font-mono">eSIM Package Purchased</label>
                <select
                  className="w-full bg-neutral-900 border border-border-custom rounded-lg p-2.5 text-xs text-text-p focus:outline-none"
                  value={newCustPlan}
                  onChange={(e) => setNewCustPlan(e.target.value)}
                >
                  <option value="Global SuperPass 10GB">Global SuperPass 10GB</option>
                  <option value="Regional Europe 5GB">Regional Europe 5GB</option>
                  <option value="France 5GB Pass">France 5GB Pass</option>
                  <option value="USA Unlimited 14D">USA Unlimited 14D</option>
                  <option value="Asia Explorer 8GB">Asia Explorer 8GB</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-s uppercase mb-1">Retail Price Charged ($ USD)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-neutral-900 border border-border-custom rounded-lg p-2.5 text-xs text-text-p focus:outline-none font-mono"
                  value={newCustSpent}
                  onChange={(e) => setNewCustSpent(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setIsAddingCust(false)}
                className="flex-1 bg-neutral-900 border border-border-custom py-2 px-3 rounded-lg text-xs font-semibold text-text-s"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 bg-accent text-white py-2 px-3 rounded-lg text-xs font-semibold"
              >
                Launch Invoice
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
