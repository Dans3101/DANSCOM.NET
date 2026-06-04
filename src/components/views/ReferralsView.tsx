import { useState, useEffect } from 'react';
import { Gift, Copy, DollarSign, Award, Users, ArrowUpRight, CheckCircle, RefreshCw } from 'lucide-react';

export const ReferralsView = ({ activeTab }: { activeTab: string }) => {
  const [currentSub, setCurrentSub] = useState('Referral link');
  const [earnings, setEarnings] = useState(120.00);
  const [totalClicks, setTotalClicks] = useState(142);
  const [totalSignups, setTotalSignups] = useState(16);
  
  const referralLink = 'https://danscom.net/ref/danielm615';
  const referralCode = 'DANIELM615';

  const [referrals, setReferrals] = useState([
    { email: 'john.doe@gmail.com', date: '2026-06-03', status: 'Completed', commission: 15.00 },
    { email: 'alice.m@workspace.edu', date: '2026-06-01', status: 'Completed', commission: 12.00 },
    { email: 'kevin.kip@safaricom.co.ke', date: '2026-05-28', status: 'Completed', commission: 20.00 },
    { email: 'lucy.w@outlook.com', date: '2026-05-24', status: 'Pending', commission: 0.00 }
  ]);

  useEffect(() => {
    const subTabs = ['Referral link', 'Referral code', 'Earnings', 'Commission history', 'Referral statistics', 'Payout requests'];
    if (subTabs.includes(activeTab)) {
      setCurrentSub(activeTab);
    }
  }, [activeTab]);

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    alert(`${msg} copied safely to clipboard!`);
  };

  const requestPayout = () => {
    if (earnings < 50) return alert('Minimum earnings of $50 required to trigger a brokerage payout.');
    const confirmPayout = window.confirm(`Initiate instant payout of $${earnings.toFixed(2)} to your main PayPal or Wallet Account?`);
    if (!confirmPayout) return;

    setEarnings(0);
    alert('Broker payout requested successfully. Funds will settle within 2-4 hours.');
  };

  return (
    <div className="p-8 text-text-p bg-bg-app min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-border-custom pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Referrals & Affiliation</h2>
          <p className="text-text-s text-sm mt-1">Leverage your global connectivity link. Refer colleagues and earn 15% billing commission payout from each eSIM purchase.</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-bg-card p-1 rounded-lg border border-border-custom">
          {['Referral link', 'Earnings', 'Commission history', 'Payout requests'].map((tab) => (
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-bg-card border border-border-custom p-6 rounded-xl space-y-2">
          <Gift className="text-accent" size={24} />
          <h4 className="text-xs text-text-s uppercase tracking-wider">Total Earned</h4>
          <p className="text-3xl font-extrabold">${earnings.toFixed(2)}</p>
        </div>
        <div className="bg-bg-card border border-border-custom p-6 rounded-xl space-y-2">
          <Users className="text-purple-400" size={24} />
          <h4 className="text-xs text-text-s uppercase tracking-wider">Successful Signups</h4>
          <p className="text-3xl font-extrabold">{totalSignups}</p>
        </div>
        <div className="bg-bg-card border border-border-custom p-6 rounded-xl space-y-2">
          <Award className="text-teal-400" size={24} />
          <h4 className="text-xs text-text-s uppercase tracking-wider">Affiliation Level</h4>
          <p className="text-3xl font-extrabold text-teal-400">Ambassador</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main controls */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Referral links */}
          {currentSub === 'Referral link' && (
            <div className="bg-bg-card border border-border-custom p-8 rounded-2xl space-y-6">
              <h3 className="text-xl font-bold">Your Electronic Referral Link</h3>
              <p className="text-text-s text-xs mt-1">Share this custom web referral link or card code. When customers register and purchase plans, your commission ledger balance instantly credits.</p>
              
              <div className="space-y-4">
                <div className="flex bg-neutral-900 border border-border-custom rounded-lg overflow-hidden">
                  <input
                    type="text"
                    disabled
                    className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none font-mono text-text-s"
                    value={referralLink}
                  />
                  <button 
                    onClick={() => copyToClipboard(referralLink, 'Referral link')}
                    className="bg-accent hover:bg-accent/80 text-white px-4 py-2 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Copy size={14} /> Copy Link
                  </button>
                </div>

                <div className="flex bg-neutral-900 border border-border-custom rounded-lg overflow-hidden">
                  <input
                    type="text"
                    disabled
                    className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none font-mono text-text-s"
                    value={referralCode}
                  />
                  <button 
                    onClick={() => copyToClipboard(referralCode, 'Referral code')}
                    className="bg-accent hover:bg-accent/80 text-white px-4 py-2 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Copy size={14} /> Copy Code
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Earnings dashboard */}
          {currentSub === 'Earnings' && (
            <div className="bg-bg-card border border-border-custom p-8 rounded-2xl space-y-6">
              <h3 className="text-xl font-bold">Affiliation Conversion Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-900 rounded-xl space-y-1">
                  <span className="text-xs text-text-s">Link total Clicks</span>
                  <p className="text-xl font-bold text-text-p">{totalClicks} Clicks</p>
                </div>
                <div className="p-4 bg-neutral-900 rounded-xl space-y-1">
                  <span className="text-xs text-text-s">Conversion rate</span>
                  <p className="text-xl font-bold text-emerald-400">11.27%</p>
                </div>
              </div>
            </div>
          )}

          {/* History ledger */}
          {currentSub === 'Commission history' && (
            <div className="bg-bg-card border border-border-custom rounded-2xl p-6 space-y-4 animate-fade-in">
              <h3 className="font-bold text-lg">Detailed Referral Settle Ledger</h3>
              <div className="divide-y divide-border-custom">
                {referrals.map((ref, idx) => (
                  <div key={idx} className="py-4 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-semibold text-text-p">{ref.email}</p>
                      <p className="text-xs text-text-s mt-0.5">{ref.date}</p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${ref.status === 'Completed' ? 'bg-emerald-950/20 text-emerald-400' : 'bg-neutral-900 text-text-s'}`}>{ref.status}</span>
                      <span className="font-bold">${ref.commission.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request payout triggers */}
          {currentSub === 'Payout requests' && (
            <div className="bg-bg-card border border-border-custom rounded-2xl p-8 space-y-6 animate-fade-in">
              <h3 className="font-bold text-lg">Affiliate Balance Settlement</h3>
              <p className="text-text-s text-xs">Instantly cash out earnings to linked payout profiles.</p>
              
              <div className="p-6 bg-neutral-900 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-s">Withdrawable commission:</span>
                  <span className="font-extrabold text-text-p text-lg">${earnings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-border-custom/50">
                  <span className="text-text-s">Payout Channel:</span>
                  <span className="font-semibold text-accent">Default PayPal Wallet</span>
                </div>
              </div>

              <button
                onClick={requestPayout}
                className="w-full bg-accent hover:bg-accent/80 text-white font-bold py-3 rounded-lg text-xs"
              >
                Trigger Broker Cashout
              </button>
            </div>
          )}

        </div>

        {/* Affiliate information side widgets */}
        <div className="space-y-6">
          <div className="bg-neutral-900/40 p-6 rounded-2xl border border-border-custom space-y-4">
            <h4 className="font-bold text-sm">Program Agreement SLA</h4>
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle className="text-emerald-400" size={14} />
              <p className="text-text-s">No duplicate cookie IP signups allowed</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle className="text-emerald-400" size={14} />
              <p className="text-text-s">Minimum threshold cashout $50.00</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
