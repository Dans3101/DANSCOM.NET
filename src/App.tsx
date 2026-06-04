/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { MyESIMsView } from './components/views/MyESIMsView';
import { BasicView } from './components/views/BasicView';
import { useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import bgImage from './assets/dashboard_bg.png';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { user, loading } = useAuth();

  if (loading) return <div className="text-text-p p-8">Loading...</div>;
  if (!user) return <AuthScreen />;

  const renderContent = () => {
    // Map top level views
    if (activeTab === 'Dashboard') return <Dashboard />;
    if (activeTab === 'Marketplace') return <MarketplaceView />;
    if (activeTab === 'My eSIMs') return <MyESIMsView />;
    
    // Default to a development placeholder for sub-items and other sections
    return <BasicView title={activeTab} />;
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
