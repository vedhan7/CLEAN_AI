import React, { useState, useEffect } from 'react';
import councillorsData from '../data/councillors.json';
import { Trophy, TrendingUp, TrendingDown, Minus, Phone, Mail } from 'lucide-react';

export default function Leaderboard() {
  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' });

  useEffect(() => {
    // Calculate an aggregate "Cleanliness Score" based on mock metrics
    const processedData = councillorsData.map(c => {
      const score = Math.round(
        (c.door_to_door_pct * 0.4) +
        (c.segregation_pct * 0.3) +
        (c.toilet_cleanliness_pct * 0.2) +
        (c.dumpsite_remediation_pct * 0.1)
      );
      return { ...c, score };
    });

    // Sort initially by score
    processedData.sort((a, b) => b.score - a.score);
    /* eslint-disable-next-line */
    setData(processedData);
  }, []);

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setData(sortedData);
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy size={18} color="#FFD700" />;
    if (index === 1) return <Trophy size={18} color="#C0C0C0" />;
    if (index === 2) return <Trophy size={18} color="#CD7F32" />;
    return <span style={{ color: 'var(--c-gray-400)', fontWeight: 'bold' }}>#{index + 1}</span>;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--c-emerald)';
    if (score >= 50) return '#ffb703';
    return 'var(--c-saffron)';
  };

  return (
    <div className="container" style={{ paddingTop: '100px' }}>
      <h1 className="animate-fade-in-up" style={{ marginBottom: 'var(--space-xs)' }}>Councillor Leaderboard</h1>
      <p className="animate-fade-in-up delay-100" style={{ color: 'var(--c-gray-400)', marginBottom: 'var(--space-md)' }}>
        Real-time ranking of 100 Madurai Wards based on resolving civic issues and solid waste management KPIs.
      </p>

      <div className="glass-card animate-fade-in-up delay-200" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '16px', cursor: 'pointer' }}>Rank</th>
              <th style={{ padding: '16px', cursor: 'pointer' }} onClick={() => requestSort('name')}>Ward</th>
              <th style={{ padding: '16px' }}>Councillor</th>
              <th style={{ padding: '16px' }}>Zone</th>
              <th style={{ padding: '16px', cursor: 'pointer' }} onClick={() => requestSort('door_to_door_pct')}>Collection %</th>
              <th style={{ padding: '16px', cursor: 'pointer', textAlign: 'center' }} onClick={() => requestSort('score')}>
                Cleanliness Score {sortConfig.key === 'score' ? (sortConfig.direction === 'desc' ? '↓' : '↑') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s', ':hover': { background: 'rgba(255,255,255,0.02)' } }}>
                <td style={{ padding: '16px', width: '60px', textAlign: 'center' }}>
                  {getRankIcon(i)}
                </td>
                <td style={{ padding: '16px', fontWeight: 600 }}>{row.name}</td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: 600 }}>{row.councillor_name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--c-gray-400)' }}>{row.councillor_party}</span>
                    {(row.councillor_phone || row.councillor_email) && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '4px', color: 'var(--c-gray-500)', fontSize: '0.75rem' }}>
                        {row.councillor_phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={12} />
                            {row.councillor_phone}
                          </div>
                        )}
                        {row.councillor_email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={12} />
                            {row.councillor_email}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td style={{ padding: '16px', color: 'var(--c-gray-400)' }}>{row.zone}</td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, background: 'var(--c-midnight)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: row.door_to_door_pct + '%', height: '100%', background: getScoreColor(row.score) }}></div>
                    </div>
                    <span style={{ fontSize: '0.85rem' }}>{row.door_to_door_pct}%</span>
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid ' + getScoreColor(row.score), color: getScoreColor(row.score), fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {row.score}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div >
    </div >
  );
}
