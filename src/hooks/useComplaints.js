import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useComplaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch initial data
    useEffect(() => {
        fetchComplaints();

        // Subscribe to realtime updates
        const channel = supabase
            .channel('public:complaints')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setComplaints((prev) => [payload.new, ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    setComplaints((prev) => prev.map(c => c.id === payload.new.id ? payload.new : c));
                } else if (payload.eventType === 'DELETE') {
                    setComplaints((prev) => prev.filter(c => c.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchComplaints = async () => {
        try {
            const { data, error } = await supabase
                .from('complaints')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setComplaints(data);
        } catch (error) {
            console.error('Error fetching complaints:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const dispatchComplaint = async (id, lcvDriver) => {
        try {
            const { error } = await supabase
                .from('complaints')
                .update({ status: 'dispatched', assigned_lcv: lcvDriver })
                .eq('id', id);

            if (error) throw error;

            // Auto create a timeline entry (simulate edge function or DB trigger behavior here for UI consistency)
            await supabase.from('complaint_timeline').insert({
                complaint_id: id,
                status: 'dispatched',
                message: `LCV Driver ${lcvDriver} dispatched.`,
            });

            return true;
        } catch (error) {
            console.error('Error dispatching:', error.message);
            return false;
        }
    };

    return { complaints, loading, dispatchComplaint };
}
