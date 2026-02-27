import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Flame } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Heatmap() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        const { data, error } = await supabase
          .from('complaints')
          .select('id, lat, lng, priority')
          .neq('status', 'resolved');

        if (error) throw error;

        if (data) {
          setComplaints(data.map(c => ({
            id: c.id,
            lat: c.lat,
            lng: c.lng,
            severity: c.priority || 'medium'
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
    if (severity === 'critical') return '#ff3333';
    if (severity === 'high') return '#ffb703';
    return '#00d68f';
  };

  return (
    <div className="container" style={{ paddingTop: '100px', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ marginBottom: 'var(--space-sm)' }}>
        <h1 className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Flame color="var(--c-saffron)" /> Live Complaint Heatmap
        </h1>
        <p className="animate-fade-in-up delay-100" style={{ color: 'var(--c-gray-400)' }}>
          Visualizing active solid waste management issues across all 100 wards.
        </p>
      </div>

      <div className="animate-fade-in-up delay-200" style={{ flex: 1, border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', minHeight: '500px', marginBottom: 'var(--space-lg)' }}>
        <MapContainer center={maduraiCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {complaints.map(c => (
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
              <Popup>
                <div style={{ color: '#000' }}>
                  <strong>Severity: {c.severity.toUpperCase()}</strong>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
