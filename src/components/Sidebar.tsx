export const Sidebar = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => {
  return (
    <div className="w-60 bg-black text-white min-h-screen p-6 flex flex-col border-r border-border-custom">
      <h1 className="text-xl font-bold mb-10 text-text-p tracking-wide border-b border-border-custom pb-5">DANSCOM.NET</h1>
      <nav className="flex flex-col gap-1">
        {['Dashboard', 'Marketplace', 'Calls', 'Business'].map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 ${activeTab === tab ? 'bg-accent/10 text-accent' : 'text-text-s hover:text-text-p'}`}
          >
            {tab}
          </button>
        ))}
        <div className="mt-auto pt-6 flex flex-col gap-1 border-t border-border-custom">
          {['Support', 'Settings'].map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className="text-left px-4 py-3 rounded-lg text-sm text-text-s hover:text-text-p"
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};
