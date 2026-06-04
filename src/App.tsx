/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { MyESIMsView } from './components/views/MyESIMsView';
import { UsageView } from './components/views/UsageView';
import { CallsSMSView } from './components/views/CallsSMSView';
import { PaymentsView } from './components/views/PaymentsView';
import { ProfileView } from './components/views/ProfileView';
import { BusinessView } from './components/views/BusinessView';
import { TeamView } from './components/views/TeamView';
import { ReferralsView } from './components/views/ReferralsView';
import { SupportView } from './components/views/SupportView';
import { SettingsView } from './components/views/SettingsView';
import { useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import bgImage from './assets/dashboard_bg.png';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { user, loading } = useAuth();

  if (loading) return <div className="text-text-p p-8">Loading...</div>;
  if (!user) return <AuthScreen />;

  const renderContent = () => {
    // Top-level tabs & Sub-item switches
    if (activeTab === 'Dashboard') return <Dashboard />;

    const marketplaceTabs = ['Marketplace', 'Available eSIM plans', 'Country plans', 'Regional plans', 'Global plans', 'Featured offers', 'Search and filter', 'Plan comparison'];
    if (marketplaceTabs.includes(activeTab)) return <MarketplaceView activeTab={activeTab} />;

    const myESIMsTabs = ['My eSIMs', 'Active eSIMs', 'Expired eSIMs', 'Installation QR codes', 'ICCID details', 'Data remaining', 'Expiry dates', 'Rename eSIM', 'Delete eSIM'];
    if (myESIMsTabs.includes(activeTab)) return <MyESIMsView activeTab={activeTab} />;

    const usageTabs = ['Usage', 'Daily consumption', 'Weekly report', 'Monthly report', 'Real-time tracking', 'Country-wise usage', 'Usage charts'];
    if (usageTabs.includes(activeTab)) return <UsageView activeTab={activeTab} />;

    const callsSMSTabs = ['Calls & SMS', 'Virtual numbers', 'SMS history', 'Call history', 'Buy phone numbers', 'Voicemail', 'Call forwarding', 'SMS packages'];
    if (callsSMSTabs.includes(activeTab)) return <CallsSMSView activeTab={activeTab} />;

    const paymentsTabs = ['Payments', 'Wallet balance', 'Deposit funds', 'Withdraw funds', 'Payment history', 'Invoices', 'Subscription payments', 'Saved methods'];
    if (paymentsTabs.includes(activeTab)) return <PaymentsView activeTab={activeTab} />;

    const profileTabs = ['Profile', 'Personal info', 'Profile photo', 'Email verification', 'Phone verification', 'Security', 'Password change', 'Language', 'Notifications'];
    if (profileTabs.includes(activeTab)) return <ProfileView activeTab={activeTab} />;

    const businessTabs = ['Business', 'Account management', 'Company profile', 'Bulk eSIM purchases', 'Team management', 'Business invoices', 'API access', 'Expense tracking', 'Corporate plans'];
    if (businessTabs.includes(activeTab)) return <BusinessView activeTab={activeTab} />;

    const teamTabs = ['Team', 'Invite members', 'Assign roles', 'Permissions', 'Activity logs', 'User access', 'Team performance'];
    if (teamTabs.includes(activeTab)) return <TeamView activeTab={activeTab} />;

    const referralsTabs = ['Referrals', 'Referral link', 'Referral code', 'Earnings', 'Commission history', 'Referral statistics', 'Payout requests', 'Marketing materials'];
    if (referralsTabs.includes(activeTab)) return <ReferralsView activeTab={activeTab} />;

    const supportTabs = ['Support', 'Live chat', 'Ticket system', 'Knowledge base', 'FAQs', 'Contact support', 'System status', 'Feature requests'];
    if (supportTabs.includes(activeTab)) return <SupportView activeTab={activeTab} />;

    const settingsTabs = ['Settings', 'General', 'Security', '2FA', 'Theme', 'API', 'Notifications', 'Privacy', 'Device management', 'Connected accounts'];
    if (settingsTabs.includes(activeTab)) return <SettingsView activeTab={activeTab} />;

    return <Dashboard />;
  };

  return (
    <div 
      className="flex min-h-screen bg-bg-app"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  );
}
