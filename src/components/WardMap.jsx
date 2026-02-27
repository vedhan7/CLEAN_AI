import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function WardMap({ height = '400px' }) {
    const [geoData, setGeoData] = useState(null);

    useEffect(() => {
        fetch('/madurai-wards.geojson')
            .then(res => res.json())
            .then(data => setGeoData(data))
            .catch(err => console.error('Failed to load geojson', err));
    }, []);

    const maduraiCenter = [9.9252, 78.1198];

    const onEachWard = (feature, layer) => {
        const wardName = feature.properties.name;
        const score = Math.floor(Math.random() * 100);
        const color = score > 75 ? '#00d68f' : score > 40 ? '#ffb703' : '#ff6b35';

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
        <p style="margin:8px 0 0 0;"><strong>Score:</strong> ${score}/100</p>
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
