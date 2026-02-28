import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';

// Madurai Corporation Ward → Area Name Mapping
// Source: Madurai Corporation official ward data (maduraidirectory.com)
const WARD_AREA_MAP = {
    1: 'Santhi Nagar',
    2: 'Koodal Nagar',
    3: 'Anaiyur',
    4: 'Sambandhar Alankulam',
    5: 'B.B.Kulam',
    6: 'Meenambalpuram',
    7: 'Kailaasapuram',
    8: 'Vilangudi',
    9: 'Thathaneri',
    10: 'Aarappalayam',
    11: 'Ponnaharam',
    12: 'Krishnaapalayam',
    13: 'Azhagaradi',
    14: 'Viswasapuri',
    15: 'Melapponnaharam',
    16: 'Railway Colony',
    17: 'Ellis Nagar',
    18: 'S.S.Colony',
    19: 'Ponmeni',
    20: 'Arasaradi Othakkadai',
    21: 'Bethaniyapuram',
    22: 'Kochadai',
    23: 'Visalakshi Nagar',
    24: 'Thiruppaalai',
    25: 'Kannanendhal',
    26: 'Parasuraamanpatti',
    27: 'Karpaga Nagar',
    28: 'Uthangudi',
    29: 'Masthaanpatti',
    30: 'Melamadai',
    31: 'Tahsildhar Nagar',
    32: 'Vandiyur',
    33: 'Saathamangalam',
    34: 'Arignar Anna Nagar',
    35: 'Madhichiyam',
    36: 'Aazhwarpuram',
    37: 'Sellur',
    38: 'Pandhalkudi',
    39: 'Goripalayam',
    40: 'Ahimsapuram',
    41: 'Narimedu',
    42: 'Chokkikulam',
    43: 'Tallakulam',
    44: 'K.K.Nagar',
    45: 'Pudur',
    46: 'Lourdhu Nagar',
    47: 'Reserve Line',
    48: 'Aathikulam',
    49: 'Naahanakulam',
    50: 'Swami Sannidhi',
    51: 'Ismailpuram',
    52: 'Sourashtra Hr.Sec.School',
    53: 'Pangajam Colony',
    54: 'Mariamman Theppakulam',
    55: 'Iraavadhanallur',
    56: 'Sinna Anuppanadi',
    57: 'Anuppanadi',
    58: 'Chinthamani',
    59: 'Meenakshi Nagar',
    60: 'Avaniyaapuram',
    61: 'Villapuram Pudhu Nagar',
    62: 'Kathirvel Nagar',
    63: 'Villaapuram',
    64: 'Keeraithurai',
    65: 'Sappani Kovil',
    66: 'South Krishnan Kovil',
    67: 'Manjanakara Street',
    68: 'Dhrowpathi Amman Kovil',
    69: 'St.Marys',
    70: 'Kaamarajapuram',
    71: 'Balaranganathapuram',
    72: 'Navarathinapuram',
    73: 'Lakshmipuram',
    74: 'Thirumalai Naicker Mahal',
    75: 'Maadakkulam',
    76: 'Pazhangaanatham',
    77: 'Sundarajapuram',
    78: 'Madurai Baskaradass Nagar',
    79: 'Perumal Theppakulam',
    80: 'Krishnarayar Theppakulam',
    81: 'Tamilsangam',
    82: 'Sokkanadhar Kovil',
    83: 'North Krishnan Kovil',
    84: 'Meenakshi Kovil',
    85: 'Jadamuni Kovil',
    86: 'Kaajimar Street',
    87: 'Subramaniapuram',
    88: 'Solai Azhagupuram',
    89: 'Jaihindpuram',
    90: 'Veerakali Amman Kovil',
    91: 'Thennaharam',
    92: 'Kovalan Nagar',
    93: 'T.V.S.Nagar',
    94: 'Paamban Swami Nagar',
    95: 'Mannar College',
    96: 'Thirupparamkundram',
    97: 'Haarvipatti',
    98: 'Thirunahar',
    99: 'Balaji Nagar',
    100: 'Aaththikulam'
};

export default function WardMap({ height = '400px' }) {
    const [geoData, setGeoData] = useState(null);
    const [dbCounts, setDbCounts] = useState({});

    useEffect(() => {
        // Fetch GeoJSON boundaries
        fetch('/madurai-wards.geojson')
            .then(res => res.json())
            .then(data => setGeoData(data))
            .catch(err => console.error('Failed to load geojson', err));

        // Fetch live database metrics for coloring
        const fetchWardCounts = async () => {
            try {
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

        const subscription = supabase
            .channel('public:wardmap')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, fetchWardCounts)
            .subscribe();

        return () => supabase.removeChannel(subscription);
    }, []);

    const maduraiCenter = [9.9252, 78.1198];

    const onEachWard = (feature, layer) => {
        const wardId = feature.properties.id;
        const areaName = WARD_AREA_MAP[wardId] || feature.properties.name || `Ward ${wardId}`;
        const zone = feature.properties.zone || '';
        const activeIssues = dbCounts[wardId] || 0;

        // Color based on issue count
        let color = '#00d68f'; // Green — safe
        let statusLabel = '✅ Clear';
        let statusColor = '#00d68f';
        if (activeIssues > 3) {
            color = '#ff3333';
            statusLabel = '🔴 Critical';
            statusColor = '#ff3333';
        } else if (activeIssues > 0) {
            color = '#ffb703';
            statusLabel = '🟡 Active';
            statusColor = '#ffb703';
        }

        layer.setStyle({
            fillColor: color,
            weight: 1.5,
            opacity: 1,
            color: 'rgba(255,255,255,0.5)',
            dashArray: '3',
            fillOpacity: 0.35
        });

        // Permanent ward number label on each polygon
        layer.bindTooltip(`${wardId}`, {
            permanent: true,
            direction: 'center',
            className: 'ward-label-tooltip'
        });

        // Dark-themed popup with light fonts for visibility
        layer.bindPopup(`
            <div style="
                background: #0d1117;
                color: #e6edf3;
                padding: 14px 18px;
                border-radius: 12px;
                min-width: 200px;
                font-family: 'Inter', system-ui, sans-serif;
                border: 1px solid rgba(255,255,255,0.1);
            ">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                    <span style="
                        background: ${statusColor}22;
                        color: ${statusColor};
                        font-size: 10px;
                        font-weight: 700;
                        padding: 3px 8px;
                        border-radius: 20px;
                        border: 1px solid ${statusColor}44;
                    ">Ward ${wardId}</span>
                    <span style="
                        font-size: 10px;
                        color: ${statusColor};
                    ">${statusLabel}</span>
                </div>
                <h3 style="
                    margin: 0 0 4px 0;
                    font-size: 16px;
                    font-weight: 700;
                    color: #ffffff;
                    letter-spacing: -0.2px;
                ">${areaName}</h3>
                ${zone ? `<div style="
                    font-size: 11px;
                    color: #8b949e;
                    margin-bottom: 8px;
                ">📍 ${zone}</div>` : ''}
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 8px;
                    border-top: 1px solid rgba(255,255,255,0.08);
                ">
                    <span style="color: #8b949e; font-size: 12px;">Active Issues</span>
                    <span style="
                        font-size: 22px;
                        font-weight: 800;
                        color: ${statusColor};
                    ">${activeIssues}</span>
                </div>
            </div>
        `, {
            className: 'ward-popup-dark',
            closeButton: true,
            maxWidth: 260
        });

        layer.on({
            mouseover: (e) => {
                const target = e.target;
                target.setStyle({
                    weight: 3,
                    color: '#ffffff',
                    dashArray: '',
                    fillOpacity: 0.6
                });
                target.bringToFront();
            },
            mouseout: (e) => {
                const target = e.target;
                target.setStyle({
                    weight: 1.5,
                    color: 'rgba(255,255,255,0.5)',
                    dashArray: '3',
                    fillOpacity: 0.35
                });
            }
        });
    };

    if (!geoData) {
        return (
            <div style={{
                height,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--c-midnight-light)',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '14px'
            }}>
                Loading map data...
            </div>
        );
    }

    return (
        <>
            <style>{`
                .ward-popup-dark .leaflet-popup-content-wrapper {
                    background: transparent !important;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.5) !important;
                    border-radius: 12px !important;
                    padding: 0 !important;
                    overflow: hidden;
                }
                .ward-popup-dark .leaflet-popup-content {
                    margin: 0 !important;
                    line-height: 1.4 !important;
                }
                .ward-popup-dark .leaflet-popup-tip {
                    background: #0d1117 !important;
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    box-shadow: none !important;
                }
                .ward-popup-dark .leaflet-popup-close-button {
                    color: #8b949e !important;
                    font-size: 18px !important;
                    top: 6px !important;
                    right: 8px !important;
                }
                .ward-popup-dark .leaflet-popup-close-button:hover {
                    color: #ffffff !important;
                }
                .ward-label-tooltip {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    color: rgba(255,255,255,0.85) !important;
                    font-size: 10px !important;
                    font-weight: 700 !important;
                    text-shadow: 0 1px 4px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.6) !important;
                    padding: 0 !important;
                    pointer-events: none !important;
                }
                .ward-label-tooltip::before {
                    display: none !important;
                }
            `}</style>
            <MapContainer center={maduraiCenter} zoom={13} style={{ height, width: '100%', zIndex: 10 }}>
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <GeoJSON
                    key={JSON.stringify(dbCounts)}
                    data={geoData}
                    onEachFeature={onEachWard}
                />
            </MapContainer>
        </>
    );
}
