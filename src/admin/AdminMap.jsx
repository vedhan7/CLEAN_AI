import React from 'react';
import { Flame } from 'lucide-react';
import WardMap from '../components/WardMap';

const AdminMap = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-display font-bold flex items-center gap-3">
                    <Flame className="text-[var(--c-saffron)]" size={24} /> Live Ward Map
                </h1>
                <p className="text-[var(--c-gray-400)] mt-1">
                    Real-time complaint density across all 100 wards. Green = safe, Yellow = active issues, Red = hotspot.
                </p>
            </div>

            <div className="rounded-xl overflow-hidden border border-[var(--glass-border)] shadow-2xl relative" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
                <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_60px_rgba(10,15,20,0.6)]"></div>
                <WardMap height="100%" />
            </div>
        </div>
    );
};

export default AdminMap;
