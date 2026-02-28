import React, { useState, useEffect } from 'react';
import { Loader2, BarChart3, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Truck } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <GlassCard className="p-5">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-[var(--c-gray-400)] text-xs uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-bold mt-1">{value}</h3>
                {subtitle && <p className="text-sm text-[var(--c-gray-400)] mt-1">{subtitle}</p>}
            </div>
            <div className={`p-2 rounded-lg ${color}`}><Icon size={20} /></div>
        </div>
    </GlassCard>
);

const AdminAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAnalytics(); }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const { data: complaints } = await supabase.from('complaints').select('*');
            const all = complaints || [];

            const today = new Date(); today.setHours(0, 0, 0, 0);
            const thisWeek = new Date(); thisWeek.setDate(thisWeek.getDate() - 7);
            const thisMonth = new Date(); thisMonth.setDate(1);

            const todayCount = all.filter(c => new Date(c.created_at) >= today).length;
            const weekCount = all.filter(c => new Date(c.created_at) >= thisWeek).length;
            const monthCount = all.filter(c => new Date(c.created_at) >= thisMonth).length;

            const pending = all.filter(c => c.status === 'pending').length;
            const dispatched = all.filter(c => c.status === 'dispatched' || c.status === 'assigned').length;
            const inProgress = all.filter(c => c.status === 'in_progress').length;
            const resolved = all.filter(c => c.status === 'resolved' || c.status === 'completed').length;
            const rate = all.length > 0 ? Math.round((resolved / all.length) * 100) : 0;

            // By type breakdown
            const byType = {};
            all.forEach(c => { byType[c.type] = (byType[c.type] || 0) + 1; });

            // By ward breakdown
            const byWard = {};
            all.forEach(c => { if (c.ward_id) byWard[`Ward ${c.ward_id}`] = (byWard[`Ward ${c.ward_id}`] || 0) + 1; });

            // By priority
            const byPriority = {};
            all.forEach(c => { byPriority[c.priority] = (byPriority[c.priority] || 0) + 1; });

            setStats({ total: all.length, todayCount, weekCount, monthCount, pending, dispatched, inProgress, resolved, rate, byType, byWard, byPriority });
        } catch (err) {
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--c-emerald)]" size={32} /></div>;
    if (!stats) return null;

    const sortedTypes = Object.entries(stats.byType).sort((a, b) => b[1] - a[1]);
    const sortedWards = Object.entries(stats.byWard).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const maxTypeCount = sortedTypes.length > 0 ? sortedTypes[0][1] : 1;
    const maxWardCount = sortedWards.length > 0 ? sortedWards[0][1] : 1;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-2xl font-display font-bold">Analytics Overview</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Complaints" value={stats.total} subtitle={`${stats.todayCount} today`} icon={BarChart3} color="bg-blue-500/10 text-blue-500" />
                <StatCard title="Pending" value={stats.pending} subtitle="Awaiting action" icon={Clock} color="bg-yellow-500/10 text-yellow-400" />
                <StatCard title="Dispatched" value={stats.dispatched + stats.inProgress} subtitle="In field" icon={Truck} color="bg-purple-500/10 text-purple-400" />
                <StatCard title="Resolution Rate" value={`${stats.rate}%`} subtitle={`${stats.resolved} resolved`} icon={CheckCircle} color="bg-[var(--c-emerald)]/10 text-[var(--c-emerald)]" />
            </div>

            {/* Timeline Stats */}
            <div className="grid grid-cols-3 gap-4">
                <GlassCard className="p-5 text-center">
                    <p className="text-[var(--c-gray-400)] text-xs uppercase mb-1">Today</p>
                    <p className="text-2xl font-bold">{stats.todayCount}</p>
                </GlassCard>
                <GlassCard className="p-5 text-center">
                    <p className="text-[var(--c-gray-400)] text-xs uppercase mb-1">This Week</p>
                    <p className="text-2xl font-bold">{stats.weekCount}</p>
                </GlassCard>
                <GlassCard className="p-5 text-center">
                    <p className="text-[var(--c-gray-400)] text-xs uppercase mb-1">This Month</p>
                    <p className="text-2xl font-bold">{stats.monthCount}</p>
                </GlassCard>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* By Type */}
                <GlassCard className="p-6">
                    <h3 className="font-bold mb-4">Complaints by Type</h3>
                    <div className="space-y-3">
                        {sortedTypes.map(([type, count]) => (
                            <div key={type}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="capitalize text-[var(--c-gray-300)]">{type.replace(/_/g, ' ')}</span>
                                    <span className="font-medium">{count}</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-[var(--c-emerald)] to-cyan-500 rounded-full transition-all duration-500" style={{ width: `${(count / maxTypeCount) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                        {sortedTypes.length === 0 && <p className="text-[var(--c-gray-400)] text-sm">No data yet</p>}
                    </div>
                </GlassCard>

                {/* By Ward (Top 10) */}
                <GlassCard className="p-6">
                    <h3 className="font-bold mb-4">Top Wards by Complaints</h3>
                    <div className="space-y-3">
                        {sortedWards.map(([ward, count]) => (
                            <div key={ward}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-[var(--c-gray-300)]">{ward}</span>
                                    <span className="font-medium">{count}</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" style={{ width: `${(count / maxWardCount) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                        {sortedWards.length === 0 && <p className="text-[var(--c-gray-400)] text-sm">No data yet</p>}
                    </div>
                </GlassCard>
            </div>

            {/* By Priority */}
            <GlassCard className="p-6">
                <h3 className="font-bold mb-4">Priority Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['critical', 'high', 'medium', 'low'].map(p => {
                        const colors = { critical: 'bg-red-500/20 text-red-400 border-red-500/30', high: 'bg-orange-500/20 text-orange-400 border-orange-500/30', medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', low: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
                        return (
                            <div key={p} className={`p-4 rounded-xl border text-center ${colors[p]}`}>
                                <p className="text-2xl font-bold">{stats.byPriority[p] || 0}</p>
                                <p className="text-xs uppercase mt-1 capitalize">{p}</p>
                            </div>
                        );
                    })}
                </div>
            </GlassCard>
        </div>
    );
};

export default AdminAnalytics;
