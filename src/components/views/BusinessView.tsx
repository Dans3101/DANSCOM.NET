import { useState, useEffect } from 'react';
import { Briefcase, Building2, TrendingUp, Key, Lock, Users, Receipt, Plus, Settings, CheckCircle } from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export const BusinessView = ({ activeTab }: { activeTab: string }) => {
  const [currentSub, setCurrentSub] = useState('Account management');
  const [companyName, setCompanyName] = useState('Musembi Tech Solutions');
  const [businessTaxId, setBusinessTaxId] = useState('TX-49201920-E');
  const [corporateEmail, setCorporateEmail] = useState('corporate@musembitech.com');
  const [apiKey, setApiKey] = useState('ds_live_9201a9df28bc741d8e120199e1af3');
  const [apiSecret, setApiSecret] = useState('ds_sec_49201e8fab3dc031920acdef77201ff7a');
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    const subTabs = ['Account management', 'Company profile', 'Bulk eSIM purchases', 'Team management', 'Business invoices', 'API access', 'Expense tracking', 'Corporate plans'];
    if (subTabs.includes(activeTab)) {
      setCurrentSub(activeTab);
    }
  }, [activeTab]);

  const handleCreateAPIKey = () => {
    const freshKey = 'ds_live_' + Array.from({length: 24}, () => Math.random().toString(36)[2]).join('');
    setApiKey(freshKey);
    alert('New Live Developer Endpoint key created.');
  };

  return (
    <div className="p-8 text-text-p bg-bg-app min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-border-custom pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Enterprise & Business Control</h2>
          <p className="text-text-s text-sm mt-1">Settle corporate subscriptions, purchase bulk connectivity credits, and provision automated API keys.</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-bg-card p-1 rounded-lg border border-border-custom">
          {['Account management', 'Company profile', 'Bulk eSIM purchases', 'API access', 'Expense tracking'].map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentSub(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${currentSub === tab ? 'bg-accent text-white' : 'text-text-s hover:text-text-p'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main board wrapper */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Business configurations */}
          {currentSub === 'Account management' && (
            <div className="bg-bg-card border border-border-custom p-8 rounded-2xl space-y-6">
              <h3 className="text-xl font-bold">Enterprise Portal Overview</h3>
              <p className="text-text-s text-xs mt-1">Control multiple employee profiles and track corporate telecom spending securely.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-black/40 border border-border-custom rounded-xl space-y-1">
                  <span className="text-[10px] text-text-s uppercase font-semibold">Spending limit this cycle</span>
                  <p className="text-2xl font-bold">$1,500.00</p>
                  <p className="text-[10px] text-emerald-400 mt-1">$425.20 already spent</p>
                </div>
                <div className="p-5 bg-black/40 border border-border-custom rounded-xl space-y-1">
                  <span className="text-[10px] text-text-s uppercase font-semibold">Assigned active lines</span>
                  <p className="text-2xl font-bold">14 Lines</p>
                  <p className="text-[10px] text-accent mt-1">4 pending setups</p>
                </div>
              </div>
            </div>
          )}

          {/* Business Profile details */}
          {currentSub === 'Company profile' && (
            <form onSubmit={(e) => { e.preventDefault(); alert('Enterprise profile saved.'); }} className="bg-bg-card border border-border-custom p-8 rounded-2xl space-y-6">
              <h3 className="text-xl font-bold">Company Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider mb-2">Registered Company name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-neutral-900 border border-border-custom rounded-lg py-3 px-4 text-sm focus:outline-none"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider mb-2">TAX Registration ID / EIN</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-neutral-900 border border-border-custom rounded-lg py-3 px-4 text-sm focus:outline-none"
                    value={businessTaxId}
                    onChange={(e) => setBusinessTaxId(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider mb-2">Corporate Billing address Email</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-neutral-900 border border-border-custom rounded-lg py-3 px-4 text-sm focus:outline-none"
                    value={corporateEmail}
                    onChange={(e) => setCorporateEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-accent hover:bg-accent/80 text-white font-bold py-2.5 px-6 rounded-lg text-xs transition"
              >
                Sync Business Profile
              </button>
            </form>
          )}

          {/* Bulk eSIM purchasing tool */}
          {currentSub === 'Bulk eSIM purchases' && (
            <div className="bg-bg-card border border-border-custom p-6 rounded-2xl space-y-4">
              <h3 className="text-xl font-bold">Bulk Purchase eSIM Packages</h3>
              <p className="text-text-s text-xs">Register and customize custom batches of eSIM QR codes for team members, flight passengers, or international visitors.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-5 bg-neutral-900 border border-border-custom rounded-xl space-y-3">
                  <h4 className="font-bold text-sm">Starter Corporate Batch (10 eSIMs)</h4>
                  <p className="text-xs text-text-s">Global 5GB per member plans, fully customizable Validity.</p>
                  <p className="text-lg font-bold text-accent">$120.00 total</p>
                  <button onClick={() => alert('Starter pack of 10 eSIM assets purchased! Access them in corporate workspace.')} className="bg-accent text-white py-1.5 px-3 rounded text-xs font-semibold">Buy Starter Batch</button>
                </div>

                <div className="p-5 bg-neutral-900 border border-border-custom rounded-xl space-y-3">
                  <h4 className="font-bold text-sm">Custom Bulk Batch Builder</h4>
                  <p className="text-xs text-text-s">Provision bulk quantities and connect custom billing cycles directly.</p>
                  <button onClick={() => alert('Contacting enterprise sales team coordinates to design custom tariff rates.')} className="bg-neutral-800 text-white border border-border-custom py-1.5 px-3 rounded text-xs font-semibold">Contact Sales</button>
                </div>
              </div>
            </div>
          )}

          {/* API Developer access key configurators */}
          {currentSub === 'API access' && (
            <div className="bg-bg-card border border-border-custom p-8 rounded-2xl space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Developer API Token Integration</h3>
                  <p className="text-text-s text-xs mt-1">Automate eSIM generation and profile allocation directly inside your booking CRM using JSON REST endpoints.</p>
                </div>
                <button 
                  onClick={handleCreateAPIKey}
                  className="bg-accent text-white px-3 py-2 rounded-lg text-xs font-semibold"
                >
                  Create Live Token
                </button>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider mb-2">Live API Token</label>
                  <input
                    type="text"
                    disabled
                    className="w-full bg-neutral-900/60 border border-border-custom rounded-lg py-3 px-4 font-mono text-xs text-text-s focus:outline-none"
                    value={apiKey}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-text-s uppercase tracking-wider">Secret Endpoint Token</label>
                    <button 
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-xs text-accent font-semibold hover:underline"
                    >
                      {showSecret ? 'Mask Secret' : 'Reveal Secret'}
                    </button>
                  </div>
                  <input
                    type={showSecret ? 'text' : 'password'}
                    disabled
                    className="w-full bg-neutral-900/60 border border-border-custom rounded-lg py-3 px-4 font-mono text-xs text-text-s focus:outline-none"
                    value={apiSecret}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Corporate expense reports ledger */}
          {currentSub === 'Expense tracking' && (
            <div className="bg-bg-card border border-border-custom rounded-2xl p-6 space-y-4">
              <h3 className="text-xl font-bold">Enterprise Expense Tracker</h3>
              <p className="text-text-s text-xs">Verify billing invoice cycles, assign departments, and export consolidated tax logs.</p>
              
              <div className="p-6 bg-neutral-900 rounded-xl space-y-2 text-xs border border-border-custom">
                <div className="flex justify-between">
                  <span className="text-text-s">Marketing Department (6 eSIMs):</span>
                  <span className="font-bold text-text-p">$210.00 spent</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border-custom/55">
                  <span className="text-text-s">Executive Travel (4 eSIMs):</span>
                  <span className="font-bold text-text-p">$114.50 spent</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border-custom/55">
                  <span className="text-text-s">Sales Roaming Operations (4 eSIMs):</span>
                  <span className="font-bold text-text-p">$100.70 spent</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Diagnostic widgets */}
        <div className="space-y-6">
          <div className="bg-neutral-900/40 p-6 rounded-2xl border border-border-custom space-y-4">
            <h4 className="font-bold text-sm">Enterprise SLA Guarantee</h4>
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle className="text-emerald-400" size={14} />
              <p className="text-text-s leading-relaxed">Dedicated account manager allocations</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle className="text-emerald-400" size={14} />
              <p className="text-text-s leading-relaxed">99.99% system uptime SLA contract</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
