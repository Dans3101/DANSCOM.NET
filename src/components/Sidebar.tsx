import { LayoutDashboard, ShoppingCart, Smartphone, BarChart2, Phone, CreditCard, User, Briefcase, Users, Gift, HelpCircle, Settings, Sun, Moon } from 'lucide-react';

export const Sidebar = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Marketplace', icon: ShoppingCart },
    { name: 'My eSIMs', icon: Smartphone },
    { name: 'Usage', icon: BarChart2 },
    { name: 'Calls & SMS', icon: Phone },
    { name: 'Payments', icon: CreditCard },
    { name: 'Profile', icon: User },
    { name: 'Business', icon: Briefcase },
    { name: 'Team', icon: Users },
    { name: 'Referrals', icon: Gift },
  ];

  return (
    <div className="w-64 bg-black text-white min-h-screen p-6 flex flex-col border-r border-border-custom">
      <div className="flex items-center gap-2 mb-10">
        <h1 className="text-xl font-bold text-text-p tracking-wide">DANSCOM.NET</h1>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(item => (
          <button
            key={item.name}
            onClick={() => onTabChange(item.name)}
            className={`flex items-center gap-3 text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 ${activeTab === item.name ? 'bg-accent/10 text-accent' : 'text-text-s hover:text-text-p'}`}
          >
            <item.icon size={18} />
            {item.name}
          </button>
        ))}
        <div className="mt-8 border-t border-border-custom pt-8 flex flex-col gap-1">
          {['Support', 'Settings'].map(tab => {
            const Icon = tab === 'Support' ? HelpCircle : Settings;
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`flex items-center gap-3 text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 ${activeTab === tab ? 'bg-accent/10 text-accent' : 'text-text-s hover:text-text-p'}`}
              >
                <Icon size={18} />
                {tab}
              </button>
            )
          })}
        </div>
      </nav>

      <div className="mt-8 bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl p-4 text-center">
        <Gift className="mx-auto mb-2 text-white" size={24} />
        <h4 className="text-white font-medium text-sm">Refer & Earn</h4>
        <p className="text-blue-200 text-xs mb-3">Invite friends and earn up to $10 for each referral.</p>
        <button className="bg-white text-blue-900 text-xs font-bold py-2 px-4 rounded-lg w-full">Invite Now</button>
      </div>
      
      <div className="mt-6 flex justify-center items-center gap-4 bg-gray-900 p-2 rounded-lg text-sm text-text-s">
        <button className="flex items-center gap-2"><Sun size={16} /> Light</button>
        <button className="flex items-center gap-2 bg-gray-800 text-white p-1 rounded-md"><Moon size={16} /> Dark</button>
      </div>
    </div>
  );
};
