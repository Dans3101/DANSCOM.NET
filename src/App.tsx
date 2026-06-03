/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <div className="flex bg-bg-app min-h-screen">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1">
        {activeTab === 'Dashboard' && <Dashboard />}
        {activeTab !== 'Dashboard' && (
          <div className="p-8 text-text-p">
            <h2 className="text-3xl font-medium">{activeTab}</h2>
            <p className="mt-4 text-text-s">This module is under development.</p>
          </div>
        )}
      </main>
    </div>
  );
}
