import { useState, useEffect } from 'react';
import { eSIM } from '../../types';

export const MyESIMsView = () => {
    // In a real app, fetch from Firestore
    const [esims] = useState<eSIM[]>([
        { id: '1', country: 'France', data: '7.2GB', validity: '30 Days', status: 'Active', usage: 7.2, total: 10, expiry: '2025-06-05' },
        { id: '2', country: 'United States', data: '2.1GB', validity: '15 Days', status: 'Active', usage: 2.1, total: 5, expiry: '2025-06-09' },
    ]);

    return (
        <div className="p-8 text-text-p">
            <h2 className="text-3xl font-medium mb-6">My eSIMs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {esims.map(e => (
                    <div key={e.id} className="bg-bg-card p-6 rounded-xl border border-border-custom">
                        <h3 className="font-semibold text-xl mb-2">{e.country}</h3>
                        <p className="text-sm text-text-s mb-4">Expires: {e.expiry}</p>
                        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden mb-4">
                            <div className="bg-accent h-full" style={{ width: `${(e.usage / e.total) * 100}%` }} />
                        </div>
                        <p className="text-sm">{e.usage}GB / {e.total}GB used</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
