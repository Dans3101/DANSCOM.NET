import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plan } from '../../types';
import { Search, Filter } from 'lucide-react';

export const MarketplaceView = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'plans'));
                const plansData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plan));
                setPlans(plansData);
            } catch (error) {
                console.error("Error fetching plans:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const filteredPlans = plans.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));

    if (loading) return <div className="text-text-p p-8">Loading plans...</div>;

    return (
        <div className="p-8 text-text-p">
            <h2 className="text-3xl font-medium mb-6">Marketplace</h2>
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-s" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search plans by name, country, or region..." 
                        className="w-full bg-bg-card border border-border-custom rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 bg-bg-card border border-border-custom px-4 py-2 rounded-lg text-sm">
                    <Filter size={16} /> Filters
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlans.map(plan => (
                    <div key={plan.id} className="bg-bg-card p-6 rounded-xl border border-border-custom hover:border-accent transition">
                        <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                        <p className="text-sm text-text-s mb-4 capitalize">{plan.type} • {plan.speed}</p>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-2xl font-bold">${plan.price}</span>
                            <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">{plan.data}</span>
                        </div>
                        <button className="w-full bg-accent text-white py-2 rounded-lg font-semibold text-sm">Buy Now</button>
                    </div>
                ))}
            </div>
        </div>
    );
};
