import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { Plan } from '../../types';

const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

interface CoverageMapProps {
    plans: Plan[];
}

export const CoverageMap: React.FC<CoverageMapProps> = ({ plans }) => {
    const [hoverInfo, setHoverInfo] = useState<{ name: string; plans: Plan[] } | null>(null);

    return (
        <div className="relative bg-bg-card p-6 rounded-2xl border border-border-custom mb-8 h-96">
            <h3 className="font-semibold text-lg mb-4">Coverage Zones</h3>
            {hoverInfo && (
                <div className="absolute top-16 left-6 z-10 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-border-custom max-w-xs">
                    <h4 className="font-bold text-accent">{hoverInfo.name}</h4>
                    <p className="text-xs text-text-s mb-2">Available Plans:</p>
                    <ul className="text-xs space-y-1">
                        {hoverInfo.plans.map(p => <li key={p.id}>- {p.name} (${p.price})</li>)}
                    </ul>
                </div>
            )}
            <ComposableMap projectionConfig={{ scale: 140 }}>
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => {
                            const countryName = geo.properties.name;
                            const availablePlans = plans.filter(p => p.coverage.includes(countryName));
                            const isCovered = availablePlans.length > 0;
                            
                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    onMouseEnter={() => {
                                        if (isCovered) setHoverInfo({ name: countryName, plans: availablePlans });
                                    }}
                                    onMouseLeave={() => setHoverInfo(null)}
                                    style={{
                                        default: { fill: isCovered ? "#6366f1" : "#e5e7eb", outline: "none", transition: "fill 0.2s" },
                                        hover: { fill: isCovered ? "#4f46e5" : "#d1d5db", outline: "none", cursor: "pointer" },
                                        pressed: { fill: "#4338ca", outline: "none" },
                                    }}
                                />
                            );
                        })
                    }
                </Geographies>
            </ComposableMap>
        </div>
    );
};
