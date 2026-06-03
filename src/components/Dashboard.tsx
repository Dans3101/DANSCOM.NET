export const Dashboard = () => {
    return (
      <div className="p-8 text-text-p">
        <h2 className="text-3xl font-medium mb-6">Welcome, User</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Active eSIMs', value: '3' },
            { title: 'Total Data Used', value: '12.5 GB' },
            { title: 'Next Expiry', value: '2 Days' },
          ].map((stat, i) => (
            <div key={i} className="bg-bg-card p-6 rounded-xl border border-border-custom">
              <h3 className="text-xs text-text-s font-semibold mb-2 uppercase tracking-wide">{stat.title}</h3>
              <p className="text-3xl font-medium text-text-p">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };
