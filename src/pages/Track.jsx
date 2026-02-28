import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, Truck, ShieldAlert, Search, Loader2 } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const Track = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchId, setSearchId] = useState(searchParams.get('id') || '');
    const [complaint, setComplaint] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(!!searchParams.get('id'));

    useEffect(() => {
        if (searchParams.get('id')) {
            fetchComplaint(searchParams.get('id'));
        }
    }, [searchParams]);

    const fetchComplaint = async (idToSearch) => {
        setLoading(true);
        setHasSearched(true);
        try {
            // Search either by tracking_id (CM-0001) or uuid
            const isUuid = idToSearch.length > 20;
            const queryColumn = isUuid ? 'id' : 'tracking_id';

            const { data, error } = await supabase
                .from('complaints')
                .select('*')
                .eq(queryColumn, idToSearch.trim().toUpperCase())
                .single();

            if (error) throw error;
            setComplaint(data);

            // Fetch timeline (mocking dynamic timeline based on status if no real timeline table entries exist yet)
            // For a robust system, we would fetch from public.complaint_timeline
            const { data: timelineData, error: timelineErr } = await supabase
                .from('complaint_timeline')
                .select('*')
                .eq('complaint_id', data.id)
                .order('created_at', { ascending: true });

            if (timelineData && timelineData.length > 0) {
                setTimeline(timelineData);
            } else {
                // Fallback synthetic timeline based on current status
                const syntheticTimeline = generateSyntheticTimeline(data);
                setTimeline(syntheticTimeline);
            }

        } catch (error) {
            console.error(error);
            setComplaint(null);
            if (error.code === 'PGRST116') {
                toast.error("Complaint not found. Check the ID and try again.");
            } else {
                toast.error("Error fetching complaint details.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchId.trim()) return;
        setSearchParams({ id: searchId.trim() });
    };

    const generateSyntheticTimeline = (data) => {
        const t = [];
        t.push({ id: 't1', status: 'pending', message: 'Complaint filed and recorded.', created_at: data.created_at, icon: Clock, color: 'text-yellow-500', done: true });

        if (['assigned', 'dispatched', 'in_progress', 'resolved'].includes(data.status)) {
            t.push({ id: 't2', status: 'dispatched', message: data.assigned_lcv ? `LCV ${data.assigned_lcv} assigned.` : 'Assigned to sanitation team.', created_at: data.updated_at, icon: Truck, color: 'text-blue-500', done: true });
        } else {
            t.push({ id: 't2', status: 'dispatched', message: 'Awaiting team assignment.', created_at: null, icon: Truck, color: 'text-gray-500', done: false });
        }

        if (data.status === 'resolved') {
            t.push({ id: 't3', status: 'resolved', message: 'Issue marked as resolved.', created_at: data.resolved_at || data.updated_at, icon: CheckCircle2, color: 'text-[var(--c-emerald)]', done: true });
        } else {
            t.push({ id: 't3', status: 'resolved', message: 'Pending resolution.', created_at: null, icon: CheckCircle2, color: 'text-gray-500', done: false });
        }
        return t;
    };


    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="mb-8 text-center md:text-left">
                <h1 className="font-display font-bold text-4xl mb-2">Track Complaint</h1>
                <p className="text-[var(--c-gray-400)]">Real-time status of your report</p>
            </div>

            <GlassCard className="p-6 mb-8 max-w-xl mx-auto md:mx-0">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Enter Tracking ID (e.g. CM-0001)"
                        className="flex-1 bg-[var(--c-midnight)] border border-[var(--glass-border)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--c-emerald)]"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                    </Button>
                </form>
            </GlassCard>

            {loading && <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[var(--c-emerald)]" size={40} /></div>}

            {!loading && hasSearched && !complaint && (
                <div className="text-center py-12 text-[var(--c-gray-400)]">
                    <ShieldAlert size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No complaint found with that ID.</p>
                </div>
            )}

            {!loading && complaint && (
                <div className="grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="md:col-span-1">
                        <GlassCard className="p-6">
                            <h3 className="text-[var(--c-gray-400)] text-sm font-medium mb-1">Tracking ID</h3>
                            <p className="text-xl font-bold font-display mb-6 text-[var(--c-emerald)]">{complaint.tracking_id || complaint.id.substring(0, 8)}</p>

                            <h3 className="text-[var(--c-gray-400)] text-sm font-medium mb-1">Issue Type</h3>
                            <p className="font-medium mb-6 capitalize">{complaint.type.replace('_', ' ')}</p>

                            <h3 className="text-[var(--c-gray-400)] text-sm font-medium mb-1">Priority</h3>
                            <div className="mb-6"><Badge type="priority" value={complaint.priority}>{complaint.priority}</Badge></div>

                            <h3 className="text-[var(--c-gray-400)] text-sm font-medium mb-1">Ward</h3>
                            <p className="font-medium mb-6">Ward {complaint.ward_id || 'Unknown'}</p>

                            <h3 className="text-[var(--c-gray-400)] text-sm font-medium mb-1">Location Details</h3>
                            <p className="text-sm">{complaint.description || `Lat: ${complaint.latitude?.toFixed(4)}, Lng: ${complaint.longitude?.toFixed(4)}`}</p>

                            {complaint.photo_urls && complaint.photo_urls.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-[var(--c-gray-400)] text-sm font-medium mb-2">Attached Photo</h3>
                                    <img src={complaint.photo_urls[0]} alt="Complaint" className="w-full h-32 object-cover rounded-lg border border-[var(--glass-border)]" />
                                </div>
                            )}
                        </GlassCard>
                    </div>

                    <div className="md:col-span-2">
                        <GlassCard className="p-8 h-full">
                            <h2 className="text-2xl font-display font-bold mb-8 flex justify-between items-center">
                                Status Timeline
                                <Badge type="status" value={complaint.status}>{complaint.status}</Badge>
                            </h2>

                            <div className="space-y-8 relative">
                                {/* Vertical line connecting timeline dots */}
                                <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-[var(--glass-border)] z-0" />

                                {timeline.map((item, idx) => {
                                    const Icon = item.icon || Clock;
                                    return (
                                        <div key={item.id} className={`flex gap-6 relative z-10 ${item.done ? 'opacity-100' : 'opacity-40'}`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.done ? 'bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-lg' : 'bg-[var(--c-midnight-lighter)] border border-transparent'} ${item.color || 'text-[var(--c-emerald)]'}`}>
                                                <Icon size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-medium capitalize mb-1">{item.status}</h4>
                                                <p className="text-[var(--c-gray-300)] text-sm mb-1">{item.message}</p>
                                                <span className="text-[var(--c-gray-500)] text-xs">
                                                    {item.created_at ? new Date(item.created_at).toLocaleString() : 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Track;
