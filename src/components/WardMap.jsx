import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';

export default function WardMap({ height = '400px' }) {
    const [geoData, setGeoData] = useState(null);
    const [dbCounts, setDbCounts] = useState({});

    useEffect(() => {
        // Fetch GeoJSON boundaries
        fetch('/madurai-wards.geojson')
            .then(res => res.json())
            .then(data => setGeoData(data))
            .catch(err => console.error('Failed to load geojson', err));

        // Fetch Live Database Metrics for coloring
        const fetchWardCounts = async () => {
            try {
                // Fetch all unresolved complaints to count them by ward
                const { data, error } = await supabase
                    .from('complaints')
                    .select('ward_id')
                    .neq('status', 'resolved');

                if (error) throw error;

                if (data) {
                    const counts = {};
                    data.forEach(c => {
                        const wid = c.ward_id;
                        if (wid) {
                            counts[wid] = (counts[wid] || 0) + 1;
                        }
                    });
                    setDbCounts(counts);
                }
            } catch (err) {
                console.error("Error fetching ward metrics for map", err);
            }
        };

        fetchWardCounts();

        // Optional: subscribe to changes
        const subscription = supabase
            .channel('public:wardmap')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, fetchWardCounts)
            .subscribe();

        return () => supabase.removeChannel(subscription);
    }, []);

    const maduraiCenter = [9.9252, 78.1198];

    const onEachWard = (feature, layer) => {
        const wardName = feature.properties.name;
        const wardId = feature.properties.id;

        // Use real count from DB instead of random, handle 0 if not present
        const activeIssues = dbCounts[wardId] || 0;

        // Define color thresholds. 
        // 0 issues = Green, 1-3 = Yellow, >3 = Red/Orange
        let color = '#00d68f'; // Default safe
        if (activeIssues > 3) color = '#ff3333';
        else if (activeIssues > 0) color = '#ffb703';

        layer.setStyle({
            fillColor: color,
            weight: 1,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.4
        });

        layer.bindPopup(`
      <div style="color: #0d1117;">
        <h3 style="margin:0; padding-bottom: 4px; border-bottom: 1px solid #ccc;">${wardName}</h3>
        <p style="margin:8px 0 0 0;"><strong>Active Issues:</strong> ${activeIssues}</p>
      </div>
    `);

        layer.on({
            mouseover: (e) => {
                const target = e.target;
                target.setStyle({ weight: 3, color: '#fff', dashArray: '', fillOpacity: 0.7 });
                target.bringToFront();
            },
            mouseout: (e) => {
                const target = e.target;
                target.setStyle({ weight: 1, color: 'white', dashArray: '3', fillOpacity: 0.4 });
            }
        });
    };

    if (!geoData) {
        return (
            <div style={{ height, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-midnight-light)' }}>
                Loading map data...
            </div>
        );
    }

    return (
        <MapContainer center={maduraiCenter} zoom={13} style={{ height, width: '100%', zIndex: 10 }}>
            {/* Dark theme tile layer for Carto */}
            <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <GeoJSON data={geoData} onEachFeature={onEachWard} />
        </MapContainer>
    );
}
