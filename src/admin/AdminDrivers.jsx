import React, { useState, useEffect } from 'react';
import { Loader2, Truck, Plus, Trash2, Edit2, X, Save } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AdminDrivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', vehicle_number: '', ward_id: '', status: 'available' });
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchDrivers(); }, []);

    const fetchDrivers = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('lcv_drivers').select('*').order('name');
        if (error) toast.error(error.message);
        setDrivers(data || []);
        setLoading(false);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!form.name || !form.vehicle_number) { toast.error('Name and Vehicle Number are required'); return; }
        setSaving(true);
        const { error } = await supabase.from('lcv_drivers').insert([{
            name: form.name,
            phone: form.phone,
            vehicle_number: form.vehicle_number,
            ward_id: form.ward_id ? parseInt(form.ward_id) : null,
            status: form.status
        }]);
        if (error) toast.error(error.message);
        else { toast.success('Driver added!'); setShowAdd(false); setForm({ name: '', phone: '', vehicle_number: '', ward_id: '', status: 'available' }); fetchDrivers(); }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this driver?')) return;
        const { error } = await supabase.from('lcv_drivers').delete().eq('id', id);
        if (error) toast.error(error.message);
        else { toast.success('Driver removed'); fetchDrivers(); }
    };

    const toggleStatus = async (driver) => {
        const newStatus = driver.status === 'available' ? 'off_duty' : 'available';
        const { error } = await supabase.from('lcv_drivers').update({ status: newStatus }).eq('id', driver.id);
        if (error) toast.error(error.message);
        else fetchDrivers();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-display font-bold">LCV Drivers</h1>
                <Button onClick={() => setShowAdd(!showAdd)} className="gap-2">
                    {showAdd ? <X size={16} /> : <Plus size={16} />} {showAdd ? 'Cancel' : 'Add Driver'}
                </Button>
            </div>

            {showAdd && (
                <GlassCard className="p-6 animate-in slide-in-from-top duration-200">
                    <h3 className="font-medium mb-4 text-[var(--c-emerald)]">New LCV Driver</h3>
                    <form onSubmit={handleAdd} className="grid md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Driver Name *" className="bg-[var(--c-midnight)] border border-[var(--glass-border)] rounded px-3 py-2 text-sm text-white" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        <input type="text" placeholder="Phone Number" className="bg-[var(--c-midnight)] border border-[var(--glass-border)] rounded px-3 py-2 text-sm text-white" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        <input type="text" placeholder="Vehicle Number * (e.g. TN-59-AB-1234)" className="bg-[var(--c-midnight)] border border-[var(--glass-border)] rounded px-3 py-2 text-sm text-white" value={form.vehicle_number} onChange={e => setForm({ ...form, vehicle_number: e.target.value })} />
                        <input type="number" placeholder="Assigned Ward ID" className="bg-[var(--c-midnight)] border border-[var(--glass-border)] rounded px-3 py-2 text-sm text-white" value={form.ward_id} onChange={e => setForm({ ...form, ward_id: e.target.value })} />
                        <div className="md:col-span-2">
                            <Button type="submit" className="w-full" disabled={saving}>
                                {saving ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Add Driver'}
                            </Button>
                        </div>
                    </form>
                </GlassCard>
            )}

            <GlassCard className="p-0 overflow-hidden">
                <table className="w-full text-left">
                    <thead><tr className="border-b border-[var(--glass-border)] text-[var(--c-gray-400)] text-xs uppercase">
                        <th className="p-4">Name</th><th className="p-4">Vehicle</th><th className="p-4">Phone</th><th className="p-4">Ward</th><th className="p-4">Status</th><th className="p-4">Actions</th>
                    </tr></thead>
                    <tbody className="text-sm">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-12"><Loader2 className="animate-spin mx-auto text-[var(--c-emerald)]" size={28} /></td></tr>
                        ) : drivers.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-12 text-[var(--c-gray-400)]">
                                <Truck size={40} className="mx-auto mb-3 opacity-30" />No drivers registered yet.
                            </td></tr>
                        ) : drivers.map(d => (
                            <tr key={d.id} className="border-b border-[var(--glass-border)] hover:bg-white/5">
                                <td className="p-4 font-medium">{d.name}</td>
                                <td className="p-4 text-[var(--c-emerald)] font-mono text-xs">{d.vehicle_number}</td>
                                <td className="p-4 text-[var(--c-gray-300)]">{d.phone || '--'}</td>
                                <td className="p-4">{d.ward_id ? `Ward ${d.ward_id}` : '--'}</td>
                                <td className="p-4">
                                    <button onClick={() => toggleStatus(d)} className={`px-3 py-1 rounded-full text-xs font-medium ${d.status === 'available' ? 'bg-[var(--c-emerald)]/20 text-[var(--c-emerald)]' : d.status === 'dispatched' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {d.status}
                                    </button>
                                </td>
                                <td className="p-4">
                                    <button onClick={() => handleDelete(d.id)} className="p-2 hover:bg-red-500/20 rounded text-red-400"><Trash2 size={14} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </GlassCard>
        </div>
    );
};

export default AdminDrivers;
