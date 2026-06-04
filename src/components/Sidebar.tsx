import { LayoutDashboard, ShoppingCart, Smartphone, BarChart2, Phone, CreditCard, User, Briefcase, Users, Gift, HelpCircle, Settings, Sun, Moon, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export const Sidebar = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (itemName: string) => {
    setExpandedItems(prev => ({ ...prev, [itemName]: !prev[itemName] }));
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { 
      name: 'Marketplace', icon: ShoppingCart, subItems: ['Available eSIM plans', 'Country plans', 'Regional plans', 'Global plans', 'Featured offers', 'Search and filter', 'Plan comparison'] 
    },
    { 
      name: 'My eSIMs', icon: Smartphone, subItems: ['Active eSIMs', 'Expired eSIMs', 'Installation QR codes', 'ICCID details', 'Data remaining', 'Expiry dates', 'Rename eSIM', 'Delete eSIM'] 
    },
    { 
      name: 'Usage', icon: BarChart2, subItems: ['Daily consumption', 'Weekly report', 'Monthly report', 'Real-time tracking', 'Country-wise usage', 'Usage charts'] 
    },
    { 
      name: 'Calls & SMS', icon: Phone, subItems: ['Virtual numbers', 'SMS history', 'Call history', 'Buy phone numbers', 'Voicemail', 'Call forwarding', 'SMS packages'] 
    },
    { 
      name: 'Payments', icon: CreditCard, subItems: ['Wallet balance', 'Deposit funds', 'Withdraw funds', 'Payment history', 'Invoices', 'Subscription payments', 'Saved methods'] 
    },
    { 
      name: 'Profile', icon: User, subItems: ['Personal info', 'Profile photo', 'Email verification', 'Phone verification', 'Security', 'Password change', 'Language', 'Notifications'] 
    },
    { 
      name: 'Business', icon: Briefcase, subItems: ['Account management', 'Company profile', 'Bulk eSIM purchases', 'Team management', 'Business invoices', 'API access', 'Expense tracking', 'Corporate plans'] 
    },
    { 
      name: 'Team', icon: Users, subItems: ['Invite members', 'Assign roles', 'Permissions', 'Activity logs', 'User access', 'Team performance'] 
    },
    { 
      name: 'Referrals', icon: Gift, subItems: ['Referral link', 'Referral code', 'Earnings', 'Commission history', 'Referral statistics', 'Payout requests', 'Marketing materials'] 
    },
    { 
      name: 'Support', icon: HelpCircle, subItems: ['Live chat', 'Ticket system', 'Knowledge base', 'FAQs', 'Contact support', 'System status', 'Feature requests'] 
    },
    { 
      name: 'Settings', icon: Settings, subItems: ['General', 'Security', '2FA', 'Theme', 'API', 'Notifications', 'Privacy', 'Device management', 'Connected accounts'] 
    },
  ];

  return (
    <div className="w-64 bg-black text-white min-h-screen p-6 flex flex-col border-r border-border-custom overflow-y-auto">
      <div className="flex items-center gap-2 mb-10">
        <h1 className="text-xl font-bold text-text-p tracking-wide">DANSCOM.NET</h1>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(item => (
          <div key={item.name}>
            <button
              onClick={() => {
                if (item.subItems) toggleExpand(item.name);
                else onTabChange(item.name);
              }}
              className={`flex w-full items-center justify-between gap-3 text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 ${activeTab === item.name ? 'bg-accent/10 text-accent' : 'text-text-s hover:text-text-p'}`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                {item.name}
              </div>
              {item.subItems && (
                expandedItems[item.name] ? <ChevronDown size={16} /> : <ChevronRight size={16} />
              )}
            </button>
            {item.subItems && expandedItems[item.name] && (
              <div className="pl-10 flex flex-col gap-1 mt-1">
                {item.subItems.map(sub => (
                  <button key={sub} onClick={() => onTabChange(sub)} className="text-left text-xs text-text-s hover:text-text-p py-2">
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
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
