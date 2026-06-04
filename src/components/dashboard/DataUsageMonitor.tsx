import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { OperationType, handleFirestoreError } from '../../lib/firebaseError'; // Will need to be created if not exists

export const DataUsageMonitor = ({ esimId }: { esimId: string }) => {
    const [usage, setUsage] = useState<{ consumed: number, total: number } | null>(null);

    useEffect(() => {
        if (!auth.currentUser) return;
        
        const path = `/users/${auth.currentUser.uid}/esimUsage/${esimId}`;
        const docRef = doc(db, 'users', auth.currentUser.uid, 'esimUsage', esimId);
        
        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setUsage({ consumed: data.consumedDataGB, total: data.totalDataGB });
            }
        }, (error) => {
            handleFirestoreError(error, OperationType.GET, path);
        });

        return unsubscribe;
    }, [esimId]);

    if (!usage) return null;

    const percentage = Math.round((usage.consumed / usage.total) * 100);

    return (
        <div className="bg-bg-card p-6 rounded-xl border border-border-custom">
            <h3 className="text-lg font-semibold mb-2">Data Usage Monitor</h3>
            <div className="flex justify-between items-center mb-2 text-sm text-text-s">
                <span>Consumed: {usage.consumed} GB</span>
                <span>{usage.total - usage.consumed} GB Remaining</span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div 
                    className="bg-accent h-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="text-right text-xs mt-1 text-text-s">{percentage}% used</p>
        </div>
    );
};
