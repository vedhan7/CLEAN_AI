import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, CheckCircle, Clock, Truck, Loader2, X, Send, FileDown, Map, Bell, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

// KPI Card component
const AdminKPICard = ({ title, value, trend, icon: Icon, colorClass, loading }) => (
    <GlassCard className="p-6 flex items-start justify-between">
        <div>
            <p className="text-[var(--c-gray-400)] text-sm mb-2">{title}</p>
            {loading ? (
                <div className="h-9 flex items-center"><Loader2 className="animate-spin text-[var(--c-emerald)]" size={24} /></div>
            ) : (
                <h3 className="text-3xl font-display font-bold">{value}</h3>
            )}
            <p className={`text-sm mt-2 ${!trend ? 'text-transparent' : trend.startsWith('+') ? 'text-[var(--c-emerald)]' : 'text-[var(--c-rose)]'}`}>
                {trend || '...'}
            </p>
        </div>
        <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon size={24} />
        </div>
    </GlassCard>
);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const myWardId = profile?.ward_id;
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState({
        citizens: 0,
        todayComplaints: 0,
        resolvedRate: 0,
        avgResolution: '2.4 hrs'
    });
    const [loading, setLoading] = useState(true);

    // Dispatch Modal State
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [dispatchStatus, setDispatchStatus] = useState('dispatched');
    const [assignedLcv, setAssignedLcv] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchDashboardData();

        const subscription = supabase
            .channel('public:complaints')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => {
                fetchDashboardData();
            })
            .subscribe();

        return () => { supabase.removeChannel(subscription); };
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data: recent, error: recentErr } = await supabase
                .from('complaints')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (recentErr) throw recentErr;
            setComplaints(recent || []);

            const { count: citizensCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'citizen');

            const { data: allComplaints, error: allErr } = await supabase
                .from('complaints')
                .select('status, created_at');

            if (allErr) throw allErr;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayCount = allComplaints.filter(c => new Date(c.created_at) >= today).length;

            const resolvedCount = allComplaints.filter(c => c.status === 'resolved' || c.status === 'completed' || c.status === 'verified').length;
            const rate = allComplaints.length > 0 ? Math.round((resolvedCount / allComplaints.length) * 100) : 0;

            setStats({
                citizens: citizensCount || 0,
                todayComplaints: todayCount,
                resolvedRate: rate,
                avgResolution: '3.2 hrs'
            });
        } catch (error) {
            console.error("Dashboard fetch error:", error);
            toast.error("Failed to sync live dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleDispatch = async (e) => {
        e.preventDefault();
        if (!selectedComplaint) return;

        setIsUpdating(true);
        const loadingToast = toast.loading('Updating complaint & assigning LCV...');

        try {
            const { error: updateErr } = await supabase
                .from('complaints')
                .update({
                    status: dispatchStatus,
                    assigned_lcv: assignedLcv,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedComplaint.id);

            if (updateErr) throw updateErr;

            const { data: authData } = await supabase.auth.getUser();
            const { error: timelineErr } = await supabase
                .from('complaint_timeline')
                .insert([{
                    complaint_id: selectedComplaint.id,
                    status: dispatchStatus,
                    message: `Status updated to ${dispatchStatus}. ${assignedLcv ? `Assigned to LCV: ${assignedLcv}` : ''}`,
                    actor_id: authData?.user?.id
                }]);

            if (timelineErr) console.error("Timeline error:", timelineErr);

            toast.success("LCV Dispatched and status updated!", { id: loadingToast });
            setSelectedComplaint(null);
            setAssignedLcv('');
        } catch (err) {
            console.error("Update error:", err);
            toast.error(err.message || 'Failed to update complaint', { id: loadingToast });
        } finally {
            setIsUpdating(false);
        }
    };

    // Quick Action: Generate CSV Report
    const handleGenerateReport = async () => {
        const toastId = toast.loading('Generating report...');
        try {
            const { data, error } = await supabase
                .from('complaints')
                .select('tracking_id, type, ward_id, priority, status, description, address, created_at, resolved_at, assigned_lcv')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const headers = ['Tracking ID', 'Type', 'Ward', 'Priority', 'Status', 'Description', 'Address', 'Created', 'Resolved', 'Assigned LCV'];
            const csvRows = [
                headers.join(','),
                ...data.map(c => [
                    c.tracking_id || '',
                    c.type || '',
                    c.ward_id || '',
                    c.priority || '',
                    c.status || '',
                    `"${(c.description || '').replace(/"/g, '""')}"`,
                    `"${(c.address || '').replace(/"/g, '""')}"`,
                    c.created_at ? new Date(c.created_at).toLocaleDateString() : '',
                    c.resolved_at ? new Date(c.resolved_at).toLocaleDateString() : '',
                    c.assigned_lcv || ''
                ].join(','))
            ];

            const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `complaints_report_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);

            toast.success(`Report downloaded — ${data.length} complaints`, { id: toastId });
        } catch (err) {
            toast.error(err.message, { id: toastId });
        }
    };

    // Quick Action: Send broadcast notification to all admin councillors
    const handleBroadcast = async () => {
        const message = prompt('Enter broadcast message for all councillors:');
        if (!message || !message.trim()) return;

        const toastId = toast.loading('Sending broadcast...');
        try {
            const { data: admins, error: adminsErr } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'admin_councillor');

            if (adminsErr) throw adminsErr;

            const notifications = admins.map(a => ({
                user_id: a.id,
                title: '📢 Admin Broadcast',
                message: message.trim(),
                type: 'system'
            }));

            const { error: insertErr } = await supabase.from('notifications').insert(notifications);
            if (insertErr) throw insertErr;

            toast.success(`Broadcast sent to ${admins.length} councillor(s)`, { id: toastId });
        } catch (err) {
            toast.error(err.message, { id: toastId });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative">

            {/* Modal Overlay for Dispatching */}
            {selectedComplaint && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <GlassCard className="w-full max-w-2xl p-0 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-[var(--glass-border)] flex justify-between items-center bg-white/5">
                            <h2 className="text-xl font-bold font-display">Complaint Details</h2>
                            <button onClick={() => setSelectedComplaint(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[var(--c-gray-400)] text-sm">Tracking ID</p>
                                    <p className="font-bold text-[var(--c-emerald)] text-lg">{selectedComplaint.tracking_id || selectedComplaint.id.substring(0, 8)}</p>
                                </div>
                                <div>
                                    <p className="text-[var(--c-gray-400)] text-sm">Type & Ward</p>
                                    <p className="font-medium capitalize">{selectedComplaint.type?.replace('_', ' ')} • Ward {selectedComplaint.ward_id || '--'}</p>
                                </div>
                                <div>
                                    <p className="text-[var(--c-gray-400)] text-sm mb-1">Current Priority</p>
                                    <Badge type="priority" value={selectedComplaint.priority}>{selectedComplaint.priority}</Badge>
                                </div>
                                <div>
                                    <p className="text-[var(--c-gray-400)] text-sm">Description</p>
                                    <p className="text-sm bg-white/5 p-3 rounded border border-[var(--glass-border)] mt-1">{selectedComplaint.description || 'No description provided.'}</p>
                                </div>
                            </div>
                            <div>
                                {selectedComplaint.photo_urls && selectedComplaint.photo_urls.length > 0 ? (
                                    <div className="mb-6">
                                        <p className="text-[var(--c-gray-400)] text-sm mb-2">Attached Evidence</p>
                                        <img src={selectedComplaint.photo_urls[0]} alt="Evidence" className="w-full aspect-video object-cover rounded-lg border border-[var(--glass-border)]" />
                                    </div>
                                ) : (
                                    <div className="mb-6 aspect-video bg-white/5 border border-[var(--glass-border)] rounded-lg flex items-center justify-center text-[var(--c-gray-400)] text-sm">
                                        No photo evidence attached
                                    </div>
                                )}

                                <form onSubmit={handleDispatch} className="space-y-4 bg-white/5 p-4 rounded-xl border border-[var(--glass-border)]">
                                    <h3 className="font-medium text-[var(--c-emerald)]">Update & Dispatch</h3>
                                    <div>
                                        <label className="text-xs text-[var(--c-gray-300)] block mb-1">Set Status</label>
                                        <select
                                            className="w-full bg-[var(--c-midnight)] border border-[var(--glass-border)] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--c-emerald)]"
                                            value={dispatchStatus}
                                            onChange={e => setDispatchStatus(e.target.value)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="assigned">Assigned</option>
                                            <option value="dispatched">Dispatched</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-[var(--c-gray-300)] block mb-1">Assign LCV / Team (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. TN-59-AB-1234"
                                            className="w-full bg-[var(--c-midnight)] border border-[var(--glass-border)] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--c-emerald)]"
                                            value={assignedLcv}
                                            onChange={e => setAssignedLcv(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full py-2" disabled={isUpdating}>
                                        {isUpdating ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Update Request"}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            <div className={`flex justify-between items-end transition-opacity duration-300 ${selectedComplaint ? 'opacity-50 blur-sm pointer-events-none' : ''}`}>
                <div>
                    <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                        Admin Dashboard {loading && <Loader2 className="animate-spin text-[var(--c-emerald)]" size={24} />}
                    </h1>
                    <p className="text-[var(--c-gray-400)]">Madurai City Corporation Live Overview</p>
                </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-opacity duration-300 ${selectedComplaint ? 'opacity-50 blur-sm pointer-events-none' : ''}`}>
                <AdminKPICard loading={loading} title="Total Citizens" value={stats.citizens.toString()} trend="+2% this month" icon={Users} colorClass="bg-blue-500/10 text-blue-500" />
                <AdminKPICard loading={loading} title="Complaints Today" value={stats.todayComplaints.toString()} trend={stats.todayComplaints > 10 ? '+5% from avg' : '-12% from avg'} icon={AlertTriangle} colorClass="bg-yellow-500/10 text-yellow-500" />
                <AdminKPICard loading={loading} title="Resolved Rate" value={`${stats.resolvedRate}%`} trend="+2% from yesterday" icon={CheckCircle} colorClass="bg-[var(--c-emerald)]/10 text-[var(--c-emerald)]" />
                <AdminKPICard loading={false} title="Avg. Resolution" value={stats.avgResolution} trend="-0.5 hrs" icon={Clock} colorClass="bg-purple-500/10 text-purple-500" />
            </div>

            <div className={`grid lg:grid-cols-3 gap-8 transition-opacity duration-300 ${selectedComplaint ? 'opacity-50 blur-sm pointer-events-none' : ''}`}>
                <div className="lg:col-span-2">
                    <GlassCard className="p-6 h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Live Pipeline
                            </h2>
                            <Button variant="ghost" className="text-sm" onClick={fetchDashboardData}>Refresh</Button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[var(--glass-border)] text-[var(--c-gray-400)] text-sm">
                                        <th className="pb-4 font-medium px-2">ID</th>
                                        <th className="pb-4 font-medium px-2">Type</th>
                                        <th className="pb-4 font-medium px-2">Ward</th>
                                        <th className="pb-4 font-medium px-2">Status</th>
                                        <th className="pb-4 font-medium px-2 text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {complaints.map(c => (
                                        <tr
                                            key={c.id}
                                            onClick={() => { setSelectedComplaint(c); setDispatchStatus(c.status === 'pending' ? 'dispatched' : c.status); setAssignedLcv(c.assigned_lcv || ''); }}
                                            className="border-b border-[var(--glass-border)] hover:bg-white/10 transition-colors cursor-pointer group"
                                        >
                                            <td className="py-4 px-2 font-medium text-[var(--c-emerald)] group-hover:text-emerald-400 transition-colors">{c.tracking_id || c.id.substring(0, 8)}</td>
                                            <td className="py-4 px-2 capitalize">{c.type ? c.type.replace('_', ' ') : 'General'}</td>
                                            <td className="py-4 px-2 text-[var(--c-gray-300)]">Ward {c.ward_id || '--'}</td>
                                            <td className="py-4 px-2"><Badge type="status" value={c.status}>{c.status}</Badge></td>
                                            <td className="py-4 px-2 text-right text-[var(--c-gray-400)]">
                                                {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {!loading && complaints.length === 0 && (
                                <div className="text-center py-12 text-[var(--c-gray-400)]">
                                    <CheckCircle size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>Inbox zero. No recent complaints.</p>
                                </div>
                            )}
                            {loading && (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="animate-spin text-[var(--c-emerald)]" size={32} />
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <GlassCard className="p-6">
                        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            {/* Generate Report */}
                            <div
                                className="p-4 rounded-xl border border-[var(--glass-border)] bg-white/5 flex items-center justify-between hover:border-[var(--c-emerald)] transition-colors cursor-pointer group"
                                onClick={handleGenerateReport}
                            >
                                <div>
                                    <h4 className="font-medium group-hover:text-[var(--c-emerald)] transition-colors">Generate Report</h4>
                                    <p className="text-xs text-[var(--c-gray-400)]">Download all complaints as CSV</p>
                                </div>
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                    <FileDown size={18} />
                                </div>
                            </div>

                            {/* Map View */}
                            <div
                                className="p-4 rounded-xl border border-[var(--glass-border)] bg-white/5 flex items-center justify-between hover:border-[var(--c-emerald)] transition-colors cursor-pointer group"
                                onClick={() => navigate('/admin/live-map')}
                            >
                                <div>
                                    <h4 className="font-medium group-hover:text-[var(--c-emerald)] transition-colors">Live Map</h4>
                                    <p className="text-xs text-[var(--c-gray-400)]">Open full screen ward map</p>
                                </div>
                                <div className="p-2 rounded-lg bg-[var(--c-emerald)]/10 text-[var(--c-emerald)]">
                                    <Map size={18} />
                                </div>
                            </div>

                            {/* Send Broadcast */}
                            <div
                                className="p-4 rounded-xl border border-[var(--glass-border)] bg-white/5 flex items-center justify-between hover:border-[var(--c-emerald)] transition-colors cursor-pointer group"
                                onClick={handleBroadcast}
                            >
                                <div>
                                    <h4 className="font-medium group-hover:text-[var(--c-emerald)] transition-colors">Send Broadcast</h4>
                                    <p className="text-xs text-[var(--c-gray-400)]">Notify all councillors</p>
                                </div>
                                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                    <Bell size={18} />
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Pending Review — Stacked Cards (ward-filtered) */}
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <AlertTriangle size={18} className="text-yellow-400" /> Pending Review
                            </h2>
                            {myWardId && (
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--c-emerald)] bg-[var(--c-emerald)]/10 px-2 py-1 rounded-full">
                                    <MapPin size={10} /> Ward {myWardId}
                                </span>
                            )}
                        </div>
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                            {(() => {
                                const myPending = complaints.filter(c =>
                                    c.status === 'pending' && (!myWardId || c.ward_id === myWardId)
                                );
                                if (myPending.length === 0) {
                                    return (
                                        <div className="text-center py-6 text-[var(--c-gray-400)] text-sm">
                                            <CheckCircle size={28} className="mx-auto mb-2 opacity-30" />
                                            No pending complaints{myWardId ? ` in Ward ${myWardId}` : ''}
                                        </div>
                                    );
                                }
                                return myPending.map(c => (
                                    <div
                                        key={c.id}
                                        onClick={() => { setSelectedComplaint(c); setDispatchStatus('dispatched'); setAssignedLcv(c.assigned_lcv || ''); }}
                                        className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-yellow-400">{c.tracking_id || c.id.substring(0, 8)}</span>
                                                    <Badge type="priority" value={c.priority}>{c.priority}</Badge>
                                                </div>
                                                <p className="text-xs capitalize text-[var(--c-gray-300)] mt-1">{c.type?.replace('_', ' ')}</p>
                                                <p className="text-[10px] text-[var(--c-gray-400)] mt-1 line-clamp-1">{c.description || 'No description'}</p>
                                            </div>
                                            <span className="text-[10px] text-[var(--c-gray-400)] whitespace-nowrap mt-0.5">
                                                {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex justify-end">
                                            <span className="text-[10px] font-semibold text-[var(--c-emerald)] group-hover:text-emerald-300 transition-colors">Click to review →</span>
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
