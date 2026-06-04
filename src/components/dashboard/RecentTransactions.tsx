import { Transaction } from '../../types';

export const RecentTransactions = ({ transactions }: { transactions: Transaction[] }) => (
    <div className="bg-bg-card p-6 rounded-xl border border-border-custom mt-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <button className="text-sm text-accent">View all</button>
        </div>
        <div className="space-y-4">
            {transactions.map(t => (
                <div key={t.id} className="flex justify-between items-center border-b border-border-custom pb-2">
                    <div>
                        <p className="font-medium text-sm">{t.title}</p>
                        <p className="text-xs text-text-s">{t.date}</p>
                    </div>
                    <p className={`font-bold text-sm ${t.amount > 0 ? 'text-green-500' : 'text-text-p'}`}>{t.amount > 0 ? '+' : ''}{t.amount.toFixed(2)}</p>
                </div>
            ))}
        </div>
    </div>
);
