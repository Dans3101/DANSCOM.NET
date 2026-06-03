import { Header } from './dashboard/Header';
import { StatsRow } from './dashboard/StatsRow';
import { BannerActions } from './dashboard/BannerActions';

export const Dashboard = () => {
  return (
    <div className="p-8 font-sans">
      <Header />
      <div className="text-text-p">
        <h2 className="text-3xl font-medium mb-6">Welcome back, User 👋</h2>
        <StatsRow />
        <BannerActions />
        {/* Placeholder for remaining sections */}
        <div className="grid grid-cols-2 gap-6">
            <div className="bg-bg-card p-6 rounded-xl border border-border-custom h-64">My eSIMs</div>
            <div className="bg-bg-card p-6 rounded-xl border border-border-custom h-64">Data Usage</div>
        </div>
      </div>
    </div>
  );
};