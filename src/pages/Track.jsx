import React, { useState } from 'react';
import { Search, MapPin, Truck, CheckCircle, Clock, Loader2, Compass } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export default function Track() {
  const [search, setSearch] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;

    setIsSearching(true);
    setComplaint(null);
    const loadingToast = toast.loading('Searching municipal database...');

    try {
      // Execute live DB zero-cost querying!
      const { data, error } = await supabase
        .from('complaints')
        .select(`id, issue_type, status, created_at, priority, ward_id`)
        .eq('id', search.trim())
        .single();

      if (error) {
        throw new Error('Could not sequence that Tracking ID.');
      }

      setComplaint(data);
      toast.success('Complaint located.', { id: loadingToast });

    } catch (error) {
      toast.error(error.message || 'Invalid Tracking ID.', { id: loadingToast });
    } finally {
      setIsSearching(false);
    }
  };

  const getTimelineSteps = (status, dateString) => {
    // Generate derived timeline based on actual DB status
    const createdDate = new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return [
      { title: 'Complaint Registered', desc: 'Securely logged in system', time: createdDate, icon: <Clock size={20} />, done: true },
      { title: 'AI Priority Triage', desc: 'Assessed by Gemini Pro', time: createdDate, icon: <Search size={20} />, done: true },
      { title: 'Assigned to LCV', desc: 'Dispatched to nearest worker', time: 'Pending', icon: <Truck size={20} />, done: status === 'assigned' || status === 'resolved' },
      { title: 'Issue Resolved', desc: 'Closing inspection passed', time: 'Pending', icon: <CheckCircle size={20} />, done: status === 'resolved' }
    ];
  };

  return (
    <div className="container" style={{ paddingTop: '100px', maxWidth: '600px' }}>
      <h1 className="animate-fade-in-up" style={{ marginBottom: 'var(--space-sm)' }}>Track Complaint</h1>
      <p className="animate-fade-in-up delay-100" style={{ color: 'var(--c-gray-400)', marginBottom: 'var(--space-md)' }}>Enter your Tracking ID to see real-time DB status updates.</p>

      <form onSubmit={handleSearch} className="animate-fade-in-up delay-200" style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-lg)' }}>
        <input
          type="text"
          placeholder="e.g. dc8372bf-..."
          value={search}
          onChange={e => setSearch(e.target.value.toLowerCase())}
          style={{ flex: 1, padding: '16px', background: 'var(--c-midnight-light)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: 'var(--radius-sm)', outline: 'none', fontSize: '1.1rem', letterSpacing: '2px' }}
        />
        <button type="submit" disabled={isSearching} className="btn-primary" style={{ padding: '0 24px', opacity: isSearching ? 0.7 : 1 }}>
          {isSearching ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
        </button>
      </form>

      {complaint && (
        <div className="glass-card animate-fade-in-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={20} color="var(--c-emerald)" /> {complaint.issue_type.replace('_', ' ').toUpperCase()}
              </h2>
              <p style={{ color: 'var(--c-gray-400)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Ward {complaint.ward_id || 'Pending'} • Priority: <span style={{ color: complaint.priority === 'critical' ? '#ff3333' : complaint.priority === 'high' ? '#ffb703' : 'var(--c-emerald)' }}>{complaint.priority?.toUpperCase() || 'UNRATED'}</span></p>
            </div>
          </div>

          <h3 style={{ marginBottom: 'var(--space-md)' }}>Status Timeline: <span style={{ color: 'var(--c-emerald)', fontSize: '0.85rem' }}>{complaint.id}</span></h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {getTimelineSteps(complaint.status, complaint.created_at).map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', opacity: step.done ? 1 : 0.4 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: step.done ? 'var(--c-emerald)' : 'rgba(255,255,255,0.1)', color: step.done ? 'var(--c-midnight)' : 'var(--c-gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {step.icon}
                  </div>
                  {i < 3 && <div style={{ width: '2px', height: '40px', background: step.done ? 'var(--c-emerald)' : 'rgba(255,255,255,0.1)' }}></div>}
                </div>
                <div style={{ paddingTop: '8px' }}>
                  <h4 style={{ color: step.done ? 'var(--c-white)' : 'var(--c-gray-400)', marginBottom: '4px' }}>{step.title}</h4>
                  {step.desc && <p style={{ fontSize: '0.9rem', color: 'var(--c-gray-400)', marginBottom: '4px' }}>{step.desc}</p>}
                  <span style={{ fontSize: '0.8rem', color: 'var(--c-gray-400)' }}>{step.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
