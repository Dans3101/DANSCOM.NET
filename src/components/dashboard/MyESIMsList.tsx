import { eSIM } from '../../types';

export const MyESIMsList = ({ esims }: { esims: eSIM[] }) => (
    <div className="bg-bg-card p-6 rounded-xl border border-border-custom">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">My eSIMs</h3>
            <button className="text-sm text-accent">View all</button>
        </div>
        <div className="space-y-4">
            {esims.map(e => (
                <div key={e.id} className="flex justify-between items-center bg-gray-900 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center font-bold">{e.country[0]}</div>
                        <div>
                            <p className="font-medium">{e.country}</p>
                            <p className="text-xs text-text-s">{e.total}GB • {e.validity}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">Active</span>
                        <p className="text-xs mt-1 text-text-s">Expires in {e.expiry}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
