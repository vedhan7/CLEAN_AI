import React, { useEffect, useState } from 'react';
import { BarChart3, AlertCircle, FileText, CheckCircle2, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useFleetPresence } from '../hooks/useFleetPresence';
import { supabase } from '../lib/supabase';

// Fix for default Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for LCV trucks
const truckIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function CouncillorDash() {
  const { activeWorkers, status: presenceStatus } = useFleetPresence('madurai_lcv_fleet');
  const [workerMarkers, setWorkerMarkers] = useState([]);

  // New States for Live DB Querying
  const [liveComplaints, setLiveComplaints] = useState([]);
  const [kpiPending, setKpiPending] = useState(0);
  const [kpiResolved, setKpiResolved] = useState(0);

  // Administrative metadata
  const adminProfile = {
    ward: 41,
    wardName: "Ward 41",
    councillor: "Karthik R."
  };

  useEffect(() => {
    // Transform Supabase Presence dictionary into array of markers
    const markers = [];
    Object.keys(activeWorkers).forEach(presenceId => {
      const presences = activeWorkers[presenceId];
      if (presences && presences.length > 0) {
        const p = presences[0]; // Take latest state for this user
        if (p.location && p.location.lat && p.location.lng) {
          markers.push({
            id: presenceId,
            lat: p.location.lat,
            lng: p.location.lng,
            status: p.status
          });
        }
      }
    });

    // If no real data from Supabase yet, populate mock fleet markers for UI demonstration
    if (markers.length === 0) {
       /* eslint-disable-next-line */
      setWorkerMarkers([
        { id: 'mock1', lat: 9.9252, lng: 78.1198, name: 'TN-59-AB-1234', status: 'on_duty' },
        { id: 'mock2', lat: 9.9352, lng: 78.1250, name: 'TN-59-CD-9876', status: 'on_duty' }
      ]);
    } else {
       /* eslint-disable-next-line */
      setWorkerMarkers(markers);
    }
  }, [activeWorkers]);

  useEffect(() => {
    // Live Supabase Query for this specific ward's metrics
    const fetchWardMetrics = async () => {
      try {
        const { data, error } = await supabase
          .from('complaints')
          .select('*')
          .eq('ward_id', adminProfile.ward)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!error && data) {
          setLiveComplaints(data);
          setKpiPending(data.filter(c => c.status !== 'resolved').length);
          setKpiResolved(data.filter(c => c.status === 'resolved').length);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchWardMetrics();
  }, [adminProfile.ward]);

  const maduraiCenter = [9.9252, 78.1198];

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
        <div className="animate-fade-in-up" style={{ flex: 1 }}>
          <p style={{ color: 'var(--c-gray-400)', margin: 0 }}>Command Center</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ color: 'var(--c-emerald)', margin: 0 }}>{adminProfile.wardName}</h1>
            <button title="Log Out" onClick={() => supabase.auth.signOut()} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--c-gray-400)', padding: '6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
        <div className="animate-fade-in-up delay-100" style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{adminProfile.councillor}</p>
          <span style={{ fontSize: '0.85rem', color: 'var(--c-gray-400)', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}>Verified</span>
        </div>
      </div>

      <div className="animate-fade-in-up delay-200" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: 'var(--space-lg)' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ color: '#ffb703', marginBottom: '8px' }}><AlertCircle size={32} /></div>
          <h2>{kpiPending}</h2>
          <p style={{ color: 'var(--c-gray-400)', fontSize: '0.9rem' }}>Pending Issues</p>
        </div>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ color: 'var(--c-emerald)', marginBottom: '8px' }}><CheckCircle2 size={32} /></div>
          <h2>{kpiResolved}</h2>
          <p style={{ color: 'var(--c-gray-400)', fontSize: '0.9rem' }}>Resolved (24h)</p>
        </div>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ color: 'var(--c-white)', marginBottom: '8px' }}><BarChart3 size={32} /></div>
          <h2>#12</h2>
          <p style={{ color: 'var(--c-gray-400)', fontSize: '0.9rem' }}>City Rank</p>
        </div>
      </div>

      <div className="animate-fade-in-up delay-300" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-md)' }}>

        {/* Real-time Fleet Tracker Map */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Live Fleet Tracking</h3>
            <span style={{ fontSize: '0.85rem', color: presenceStatus === 'SUBSCRIBED' ? 'var(--c-emerald)' : 'var(--c-saffron)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: presenceStatus === 'SUBSCRIBED' ? 'var(--c-emerald)' : 'var(--c-saffron)' }}></span>
              Presence: {presenceStatus}
            </span>
          </div>
          <div style={{ flex: 1, minHeight: '300px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
            <MapContainer center={maduraiCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              {workerMarkers.map((marker, i) => (
                <Marker key={marker.id || i} position={[marker.lat, marker.lng]} icon={truckIcon}>
                  <Popup>
                    <div style={{ color: '#000' }}>
                      <strong>{marker.name || 'Worker ' + marker.id}</strong>
                      <br />Status: {marker.status}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Dispatch Table */}
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><FileText size={20} /> Latest Ward Dispatches</h3>
            <button style={{ color: 'var(--c-emerald)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>View All</button>
          </div>

          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: 'var(--c-gray-400)', fontSize: '0.9rem' }}>
                <th style={{ paddingBottom: '16px', fontWeight: 'normal' }}>ID</th>
                <th style={{ paddingBottom: '16px', fontWeight: 'normal' }}>Type</th>
                <th style={{ paddingBottom: '16px', fontWeight: 'normal' }}>Priority</th>
                <th style={{ paddingBottom: '16px', fontWeight: 'normal' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {liveComplaints.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '32px 0', color: 'var(--c-gray-400)' }}>
                    No recent dispatches logged for {adminProfile.wardName}.
                  </td>
                </tr>
              )}
              {liveComplaints.map(c => (
                <tr key={c.id}>
                  <td style={{ padding: '12px 0', borderTop: '1px solid var(--glass-border)', fontFamily: 'monospace' }}>
                    {c.id.split('-')[0]}...
                  </td>
                  <td style={{ padding: '12px 0', borderTop: '1px solid var(--glass-border)' }}>
                    <div>{c.issue_type.replace('_', ' ')}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--c-gray-400)', whiteSpace: 'nowrap' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '12px 0', borderTop: '1px solid var(--glass-border)' }}>
                    <span style={{
                      color: c.priority === 'high' || c.priority === 'critical' ? '#ff3333' : 'var(--c-emerald)',
                      background: c.priority === 'high' || c.priority === 'critical' ? 'rgba(255, 51, 51, 0.1)' : 'rgba(0, 214, 143, 0.1)',
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem'
                    }}>{c.priority?.toUpperCase() || 'UNRATED'}</span>
                  </td>
                  <td style={{ padding: '12px 0', borderTop: '1px solid var(--glass-border)' }}>
                    {c.status === 'resolved' ? (
                      <span style={{ color: 'var(--c-emerald)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}><CheckCircle2 size={14} /> Resolved</span>
                    ) : (
                      <span style={{ color: '#ffb703', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}><Clock size={14} /> Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
