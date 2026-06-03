export const BannerActions = () => (
    <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 bg-gradient-to-r from-blue-900 to-black p-8 rounded-xl border border-border-custom flex items-center justify-between">
            <div>
                <h3 className="text-2xl font-bold mb-2">Travel more, worry less</h3>
                <p className="text-sm text-text-s mb-4">Get connected in 200+ countries with DANSCOM.NET eSIMs.</p>
                <button className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-semibold">Explore Plans</button>
            </div>
            <div className="w-32 h-24 bg-blue-500 rounded-lg opacity-50" />
        </div>
        <div className="bg-bg-card p-6 rounded-xl border border-border-custom">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => <div key={i} className="bg-gray-800 p-2 rounded-lg text-center text-xs text-text-s">Action</div>)}
            </div>
        </div>
    </div>
);
