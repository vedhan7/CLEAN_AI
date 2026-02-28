import React, { useState, useEffect } from 'react';
import { Loader2, Users, Shield, User, Search } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { fetchProfiles(); }, []);

    const fetchProfiles = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (error) toast.error(error.message);
        setProfiles(data || []);
        setLoading(false);
    };

    const toggleRole = async (profile) => {
        const newRole = profile.role === 'admin_councillor' ? 'citizen' : 'admin_councillor';
        if (!confirm(`Change ${profile.display_name || profile.email}'s role to ${newRole}?`)) return;
        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', profile.id);
        if (error) toast.error(error.message);
        else { toast.success(`Role updated to ${newRole}`); fetchProfiles(); }
    };

    const filtered = profiles.filter(p =>
        !search ||
        (p.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.display_name || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-2xl font-display font-bold">Registered Citizens</h1>

            <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-gray-400)]" />
                    <input type="text" placeholder="Search by name or email..." className="w-full bg-white/5 border border-[var(--glass-border)] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--c-emerald)]" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <GlassCard className="px-4 py-2 flex items-center gap-2">
                    <Users size={16} className="text-[var(--c-emerald)]" />
                    <span className="font-bold">{profiles.length}</span>
                    <span className="text-[var(--c-gray-400)] text-sm">total</span>
                </GlassCard>
            </div>

            <GlassCard className="p-0 overflow-hidden">
                <table className="w-full text-left">
                    <thead><tr className="border-b border-[var(--glass-border)] text-[var(--c-gray-400)] text-xs uppercase">
                        <th className="p-4">User</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Ward</th><th className="p-4">Joined</th><th className="p-4">Actions</th>
                    </tr></thead>
                    <tbody className="text-sm">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-12"><Loader2 className="animate-spin mx-auto text-[var(--c-emerald)]" size={28} /></td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-12 text-[var(--c-gray-400)]">No users found.</td></tr>
                        ) : filtered.map(p => (
                            <tr key={p.id} className="border-b border-[var(--glass-border)] hover:bg-white/5">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${p.role === 'admin_councillor' ? 'bg-[var(--c-emerald)]/20 text-[var(--c-emerald)]' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {p.role === 'admin_councillor' ? <Shield size={14} /> : <User size={14} />}
                                        </div>
                                        <span className="font-medium">{p.display_name || 'Anonymous'}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-[var(--c-gray-300)]">{p.email}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.role === 'admin_councillor' ? 'bg-[var(--c-emerald)]/20 text-[var(--c-emerald)]' : 'bg-blue-500/20 text-blue-400'}`}>
                                        {p.role === 'admin_councillor' ? 'Admin' : 'Citizen'}
                                    </span>
                                </td>
                                <td className="p-4">{p.ward_id ? `Ward ${p.ward_id}` : '--'}</td>
                                <td className="p-4 text-[var(--c-gray-400)]">{new Date(p.created_at).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <button onClick={() => toggleRole(p)} className="text-xs px-3 py-1.5 rounded border border-[var(--glass-border)] hover:border-[var(--c-emerald)] hover:text-[var(--c-emerald)] transition-colors">
                                        {p.role === 'admin_councillor' ? 'Demote' : 'Promote'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </GlassCard>
        </div>
    );
};

export default AdminUsers;
