import { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, Shield, Smartphone, Monitor, CheckCircle, Flame, Server } from 'lucide-react';

export const SettingsView = ({ activeTab }: { activeTab: string }) => {
  const [currentSub, setCurrentSub] = useState('Security settings');
  const [twoFactor, setTwoFactor] = useState(false);
  const [roamingAlert, setRoamingAlert] = useState(true);
  
  const [sessionDevices, setSessionDevices] = useState([
    { id: 'dev-1', name: 'iPhone 15 Pro Max', location: 'Nairobi, Kenya', active: true, type: 'Mobile' },
    { id: 'dev-2', name: 'MacBook Pro 16"', location: 'Nairobi, Kenya', active: false, type: 'Desktop' }
  ]);

  useEffect(() => {
    const subTabs = ['Security settings', 'Two-Factor auth', 'Theme options', 'Connected devices'];
    if (subTabs.includes(activeTab)) {
      setCurrentSub(activeTab);
    }
  }, [activeTab]);

  const toggle2FA = () => {
    if (!twoFactor) {
      const code = prompt('A verification SMS was dispatched to your registered phone number. Enter the 6-digit code to activate 2FA:');
      if (code === null) return;
      if (code.trim().length !== 6) return alert('Invalid code.');
      setTwoFactor(true);
      alert('Two-factor Authentication enabled successfully!');
    } else {
      if (window.confirm('Disable two-factor authorization? This leaves your eSIM balance vulnerable.')) {
        setTwoFactor(false);
      }
    }
  };

  const terminateDevice = (id: string, name: string) => {
    if (!window.confirm(`Terminate login session for ${name}?`)) return;
    setSessionDevices(prev => prev.filter(d => d.id !== id));
    alert(`${name} disconnected.`);
  };

  return (
    <div className="p-8 text-text-p bg-bg-app min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-border-custom pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System & Security Settings</h2>
          <p className="text-text-s text-sm mt-1">Configure global authorization parameters, connected devices, and interface features.</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-bg-card p-1 rounded-lg border border-border-custom">
          {['Security settings', 'Two-Factor auth', 'Connected devices'].map((tab) => (
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
        
        {/* Main Viewport */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Security details & toggling rules */}
          {currentSub === 'Security settings' && (
            <div className="bg-bg-card border border-border-custom p-8 rounded-2xl space-y-6">
              <h3 className="text-xl font-bold">General Security Configurations</h3>
              <p className="text-text-s text-xs">Verify automated account locks for suspicious location switches.</p>
              
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center p-4 bg-neutral-900 rounded-xl border border-border-custom">
                  <div>
                    <h4 className="font-semibold text-sm">Lock on Location Discrepancy</h4>
                    <p className="text-text-s text-[11px] mt-1">Prompt secondary verification if you scan an eSIM in a new country without roaming presets.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={roamingAlert}
                    onChange={() => setRoamingAlert(!roamingAlert)}
                    className="h-4 w-4 rounded capitalize bg-border-custom text-accent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Two factor Authentications setup */}
          {currentSub === 'Two-Factor auth' && (
            <div className="bg-bg-card border border-border-custom p-8 rounded-2xl space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-bold">Two-Factor Authentication (2FA)</h3>
                <p className="text-text-s text-xs mt-1">Confirm your account with both password and unique SMS codes sent to your phone details.</p>
              </div>

              <div className="flex justify-between items-center p-4 bg-neutral-900 rounded-xl border border-border-custom">
                <div>
                  <h4 className="font-semibold text-sm">Require SMS token logins</h4>
                  <p className="text-[11px] text-text-s mt-1">Provides enhanced security against balance depletion.</p>
                </div>
                <button 
                  onClick={toggle2FA}
                  className="text-accent"
                >
                  {twoFactor ? <ToggleRight size={38} /> : <ToggleLeft size={38} className="text-text-s" />}
                </button>
              </div>
            </div>
          )}

          {/* Connected Device listings and de-authorizations */}
          {currentSub === 'Connected devices' && (
            <div className="bg-bg-card border border-border-custom rounded-2xl p-6 space-y-4 animate-fade-in">
              <h3 className="font-bold text-lg">Connected Devices & Terminals</h3>
              <p className="text-text-s text-xs">De-authorize connected logins or active browsers immediately.</p>
              
              <div className="divide-y divide-border-custom pt-2">
                {sessionDevices.map((dev) => (
                  <div key={dev.id} className="py-4 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-neutral-900 border border-border-custom rounded-lg text-accent">
                        {dev.type === 'Mobile' ? <Smartphone size={18} /> : <Monitor size={18} />}
                      </div>
                      <div>
                        <p className="font-semibold text-text-p">{dev.name} {dev.active && <span className="text-[10px] text-emerald-400 font-bold ml-1 bg-emerald-950/20 px-1.5 py-0.5 rounded">This device</span>}</p>
                        <p className="text-xs text-text-s mt-0.5">{dev.location}</p>
                      </div>
                    </div>
                    {!dev.active && (
                      <button 
                        onClick={() => terminateDevice(dev.id, dev.name)}
                        className="text-xs bg-red-950/20 text-red-400 hover:bg-neutral-850 px-3 py-1.5 rounded border border-red-500/10"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Diagnosis widgets */}
        <div className="space-y-6">
          <div className="bg-neutral-900/40 p-6 rounded-2xl border border-border-custom space-y-4">
            <h4 className="font-bold text-sm">Security Standards</h4>
            <div className="flex items-center gap-2 text-xs">
              <Shield className="text-accent" size={14} />
              <p className="text-text-s leading-relaxed">OAuth2 Identity Tokenization verified</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle className="text-emerald-400" size={14} />
              <p className="text-text-s leading-relaxed">PCI-DSS Token exchange secure</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
