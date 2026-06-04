import { useState, useEffect } from 'react';
import { Phone, Mail, Globe, MessageSquare, Plus, CheckCircle, Shield, ToggleLeft, ToggleRight, ArrowUpRight, ArrowDownLeft, Trash } from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface PhoneNum {
  id: string;
  number: string;
  country: string;
  type: string;
  monthlyPrice: number;
}

export const CallsSMSView = ({ activeTab }: { activeTab: string }) => {
  const [currentSub, setCurrentSub] = useState('Virtual numbers');
  
  // Real or mock interactive configurations
  const [numbers, setNumbers] = useState<PhoneNum[]>([
    { id: '1', number: '+1 (321) 450-9921', country: 'United States', type: 'Mobile & SMS', monthlyPrice: 4.50 },
    { id: '2', number: '+44 7700 900077', country: 'United Kingdom', type: 'SMS Pack Only', monthlyPrice: 3.20 }
  ]);

  const [smsLogs, setSmsLogs] = useState([
    { id: '1', from: '+1 (321) 450-9921', to: '+1 (800) 555-0199', body: 'Danscom SMS activation verified successfully.', time: 'Today, 10:14 AM', type: 'Outgoing' },
    { id: '2', from: '+1 (206) 441-2192', to: '+1 (321) 450-9921', body: 'Your verification OTP code for Netflix security is 492019.', time: 'Yesterday, 04:22 PM', type: 'Incoming' }
  ]);

  const [callLogs, setCallLogs] = useState([
    { id: '1', number: '+44 7700 900077', duration: '2m 14s', date: 'Today, 11:42 AM', type: 'Incoming' },
    { id: '2', number: '+1 (415) 555-2671', duration: '45s', date: 'Yesterday, 01:10 PM', type: 'Outgoing' }
  ]);

  const [voicemail, setVoicemail] = useState(true);
  const [forwarding, setForwarding] = useState(false);
  const [forwardNumber, setForwardNumber] = useState('');

  // Available numbers to purchase
  const availableNums: PhoneNum[] = [
    { id: 'av-1', number: '+1 (650) 412-9901', country: 'United States (Silicon Valley)', type: 'Voice + SMS', monthlyPrice: 5.00 },
    { id: 'av-2', number: '+44 7911 123456', country: 'United Kingdom (London)', type: 'Voice + SMS', monthlyPrice: 6.00 },
    { id: 'av-3', number: '+254 20 712345', country: 'Kenya (Nairobi)', type: 'SMS Enabled', monthlyPrice: 3.50 },
    { id: 'av-4', number: '+81 90 1234 5678', country: 'Japan (Tokyo)', type: 'Voice + SMS', monthlyPrice: 7.50 }
  ];

  useEffect(() => {
    const subTabs = ['Virtual numbers', 'SMS history', 'Call history', 'Buy phone numbers', 'Voicemail', 'Call forwarding'];
    if (subTabs.includes(activeTab)) {
      setCurrentSub(activeTab);
    }
  }, [activeTab]);

  const buyNumber = (num: PhoneNum) => {
    const confirmBuy = window.confirm(`Confirm purchase of virtual number ${num.number} for $${num.monthlyPrice.toFixed(2)}/month?`);
    if (!confirmBuy) return;

    setNumbers(prev => [...prev, num]);
    alert(`Successfully activated virtual number ${num.number}! Fees will settle monthly against your main wallet.`);
    setCurrentSub('Virtual numbers');
  };

  const deleteNumber = (id: string) => {
    if (!window.confirm("Release this virtual telephone number? All incoming SMS and logs may be permanently detached.")) return;
    setNumbers(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="p-8 text-text-p bg-bg-app min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-border-custom pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Calls & SMS Gateways</h2>
          <p className="text-text-s text-sm mt-1">Manage global virtual telephone numbers, auto forwarding, voicemail, and transaction OTP registers.</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-bg-card p-1 rounded-lg border border-border-custom">
          {['Virtual numbers', 'SMS history', 'Call history', 'Buy phone numbers', 'Voicemail', 'Call forwarding'].map((tab) => (
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
        
        {/* Main interactive viewport */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Virtual Numbers List */}
          {currentSub === 'Virtual numbers' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Active Virtual Gateways</h3>
                <button 
                  onClick={() => setCurrentSub('Buy phone numbers')}
                  className="flex items-center gap-1 text-xs text-accent hover:underline font-bold"
                >
                  <Plus size={14} /> Buy Virtual Number
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numbers.map((n) => (
                  <div key={n.id} className="bg-bg-card border border-border-custom p-6 rounded-xl space-y-4 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg tracking-wide">{n.number}</h4>
                        <p className="text-xs text-text-s mt-1 capitalize">{n.country} • {n.type}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/20 px-2.5 py-1 rounded-full border border-emerald-500/10">Active</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-border-custom/40">
                      <span className="text-xs text-text-s">${n.monthlyPrice.toFixed(2)}/mo settlement</span>
                      <button 
                        onClick={() => deleteNumber(n.id)}
                        className="text-text-s hover:text-red-400 p-1 rounded-md transition"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SMS logs */}
          {currentSub === 'SMS history' && (
            <div className="bg-bg-card border border-border-custom rounded-2xl p-6 space-y-4 animate-fade-in">
              <h3 className="font-bold text-lg">Incoming & Outgoing SMS ledger</h3>
              <p className="text-text-s text-xs">Verify OTP verification logs or read incoming roaming messages safely.</p>
              
              <div className="space-y-3 pt-2">
                {smsLogs.map((s) => (
                  <div key={s.id} className="p-4 bg-black/40 rounded-xl border border-border-custom space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-accent">{s.from} ➔ {s.to}</span>
                      <span className="text-text-s">{s.time}</span>
                    </div>
                    <p className="text-sm text-text-p">{s.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call History */}
          {currentSub === 'Call history' && (
            <div className="bg-bg-card border border-border-custom rounded-2xl p-6 space-y-4 animate-fade-in">
              <h3 className="font-bold text-lg">Virtual Call Logs</h3>
              <div className="divide-y divide-border-custom overflow-hidden">
                {callLogs.map((c) => (
                  <div key={c.id} className="py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded ${c.type === 'Incoming' ? 'bg-emerald-950/20 text-emerald-400' : 'bg-neutral-900 text-text-s'}`}>
                        {c.type === 'Incoming' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{c.number}</p>
                        <p className="text-xs text-text-s mt-0.5">{c.date}</p>
                      </div>
                    </div>
                    <span className="text-xs text-text-s">{c.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buy Phone Numbers viewport */}
          {currentSub === 'Buy phone numbers' && (
            <div className="bg-bg-card border border-border-custom rounded-2xl p-6 space-y-4 animate-fade-in animate-fade-in">
              <h3 className="font-bold text-lg">Select Virtual Carrier Node</h3>
              <p className="text-text-s text-xs">Add a secondary international number securely. Instantly bypass SMS verification roadblocks on ChatGPT, Whatsapp, or Google.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {availableNums.map((num) => (
                  <div key={num.id} className="p-5 bg-black/40 border border-border-custom rounded-xl flex justify-between items-center hover:border-accent/40 transition">
                    <div>
                      <h4 className="font-bold text-sm tracking-wide">{num.number}</h4>
                      <p className="text-[11px] text-text-s mt-1 capitalize">{num.country} • {num.type}</p>
                    </div>
                    <button 
                      onClick={() => buyNumber(num)}
                      className="bg-accent text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      Buy for ${num.monthlyPrice.toFixed(2)}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Toggle Voicemail boxes */}
          {currentSub === 'Voicemail' && (
            <div className="bg-bg-card border border-border-custom rounded-2xl p-8 space-y-6 animate-fade-in">
              <div>
                <h3 className="font-bold text-lg">Voicemail Box Management</h3>
                <p className="text-text-s text-xs mt-1">Configure automated audio transcriptions when lines are busy.</p>
              </div>

              <div className="flex justify-between items-center p-4 bg-neutral-900 rounded-xl border border-border-custom">
                <div>
                  <h4 className="font-semibold text-sm">Automated Voice Mailbox Storage</h4>
                  <p className="text-[11px] text-text-s mt-1">Saves incoming voice calls as MP3 files inside your user logs storage.</p>
                </div>
                <button 
                  onClick={() => setVoicemail(!voicemail)}
                  className="text-accent"
                >
                  {voicemail ? <ToggleRight size={38} /> : <ToggleLeft size={38} className="text-text-s" />}
                </button>
              </div>
            </div>
          )}

          {/* Toggle call forwarding setups */}
          {currentSub === 'Call forwarding' && (
            <div className="bg-bg-card border border-border-custom rounded-2xl p-8 space-y-6 animate-fade-in">
              <div>
                <h3 className="font-bold text-lg">Call Forwarding Overrides</h3>
                <p className="text-text-s text-xs mt-1">Reroute incoming voice packets to standard cellular endpoints instantly.</p>
              </div>

              <div className="flex justify-between items-center p-4 bg-neutral-900 rounded-xl border border-border-custom">
                <div>
                  <h4 className="font-semibold text-sm">Forward Incoming Calls</h4>
                  <p className="text-[11px] text-text-s mt-1">Route calls to another physical eSIM or home carrier line.</p>
                </div>
                <button 
                  onClick={() => setForwarding(!forwarding)}
                  className="text-accent"
                >
                  {forwarding ? <ToggleRight size={38} /> : <ToggleLeft size={38} className="text-text-s" />}
                </button>
              </div>

              {forwarding && (
                <div className="space-y-3 pt-2 animate-fade-in">
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider">Default Target Routing Number</label>
                  <input
                    type="text"
                    className="w-full bg-neutral-900 border border-border-custom rounded-lg py-3 px-4 text-sm focus:outline-none"
                    placeholder="+1 (555) 720-1925"
                    value={forwardNumber}
                    onChange={(e) => setForwardNumber(e.target.value)}
                  />
                  <button 
                    onClick={() => alert(`Call forwarding updated to ${forwardNumber}`)}
                    className="bg-accent text-white py-2 px-4 rounded-lg font-semibold text-xs text-center"
                  >
                    Save Routing Settings
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Global telecom diagnostics panel */}
        <div className="space-y-6">
          <div className="bg-neutral-900/40 p-6 rounded-2xl border border-border-custom space-y-4">
            <h4 className="font-bold text-sm tracking-wide">SMS Routing Protocols</h4>
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle className="text-emerald-400" size={14} />
              <p className="text-text-s leading-relaxed">SMPP version 3.4 Direct connection</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle className="text-emerald-400" size={14} />
              <p className="text-text-s leading-relaxed">End-to-end security key filters</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-neutral-950 to-neutral-900 border border-border-custom p-6 rounded-2xl space-y-3">
            <h4 className="font-bold text-sm">Need Help Setting SMS?</h4>
            <p className="text-[11px] text-text-s leading-relaxed">Should you experience issues verifying credit cards or secure services, check out the Knowledge Base or message real-time Support team.</p>
          </div>
        </div>

      </div>
    </div>
  );
};
