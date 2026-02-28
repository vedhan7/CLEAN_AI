import React, { useState, useEffect } from 'react';
import { Loader2, Search, Filter, Eye, Truck, CheckCircle, X, MapPin } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const AdminComplaints = () => {
    const { profile } = useAuth();
    const myWardId = profile?.ward_id;

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selected, setSelected] = useState(null);
    const [dispatchStatus, setDispatchStatus] = useState('dispatched');
    const [assignedLcv, setAssignedLcv] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => { fetchComplaints(); }, []);

    const fetchComplaints = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('complaints')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) toast.error(error.message);
        setComplaints(data || []);
        setLoading(false);
    };

    const handleUpdate = async () => {
        if (!selected) return;
        setIsUpdating(true);
        try {
            const { error } = await supabase.from('complaints')
                .update({ status: dispatchStatus, assigned_lcv: assignedLcv, updated_at: new Date().toISOString() })
                .eq('id', selected.id);
            if (error) throw error;

            const { data: authData } = await supabase.auth.getUser();
            await supabase.from('complaint_timeline').insert([{
                complaint_id: selected.id,
                status: dispatchStatus,
                message: `Status → ${dispatchStatus}. ${assignedLcv ? `LCV: ${assignedLcv}` : ''}`,
                actor_id: authData?.user?.id
            }]);

            toast.success('Complaint updated!');
            setSelected(null);
            fetchComplaints();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsUpdating(false);
        }
    };

    // Filter: search now also matches ward number
    const filtered = complaints.filter(c => {
        const q = search.toLowerCase().trim();
        const matchesSearch = !q ||
            (c.tracking_id || '').toLowerCase().includes(q) ||
            (c.type || '').toLowerCase().includes(q) ||
            (c.description || '').toLowerCase().includes(q) ||
            (c.ward_id != null && (`ward ${c.ward_id}`.includes(q) || `${c.ward_id}` === q));
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Sort: councillor's own ward complaints first, then the rest
    const sorted = [...filtered].sort((a, b) => {
        if (myWardId) {
            const aIsMine = a.ward_id === myWardId ? 0 : 1;
            const bIsMine = b.ward_id === myWardId ? 0 : 1;
            if (aIsMine !== bIsMine) return aIsMine - bIsMine;
        }
        return new Date(b.created_at) - new Date(a.created_at);
    });

    const statusCounts = {
        all: complaints.length,
        pending: complaints.filter(c => c.status === 'pending').length,
        dispatched: complaints.filter(c => c.status === 'dispatched').length,
        in_progress: complaints.filter(c => c.status === 'in_progress').length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Detail Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <GlassCard className="w-full max-w-xl p-0 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-[var(--glass-border)] flex justify-between items-center bg-white/5">
                            <h2 className="text-lg font-bold">{selected.tracking_id || selected.id.substring(0, 8)}</h2>
                            <button onClick={() => setSelected(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={18} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-[var(--c-gray-400)]">Type</span><p className="capitalize font-medium">{selected.type?.replace('_', ' ')}</p></div>
                                <div><span className="text-[var(--c-gray-400)]">Ward</span><p className="font-medium">Ward {selected.ward_id || '--'}</p></div>
                                <div><span className="text-[var(--c-gray-400)]">Priority</span><p><Badge type="priority" value={selected.priority}>{selected.priority}</Badge></p></div>
                                <div><span className="text-[var(--c-gray-400)]">Current Status</span><p><Badge type="status" value={selected.status}>{selected.status}</Badge></p></div>
                            </div>
                            <div><span className="text-[var(--c-gray-400)] text-sm">Description</span><p className="text-sm mt-1 p-3 bg-white/5 rounded border border-[var(--glass-border)]">{selected.description || 'None'}</p></div>
                            {selected.photo_urls?.length > 0 && (
                                <img src={selected.photo_urls[0]} alt="Evidence" className="w-full h-40 object-cover rounded-lg border border-[var(--glass-border)]" />
                            )}
                            <div className="bg-white/5 p-4 rounded-xl border border-[var(--glass-border)] space-y-3">
                                <h3 className="font-medium text-[var(--c-emerald)] text-sm">Update & Dispatch</h3>
                                <select className="w-full bg-[var(--c-midnight)] border border-[var(--glass-border)] rounded px-3 py-2 text-sm text-white" value={dispatchStatus} onChange={e => setDispatchStatus(e.target.value)}>
                                    <option value="pending">Pending</option><option value="assigned">Assigned</option><option value="dispatched">Dispatched</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option>
                                </select>
                                <input type="text" placeholder="LCV: TN-59-AB-1234" className="w-full bg-[var(--c-midnight)] border border-[var(--glass-border)] rounded px-3 py-2 text-sm text-white" value={assignedLcv} onChange={e => setAssignedLcv(e.target.value)} />
                                <Button className="w-full py-2" onClick={handleUpdate} disabled={isUpdating}>
                                    {isUpdating ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Update'}
                                </Button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-display font-bold">All Complaints</h1>
                {myWardId && (
                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--c-emerald)]/10 border border-[var(--c-emerald)]/30 text-[var(--c-emerald)] text-xs font-semibold">
                        <MapPin size={12} /> Your Ward: {myWardId} — shown first
                    </span>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-gray-400)]" />
                    <input type="text" placeholder="Search by ID, type, ward number, description..." className="w-full bg-white/5 border border-[var(--glass-border)] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--c-emerald)]" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {Object.entries(statusCounts).map(([key, count]) => (
                    <button key={key} onClick={() => setFilterStatus(key)} className={`px-4 py-2 rounded-lg text-sm border transition-colors capitalize ${filterStatus === key ? 'bg-[var(--c-emerald)]/20 border-[var(--c-emerald)] text-[var(--c-emerald)]' : 'bg-white/5 border-[var(--glass-border)] text-[var(--c-gray-300)] hover:border-[var(--c-emerald)]'}`}>
                        {key === 'all' ? 'All' : key.replace('_', ' ')} ({count})
                    </button>
                ))}
            </div>

            {/* Table */}
            <GlassCard className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr className="border-b border-[var(--glass-border)] text-[var(--c-gray-400)] text-xs uppercase">
                            <th className="p-4">Tracking ID</th><th className="p-4">Type</th><th className="p-4">Ward</th><th className="p-4">Priority</th><th className="p-4">Status</th><th className="p-4">Date</th><th className="p-4">Actions</th>
                        </tr></thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-12"><Loader2 className="animate-spin mx-auto text-[var(--c-emerald)]" size={28} /></td></tr>
                            ) : sorted.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-12 text-[var(--c-gray-400)]">No complaints found.</td></tr>
                            ) : sorted.map(c => (
                                <tr key={c.id} className={`border-b border-[var(--glass-border)] hover:bg-white/5 transition-colors ${myWardId && c.ward_id === myWardId ? 'bg-[var(--c-emerald)]/5' : ''}`}>
                                    <td className="p-4 font-medium text-[var(--c-emerald)]">{c.tracking_id || c.id.substring(0, 8)}</td>
                                    <td className="p-4 capitalize">{c.type?.replace('_', ' ')}</td>
                                    <td className="p-4">
                                        <span className="flex items-center gap-1">
                                            Ward {c.ward_id || '--'}
                                            {myWardId && c.ward_id === myWardId && <MapPin size={12} className="text-[var(--c-emerald)]" />}
                                        </span>
                                    </td>
                                    <td className="p-4"><Badge type="priority" value={c.priority}>{c.priority}</Badge></td>
                                    <td className="p-4"><Badge type="status" value={c.status}>{c.status}</Badge></td>
                                    <td className="p-4 text-[var(--c-gray-400)]">{new Date(c.created_at).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <button onClick={() => { setSelected(c); setDispatchStatus(c.status); setAssignedLcv(c.assigned_lcv || ''); }} className="p-2 hover:bg-white/10 rounded-lg text-[var(--c-emerald)]"><Eye size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
};

export default AdminComplaints;

