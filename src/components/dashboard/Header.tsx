import { Search, Bell, User } from 'lucide-react';

export const Header = () => (
    <header className="flex justify-between items-center mb-8">
        <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-s" size={18} />
            <input type="text" placeholder="Search for countries, plans..." className="w-full bg-bg-card border border-border-custom rounded-lg py-2 pl-10 pr-4 text-sm text-text-p focus:outline-none focus:border-accent" />
        </div>
        <div className="flex items-center gap-4">
            <Bell className="text-text-s" size={20} />
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-700" />
                <span className="text-sm">User <span className="text-text-s">Premium</span></span>
            </div>
        </div>
    </header>
);
