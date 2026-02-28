import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, MapPin, Clock, CheckCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!user) return;

        fetchNotifications();

        // Real-time subscription for new notifications
        const subscription = supabase
            .channel('notifications:' + user.id)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, () => {
                fetchNotifications();
            })
            .subscribe();

        return () => supabase.removeChannel(subscription);
    }, [user]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (!error && data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        }
        setLoading(false);
    };

    const markAsRead = async (id) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllRead = async () => {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    const handleClick = (notif) => {
        markAsRead(notif.id);
        setIsOpen(false);
        if (notif.complaint_id) {
            navigate('/admin/complaints');
        }
    };

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 glass-panel rounded-xl border border-[var(--glass-border)] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="p-4 border-b border-[var(--glass-border)] flex justify-between items-center bg-white/5">
                        <h3 className="font-bold text-sm">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="text-xs text-[var(--c-emerald)] hover:underline flex items-center gap-1">
                                    <CheckCheck size={12} /> Mark all read
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded">
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-[var(--c-gray-400)] text-sm">
                                <Bell size={32} className="mx-auto mb-3 opacity-30" />
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => handleClick(n)}
                                    className={`p-4 border-b border-[var(--glass-border)] hover:bg-white/5 cursor-pointer transition-colors ${!n.is_read ? 'bg-[var(--c-emerald)]/5 border-l-2 border-l-[var(--c-emerald)]' : ''}`}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${!n.is_read ? 'text-white' : 'text-[var(--c-gray-300)]'}`}>
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-[var(--c-gray-400)] mt-1 line-clamp-2">{n.message}</p>
                                            <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--c-gray-400)]">
                                                <span className="flex items-center gap-1"><Clock size={10} /> {timeAgo(n.created_at)}</span>
                                                {n.ward_id && <span className="flex items-center gap-1"><MapPin size={10} /> Ward {n.ward_id}</span>}
                                            </div>
                                        </div>
                                        {!n.is_read && (
                                            <span className="w-2 h-2 rounded-full bg-[var(--c-emerald)] mt-1.5 flex-shrink-0 shadow-[0_0_6px_var(--c-emerald)]"></span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
