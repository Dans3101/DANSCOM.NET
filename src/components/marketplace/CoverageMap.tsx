import React, { useState } from 'react';
import { Plan } from '../../types';
import { Globe, MapPin, Info, Sparkles } from 'lucide-react';

interface CoverageMapProps {
    plans: Plan[];
}

interface RegionNode {
    id: string;
    name: string;
    cx: number;
    cy: number;
    countries: string[];
}

export const CoverageMap: React.FC<CoverageMapProps> = ({ plans }) => {
    const [hoverInfo, setHoverInfo] = useState<{ name: string; plans: Plan[] } | null>(null);
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

    // Coordinate mapping for major global coverage zones
    const regions: RegionNode[] = [
        { id: 'na', name: 'North America', cx: 200, cy: 120, countries: ['United States', 'USA', 'Canada'] },
        { id: 'sa', name: 'South America', cx: 300, cy: 260, countries: ['Brazil', 'Argentina', 'Chile'] },
        { id: 'eu', name: 'Europe', cx: 480, cy: 100, countries: ['France', 'Germany', 'United Kingdom', 'UK', 'Spain', 'Italy', 'Turkey'] },
        { id: 'as', name: 'Asia', cx: 680, cy: 140, countries: ['Japan', 'China', 'India', 'Singapore', 'Thailand', 'Vietnam'] },
        { id: 'af', name: 'Africa', cx: 500, cy: 230, countries: ['Egypt', 'South Africa', 'Kenya', 'Morocco'] },
        { id: 'oc', name: 'Oceania', cx: 780, cy: 280, countries: ['Australia', 'New Zealand'] }
    ];

    // Helper to check coverages and count available plans
    const getRegionPlans = (countries: string[]) => {
        return plans.filter(p => 
            p.coverage.some(c => 
                countries.some(rc => rc.toLowerCase() === c.toLowerCase())
            ) || p.type === 'global'
        );
    };

    return (
        <div className="bg-bg-card/40 backdrop-blur-md p-6 rounded-2xl border border-border-custom mb-8 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-accent/5 rounded-full filter blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-text-p flex items-center gap-2">
                        <Globe className="text-accent animate-pulse" size={20} />
                        Global eSIM Coverage Hub
                    </h3>
                    <p className="text-xs text-text-s mt-1">
                        Interact with active network nodes to explore regional and localized cellular coverage zones.
                    </p>
                </div>
                
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
                        <span className="w-2.5 h-2.5 rounded-full bg-accent absolute" />
                        <span className="text-text-s font-medium">Active Zone</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                        <span className="text-text-s font-medium">Standard Hub</span>
                    </div>
                </div>
            </div>

            {/* Interactive Coverage Canvas */}
            <div className="relative w-full overflow-x-auto select-none">
                <div className="min-w-[800px] h-[360px] relative">
                    
                    {/* SVG Map Projection Backdrop */}
                    <svg className="w-full h-full absolute inset-0" viewBox="0 0 900 360" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Interactive Dot Grid Backdrop representing the Earth */}
                        <defs>
                            <pattern id="dot-grid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                                <circle cx="3" cy="3" r="1.5" fill="rgba(148, 163, 184, 0.07)" />
                            </pattern>
                        </defs>
                        <rect width="900" height="360" fill="url(#dot-grid)" rx="16" />

                        {/* Stylized high-tech connecting lines between communication hubs */}
                        <path d="M 200 120 Q 340 100 480 100" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="1.5" strokeDasharray="4 4" />
                        <path d="M 480 100 Q 580 120 680 140" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="1.5" strokeDasharray="4 4" />
                        <path d="M 200 120 Q 250 190 300 260" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="1.5" strokeDasharray="4 4" />
                        <path d="M 300 260 Q 400 245 500 230" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="1.5" strokeDasharray="4 4" />
                        <path d="M 500 230 Q 640 255 780 280" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="1.5" strokeDasharray="4 4" />
                        <path d="M 680 140 Q 730 210 780 280" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="1.5" strokeDasharray="4 4" />

                        {/* High-fidelity abstract continent shapes supporting instant vector scaling */}
                        {/* North America */}
                        <path d="M 120 80 Q 220 50 280 90 T 260 170 T 170 160 Z" fill="rgba(99, 102, 241, 0.03)" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1" />
                        {/* South America */}
                        <path d="M 260 210 Q 320 220 310 290 T 270 330 T 250 240 Z" fill="rgba(99, 102, 241, 0.03)" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1" />
                        {/* Europe & Africa */}
                        <path d="M 420 80 Q 480 50 530 110 T 470 170 T 410 120 Z" fill="rgba(99, 102, 241, 0.03)" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1" />
                        <path d="M 440 180 Q 540 190 520 280 T 460 260 T 430 200 Z" fill="rgba(99, 102, 241, 0.03)" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1" />
                        {/* Asia */}
                        <path d="M 580 90 Q 750 60 800 150 T 700 220 T 580 140 Z" fill="rgba(99, 102, 241, 0.03)" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1" />
                        {/* Australia */}
                        <path d="M 720 250 Q 820 260 800 310 T 730 300 Z" fill="rgba(99, 102, 241, 0.03)" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1" />

                        {/* Render active region node circles */}
                        {regions.map((region) => {
                            const regionPlans = getRegionPlans(region.countries);
                            const hasPlans = regionPlans.length > 0;
                            const isSelected = selectedRegion === region.id;

                            return (
                                <g 
                                    key={region.id}
                                    className="cursor-pointer group"
                                    onMouseEnter={() => setHoverInfo({ name: region.name, plans: regionPlans })}
                                    onMouseLeave={() => setHoverInfo(null)}
                                    onClick={() => setSelectedRegion(isSelected ? null : region.id)}
                                >
                                    {/* Pulse effect for areas with coverage plans */}
                                    {hasPlans && (
                                        <circle 
                                            cx={region.cx} 
                                            cy={region.cy} 
                                            r="16" 
                                            fill="rgba(99, 102, 241, 0.25)" 
                                            className="animate-ping"
                                            style={{ transformOrigin: `${region.cx}px ${region.cy}px` }}
                                        />
                                    )}

                                    {/* Outer Hover Ring */}
                                    <circle 
                                        cx={region.cx} 
                                        cy={region.cy} 
                                        r="12" 
                                        fill="transparent" 
                                        stroke={hasPlans ? "rgba(99, 102, 241, 0.4)" : "rgba(148, 163, 184, 0.2)"}
                                        strokeWidth="2" 
                                        className="transition-all duration-300 group-hover:r-[14px]"
                                    />

                                    {/* Core Hub Selector Pin */}
                                    <circle 
                                        cx={region.cx} 
                                        cy={region.cy} 
                                        r="6" 
                                        fill={hasPlans ? "#6366f1" : "#475569"} 
                                        className={`transition-all duration-300 group-hover:scale-125 ${isSelected ? 'fill-emerald-400 font-bold' : ''}`}
                                        style={{ transformOrigin: `${region.cx}px ${region.cy}px` }}
                                    />

                                    {/* Text Placement label above or beside */}
                                    <text 
                                        x={region.cx} 
                                        y={region.cy - 18} 
                                        textAnchor="middle" 
                                        className="text-[10px] font-mono fill-text-p uppercase tracking-wider select-none font-semibold transition-all group-hover:fill-accent pointer-events-none"
                                    >
                                        {region.name} ({regionPlans.length})
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    {/* Popover overlay inside the map when hovering mapping zones */}
                    {hoverInfo && (
                        <div className="absolute top-4 left-4 z-20 bg-bg-card/95 backdrop-blur-md p-4 rounded-xl border border-border-custom max-w-[280px] shadow-2xl transition-all duration-200">
                            <div className="flex items-center gap-1.5 text-accent font-semibold text-xs mb-1">
                                <MapPin size={13} className="text-accent animate-pulse" />
                                <span>{hoverInfo.name}</span>
                            </div>
                            
                            <p className="text-[10px] text-text-s mb-3 flex items-center gap-1">
                                <Info size={11} /> 
                                Includes regional & worldwide packages
                            </p>

                            {hoverInfo.plans.length === 0 ? (
                                <p className="text-[11px] text-text-s italic">No localized plans currently listed</p>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    <div className="text-[10px] uppercase font-bold text-text-s tracking-wider border-b border-border-custom pb-1 mb-1">Available eSims:</div>
                                    {hoverInfo.plans.map(p => (
                                        <div key={p.id} className="flex justify-between items-center text-xs hover:bg-white/5 p-1 rounded transition">
                                            <span className="text-text-p font-medium truncate max-w-[120px]">{p.name}</span>
                                            <span className="text-accent font-bold">${p.price} <span className="text-[9px] text-text-s font-normal">({p.data})</span></span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Expanded Region selection panel for dynamic plan breakdown */}
            {selectedRegion && (
                <div className="mt-4 p-4 rounded-xl bg-accent/5 border border-accent/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fadeIn">
                    <div>
                        <h4 className="text-sm font-semibold text-text-p flex items-center gap-1.5">
                            <Sparkles size={14} className="text-accent" />
                            Active Filter: {regions.find(r => r.id === selectedRegion)?.name} Coverage Zone
                        </h4>
                        <p className="text-xs text-text-s mt-0.5">
                            Filtered from the active database snapshot. Select any node on the map to switch regions.
                        </p>
                    </div>
                    <button 
                        onClick={() => setSelectedRegion(null)}
                        className="text-xs bg-bg-card border border-border-custom hover:border-accent hover:text-accent px-3 py-1.5 rounded-lg transition font-medium"
                    >
                        Clear Filter
                    </button>
                </div>
            )}
        </div>
    );
};
