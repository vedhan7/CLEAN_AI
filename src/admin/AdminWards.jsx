import React, { useState, useEffect } from 'react';
import { Loader2, MapPin, Users, AlertTriangle } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AdminWards = () => {
    const [wards, setWards] = useState([]);
    const [complaintsByWard, setComplaintsByWard] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: wardsData } = await supabase.from('wards').select('*').order('id');
            setWards(wardsData || []);

            const { data: complaints } = await supabase.from('complaints').select('ward_id, status');
            const counts = {};
            (complaints || []).forEach(c => {
                if (!c.ward_id) return;
                if (!counts[c.ward_id]) counts[c.ward_id] = { total: 0, pending: 0, resolved: 0 };
                counts[c.ward_id].total++;
                if (c.status === 'pending') counts[c.ward_id].pending++;
                if (c.status === 'resolved' || c.status === 'completed') counts[c.ward_id].resolved++;
            });
            setComplaintsByWard(counts);
        } catch (err) {
            toast.error('Failed to load ward data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--c-emerald)]" size={32} /></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-2xl font-display font-bold">Ward Management</h1>
            <p className="text-[var(--c-gray-400)]">Overview of all {wards.length} wards in Madurai Corporation</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wards.map(ward => {
                    const stats = complaintsByWard[ward.id] || { total: 0, pending: 0, resolved: 0 };
                    return (
                        <GlassCard key={ward.id} className="p-5 hover:border-[var(--c-emerald)] transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">Ward {ward.id}</h3>
                                    <p className="text-sm text-[var(--c-gray-400)]">{ward.name || 'Unnamed Ward'}</p>
                                </div>
                                <div className="p-2 rounded-lg bg-[var(--c-emerald)]/10 text-[var(--c-emerald)]">
                                    <MapPin size={18} />
                                </div>
                            </div>
                            {ward.councillor_name && (
                                <p className="text-sm mb-3 text-[var(--c-gray-300)]">
                                    <Users size={14} className="inline mr-1" /> {ward.councillor_name} ({ward.councillor_party || 'N/A'})
                                </p>
                            )}
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-white/5 rounded-lg p-2">
                                    <p className="text-lg font-bold">{stats.total}</p>
                                    <p className="text-[10px] text-[var(--c-gray-400)]">Total</p>
                                </div>
                                <div className="bg-yellow-500/10 rounded-lg p-2">
                                    <p className="text-lg font-bold text-yellow-400">{stats.pending}</p>
                                    <p className="text-[10px] text-[var(--c-gray-400)]">Pending</p>
                                </div>
                                <div className="bg-[var(--c-emerald)]/10 rounded-lg p-2">
                                    <p className="text-lg font-bold text-[var(--c-emerald)]">{stats.resolved}</p>
                                    <p className="text-[10px] text-[var(--c-gray-400)]">Resolved</p>
                                </div>
                            </div>
                        </GlassCard>
                    );
                })}
            </div>

            {wards.length === 0 && (
                <GlassCard className="p-12 text-center">
                    <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-400 opacity-50" />
                    <p className="text-[var(--c-gray-400)]">No wards found. Import ward data into the `wards` table in Supabase.</p>
                </GlassCard>
            )}
        </div>
    );
};

export default AdminWards;
