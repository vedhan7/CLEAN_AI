import React, { useState, useEffect } from 'react';
import councillorsData from '../data/councillors.json';
import { Trophy, Phone, Mail } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

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
        if (index === 0) return <Trophy size={20} color="#FFD700" className="mx-auto" />;
        if (index === 1) return <Trophy size={20} color="#C0C0C0" className="mx-auto" />;
        if (index === 2) return <Trophy size={20} color="#CD7F32" className="mx-auto" />;
        return <span className="text-[var(--c-gray-400)] font-bold">#{index + 1}</span>;
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'var(--c-emerald)';
        if (score >= 50) return '#ffb703';
        return '#F43F5E';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-8">
            <div className="mb-8">
                <h1 className="font-display font-bold text-4xl mb-2 text-white">Councillor Leaderboard</h1>
                <p className="text-[var(--c-gray-400)] max-w-2xl">
                    Real-time ranking of 100 Madurai Wards based on resolving civic issues and solid waste management KPIs. Top 3 wards receive additional sanitation funding next quarter.
                </p>
            </div>

            <GlassCard className="overflow-x-auto p-0 border border-[var(--glass-border)] shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-[var(--glass-border)]">
                            <th className="p-4 cursor-pointer text-[var(--c-gray-300)] font-semibold" onClick={() => requestSort('id')}>Rank</th>
                            <th className="p-4 cursor-pointer text-[var(--c-gray-300)] font-semibold" onClick={() => requestSort('name')}>Ward Name</th>
                            <th className="p-4 text-[var(--c-gray-300)] font-semibold">Councillor Details</th>
                            <th className="p-4 text-[var(--c-gray-300)] font-semibold">Zone</th>
                            <th className="p-4 cursor-pointer text-[var(--c-gray-300)] font-semibold min-w-[200px]" onClick={() => requestSort('door_to_door_pct')}>Collection Efficiency</th>
                            <th className="p-4 cursor-pointer text-center text-[var(--c-emerald)] font-bold whitespace-nowrap" onClick={() => requestSort('score')}>
                                Cleanliness Score {sortConfig.key === 'score' ? (sortConfig.direction === 'desc' ? '↓' : '↑') : ''}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--glass-border)]">
                        {data.map((row, i) => (
                            <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4 w-16 text-center">
                                    {getRankIcon(i)}
                                </td>
                                <td className="p-4 font-semibold text-white whitespace-nowrap">Ward {row.id} - {row.name}</td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-semibold text-white">{row.councillor_name}</span>
                                        <span className="text-xs text-[var(--c-gray-400)]">{row.councillor_party}</span>
                                        {(row.councillor_phone || row.councillor_email) && (
                                            <div className="flex flex-wrap gap-3 mt-1 text-[var(--c-gray-500)] text-xs">
                                                {row.councillor_phone && (
                                                    <div className="flex items-center gap-1 group-hover:text-[var(--c-emerald)] transition-colors">
                                                        <Phone size={12} /> {row.councillor_phone}
                                                    </div>
                                                )}
                                                {row.councillor_email && (
                                                    <div className="flex items-center gap-1 group-hover:text-cyan-400 transition-colors">
                                                        <Mail size={12} /> {row.councillor_email}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-[var(--c-gray-400)] capitalize">{row.zone.replace('_', ' ')}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-[var(--c-midnight)] h-2 rounded-full overflow-hidden border border-[var(--glass-border)]">
                                            <div
                                                className="h-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]"
                                                style={{ width: `${row.door_to_door_pct}%`, backgroundColor: getScoreColor(row.score), color: getScoreColor(row.score) }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-medium w-10 text-right">{row.door_to_door_pct}%</span>
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <div
                                        className="inline-flex items-center justify-center bg-white/5 px-4 py-2 rounded-lg border font-bold text-xl shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                                        style={{
                                            borderColor: getScoreColor(row.score),
                                            color: getScoreColor(row.score),
                                            boxShadow: `inset 0 0 10px ${getScoreColor(row.score)}20`
                                        }}
                                    >
                                        {row.score}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </GlassCard>
        </div>
    );
}
