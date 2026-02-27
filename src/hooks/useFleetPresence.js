import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Custom Hook: useFleetPresence
 * Utilizes Supabase Realtime 'Presence' to track live LCV Worker coordinates.
 * This satisfies Phase 4's zero-cost fleet tracking requirement without MQTT.
 * 
 * @param {string} roomName - The tracking room identifier (e.g., 'madurai_lcv_fleet')
 * @param {object} initialLocation - Optional local location state {"lat": 9.9, "lng": 78.1}
 */
export function useFleetPresence(roomName = 'madurai_lcv_fleet', initialLocation = null) {
    const [activeWorkers, setActiveWorkers] = useState({});
    const [status, setStatus] = useState('connecting');

    useEffect(() => {
        // 1. Create a Presence Room Channel
        const channel = supabase.channel(roomName, {
            config: {
                presence: {
                    key: 'worker_' + Math.random().toString(36).substr(2, 9),
                },
            },
        });

        // 2. Listen for State Syncs (When others join/move/leave, this triggers)
        channel.on('presence', { event: 'sync' }, () => {
            const newState = channel.presenceState();
            setActiveWorkers(newState);
        });

        // 3. Subscribe to the channel
        channel.subscribe(async (status) => {
            setStatus(status);
            if (status === 'SUBSCRIBED' && initialLocation) {
                // If this client is a worker, broadcast their initial location immediately
                await channel.track({
                    location: initialLocation,
                    timestamp: new Date().toISOString(),
                    status: 'on_duty'
                });
            }
        });

        // Cleanup subscription on unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomName, initialLocation]);

    return { activeWorkers, status };
}
