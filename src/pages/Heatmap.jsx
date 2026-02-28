import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Flame } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Badge from '../components/ui/Badge';

export default function Heatmap() {
    const [complaints, setComplaints] = useState([]);

    useEffect(() => {
        const fetchHeatmapData = async () => {
            try {
                const { data, error } = await supabase
                    .from('complaints')
                    .select('id, latitude, longitude, priority, type')
                    .neq('status', 'resolved');

                if (error) throw error;

                if (data) {
                    setComplaints(data.map(c => ({
                        id: c.id,
                        lat: c.latitude,
                        lng: c.longitude,
                        severity: c.priority || 'medium',
                        type: c.type
                    })));
                }
            } catch (err) {
                console.error("Error fetching live heatmap data:", err);
            }
        };

        fetchHeatmapData();

        // Setup real-time subscription for live map pop-ins
        const subscription = supabase
            .channel('public:complaints:heatmap')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, fetchHeatmapData)
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const maduraiCenter = [9.9252, 78.1198];

    const getColor = (severity) => {
        if (severity === 'critical') return '#F43F5E'; // rose
        if (severity === 'high') return '#FFB703'; // saffron
        return '#0DF39A'; // emerald
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col h-[calc(100vh-80px)]">
            <div className="mb-8">
                <h1 className="font-display font-bold text-4xl mb-2 flex items-center gap-3">
                    <Flame color="var(--c-saffron)" size={36} /> Live Complaint Heatmap
                </h1>
                <p className="text-[var(--c-gray-400)]"> Visualizing active solid waste management issues across all 100 wards of Madurai in real-time.</p>
            </div>

            <div className="flex-1 glass-panel rounded-xl overflow-hidden min-h-[500px] border border-[var(--glass-border)] shadow-2xl animate-in fade-in slide-in-from-bottom-8">
                <MapContainer center={maduraiCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; CARTO'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    {complaints.map((c) => {
                        if (!c.lat || !c.lng) return null; // Avoid rendering markers without valid coods
                        return (
                            <CircleMarker
                                key={c.id}
                                center={[c.lat, c.lng]}
                                radius={c.severity === 'critical' ? 8 : 5}
                                pathOptions={{
                                    color: getColor(c.severity),
                                    fillColor: getColor(c.severity),
                                    fillOpacity: c.severity === 'critical' ? 0.8 : 0.4,
                                    weight: c.severity === 'critical' ? 2 : 0
                                }}
                            >
                                <Popup className="custom-popup">
                                    <div className="p-1">
                                        <div className="mb-2"><Badge type="priority" value={c.severity}>{c.severity}</Badge></div>
                                        <p className="capitalize text-sm text-[var(--c-midnight)] font-medium m-0">{c.type?.replace('_', ' ')}</p>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
}
