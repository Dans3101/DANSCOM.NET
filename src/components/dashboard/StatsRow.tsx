export const StatsRow = ({ stats }: { stats: any }) => (
    <div className="grid grid-cols-4 gap-6 mb-8">
        {[
            { title: 'ACTIVE ESIMS', value: stats.activeEsims },
            { title: 'TOTAL DATA USED', value: `${stats.dataUsed} GB` },
            { title: 'NEXT EXPIRY', value: `${stats.expiryInDays} Days` },
            { title: 'WALLET BALANCE', value: `$${stats.wallet.toFixed(2)}` },
        ].map((stat, i) => (
            <div key={i} className="bg-bg-card p-6 rounded-xl border border-border-custom">
                <h3 className="text-xs text-text-s font-semibold mb-2">{stat.title}</h3>
                <p className="text-3xl font-bold text-text-p">{stat.value}</p>
            </div>
        ))}
    </div>
);
