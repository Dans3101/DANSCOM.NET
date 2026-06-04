import { useState, useEffect } from 'react';
import { Header } from './dashboard/Header';
import { StatsRow } from './dashboard/StatsRow';
import { BannerActions } from './dashboard/BannerActions';
import { MyESIMsList } from './dashboard/MyESIMsList';
import { DataUsageMonitor } from './dashboard/DataUsageMonitor';
import { RecentTransactions } from './dashboard/RecentTransactions';

export const Dashboard = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div className="p-8 text-text-p">Loading...</div>;

  return (
    <div className="p-8 font-sans">
      <Header />
      <div className="text-text-p">
        <h2 className="text-3xl font-medium mb-6">Welcome back, User 👋</h2>
        <StatsRow stats={data.stats} />
        <BannerActions quickActions={data.quickActions} />
        
        <div className="grid grid-cols-2 gap-6">
            <MyESIMsList esims={data.esims} />
            <DataUsageMonitor esimId={data.esims[0].id} />
        </div>
        <RecentTransactions transactions={data.recentTransactions} />
      </div>
    </div>
  );
};
