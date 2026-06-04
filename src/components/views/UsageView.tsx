import { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area, BarChart, Bar } from 'recharts';
import { ArrowUpRight, Smartphone, RefreshCw, BarChart2, Globe, Clock, Download } from 'lucide-react';

interface UsageDataPoint {
  dateOrTime: string;
  consumedGB: number;
}

export const UsageView = ({ activeTab }: { activeTab: string }) => {
  const [currentSub, setCurrentSub] = useState('Daily consumption');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const subTabs = ['Daily consumption', 'Weekly report', 'Monthly report', 'Real-time tracking', 'Country-wise usage', 'Usage charts'];
    if (subTabs.includes(activeTab)) {
      setCurrentSub(activeTab);
    }
  }, [activeTab]);

  const dailySample: UsageDataPoint[] = [
    { dateOrTime: '08:00 AM', consumedGB: 0.12 },
    { dateOrTime: '10:00 AM', consumedGB: 0.45 },
    { dateOrTime: '12:00 PM', consumedGB: 1.25 },
    { dateOrTime: '02:00 PM', consumedGB: 0.88 },
    { dateOrTime: '04:00 PM', consumedGB: 1.55 },
    { dateOrTime: '06:00 PM', consumedGB: 0.40 },
    { dateOrTime: '08:00 PM', consumedGB: 1.05 },
    { dateOrTime: '10:00 PM', consumedGB: 2.15 },
  ];

  const weeklySample: UsageDataPoint[] = [
    { dateOrTime: 'Mon', consumedGB: 1.8 },
    { dateOrTime: 'Tue', consumedGB: 2.4 },
    { dateOrTime: 'Wed', consumedGB: 3.1 },
    { dateOrTime: 'Thu', consumedGB: 1.5 },
    { dateOrTime: 'Fri', consumedGB: 4.8 },
    { dateOrTime: 'Sat', consumedGB: 5.2 },
    { dateOrTime: 'Sun', consumedGB: 2.9 },
  ];

  const monthlySample: UsageDataPoint[] = [
    { dateOrTime: 'Week 1', consumedGB: 12.5 },
    { dateOrTime: 'Week 2', consumedGB: 18.2 },
    { dateOrTime: 'Week 3', consumedGB: 15.1 },
    { dateOrTime: 'Week 4', consumedGB: 22.8 },
  ];

  const countryUsage = [
    { country: 'France', usage: '12.4 GB', plans: 'Europe Regional, France Local' },
    { country: 'United States', usage: '5.2 GB', plans: 'USA Traveler Pass' },
    { country: 'Kenya', usage: '2.8 GB', plans: 'Kenya Weekly Pass' },
    { country: 'Japan', usage: '1.5 GB', plans: 'Asia Pacific Regional' }
  ];

  const getChartData = () => {
    if (currentSub === 'Weekly report') return weeklySample;
    if (currentSub === 'Monthly report') return monthlySample;
    return dailySample;
  };

  const handleDownloadReport = () => {
    alert('Generating connectivity usage ledger... Download started in PDF & CSV format.');
  };

  return (
    <div className="p-8 text-text-p bg-bg-app min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-border-custom pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Usage & Analytics</h2>
          <p className="text-text-s text-sm mt-1">Monitor real-time roaming consumption across active cellular plans.</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-bg-card p-1 rounded-lg border border-border-custom">
          {['Daily consumption', 'Weekly report', 'Monthly report', 'Real-time tracking', 'Country-wise usage'].map((tab) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-bg-card border border-border-custom p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-accent/10 text-accent rounded-lg">
            <Smartphone size={24} />
          </div>
          <div>
            <p className="text-xs text-text-s uppercase font-semibold">Today's Consumption</p>
            <p className="text-2xl font-bold mt-1">2.42 GB</p>
            <p className="text-[10px] text-emerald-400 mt-1">Within normal limits</p>
          </div>
        </div>

        <div className="bg-bg-card border border-border-custom p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
            <Globe size={24} />
          </div>
          <div>
            <p className="text-xs text-text-s uppercase font-semibold">Active Roaming Nodes</p>
            <p className="text-2xl font-bold mt-1">2 Countries</p>
            <p className="text-[10px] text-text-s mt-1">France, United States</p>
          </div>
        </div>

        <div className="bg-bg-card border border-border-custom p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs text-text-s uppercase font-semibold">Latency Average</p>
            <p className="text-2xl font-bold mt-1">42 ms</p>
            <p className="text-[10px] text-teal-400 mt-1">Excellent connection</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Consumption Graphs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-bg-card border border-border-custom p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-lg">{currentSub} Overview</h3>
                <p className="text-text-s text-xs mt-1">Detailed metric analysis of cellular packet transactions.</p>
              </div>
              <button 
                onClick={handleDownloadReport}
                className="flex items-center gap-2 bg-neutral-900 border border-border-custom hover:bg-neutral-800 px-3.5 py-2 rounded-lg text-xs font-semibold"
              >
                <Download size={14} /> Report
              </button>
            </div>

            <div className="h-72 w-full pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getChartData()}>
                  <defs>
                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="dateOrTime" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} unit=" GB" />
                  <Tooltip contentStyle={{ backgroundColor: '#121212', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="consumedGB" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsage)" name="Data Used (GB)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {currentSub === 'Country-wise usage' && (
            <div className="bg-bg-card border border-border-custom rounded-2xl p-6 space-y-4 animate-fade-in">
              <h3 className="font-bold text-lg">Cross-Border Country Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {countryUsage.map((c, i) => (
                  <div key={i} className="p-4 bg-neutral-900 rounded-xl border border-border-custom flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm text-text-p">{c.country}</p>
                      <p className="text-[10px] text-text-s mt-1">{c.plans}</p>
                    </div>
                    <span className="text-accent font-bold text-sm">{c.usage}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Real-time Tracking & Cellular Info */}
        <div className="space-y-6">
          <div className="bg-bg-card border border-border-custom p-6 rounded-2xl space-y-4">
            <h4 className="font-semibold text-base mb-2">Simulated Diagnostic Carrier</h4>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-text-s">Network Carrier:</span>
                  <span className="font-semibold text-text-p text-right">Orange F / T-Mobile USA</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-border-custom/50">
                  <span className="text-text-s">ICCID:</span>
                  <span className="font-mono text-text-p text-right">8904903200000123456F</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-border-custom/50">
                  <span className="text-text-s">Current IP:</span>
                  <span className="font-mono text-text-p text-right">104.244.64.12</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-border-custom/50">
                  <span className="text-text-s">Signal Mode:</span>
                  <span className="font-bold text-emerald-400 text-right">5G NSA Broadcast</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-neutral-950 to-neutral-900 border border-border-custom p-6 rounded-2xl">
            <h4 className="font-bold text-sm mb-2">Diagnostic Tools</h4>
            <p className="text-[11px] text-text-s leading-relaxed mb-4">Run cellular speedtests or fetch live ping diagnostics from Orange / Deutsche Telekom edge servers directly.</p>
            <button 
              onClick={() => alert('Initiating packet payload test to global edge nodes... Latency 42ms verified.')}
              className="w-full bg-neutral-950 font-semibold border border-border-custom hover:bg-neutral-800 text-text-p py-2.5 rounded-lg text-xs"
            >
              Run Connection Diagnostic
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
