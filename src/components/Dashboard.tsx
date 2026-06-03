import { useState, useEffect } from 'react';
import { Header } from './dashboard/Header';
import { StatsRow } from './dashboard/StatsRow';
import { BannerActions } from './dashboard/BannerActions';

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
        <BannerActions />
        <div className="grid grid-cols-2 gap-6">
            <div className="bg-bg-card p-6 rounded-xl border border-border-custom h-64 text-sm text-text-s">My eSIMs (List component todo)</div>
            <div className="bg-bg-card p-6 rounded-xl border border-border-custom h-64 text-sm text-text-s">Data Usage Chart (Recharts todo)</div>
        </div>
      </div>
    </div>
  );
};
