export const StatsRow = () => (
    <div className="grid grid-cols-4 gap-6 mb-8">
        {[
            { title: 'ACTIVE ESIMS', value: '3' },
            { title: 'TOTAL DATA USED', value: '12.5 GB' },
            { title: 'NEXT EXPIRY', value: '2 Days' },
            { title: 'WALLET BALANCE', value: '$24.50' },
        ].map((stat, i) => (
            <div key={i} className="bg-bg-card p-6 rounded-xl border border-border-custom">
                <h3 className="text-xs text-text-s font-semibold mb-2">{stat.title}</h3>
                <p className="text-3xl font-bold text-text-p">{stat.value}</p>
            </div>
        ))}
    </div>
);
