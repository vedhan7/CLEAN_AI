import React, { useState, useEffect } from 'react';
import { Navigation, CheckSquare, Camera, Check, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export default function WorkerApp() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hardcoded mock data for an LCV driver
  const worker = {
    name: "Muthu K.",
    lcv: "TN-59-AB-1234",
    ward: "Ward 41",
    ward_id: 41
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('ward_id', worker.ward_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch {
      toast.error('Could not sync with dispatch server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleResolve = async (id) => {
    const confirmToast = toast.loading('Marking as resolved on-chain...');
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status: 'resolved' })
        .eq('id', id);

      if (error) throw error;

      toast.success('Complaint officially closed.', { id: confirmToast });

      // Fast optimistic UI update instead of re-fetching
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
    } catch {
      toast.error('Failed to close ticket.', { id: confirmToast });
    }
  };

  return (
    <div style={{ paddingTop: '80px', paddingBottom: '80px', minHeight: '100vh', background: 'var(--c-midnight)' }}>
      {/* Mobile-first Header */}
      <div style={{ background: 'rgba(0,0,0,0.5)', padding: '16px', position: 'sticky', top: '80px', zIndex: 10, backdropFilter: 'var(--glass-blur)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{worker.name}</h2>
            <p style={{ color: 'var(--c-emerald)', fontSize: '0.85rem', fontWeight: 'bold' }}>● Active Duty | {worker.lcv}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'var(--c-midnight-light)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
              <strong>{worker.ward}</strong>
            </div>
            <button title="Log Out / End Shift" onClick={() => supabase.auth.signOut()} style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', color: '#ff3333', padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 'var(--space-md)' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-xl)' }}>
            <Loader2 className="animate-spin" size={32} color="var(--c-emerald)" />
          </div>
        ) : activeTab === 'tasks' ? (
          <div className="animate-fade-in-up">
            <h3 style={{ marginBottom: '16px', color: 'var(--c-gray-400)' }}>Current Dispatches ({tasks.filter(t => t.status !== 'resolved').length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {tasks.filter(t => t.status !== 'resolved').length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--c-gray-400)', padding: 'var(--space-md)' }}>No active dispatches right now.</div>
              )}
              {tasks.filter(t => t.status !== 'resolved').map(task => (
                <div key={task.id} className="glass-card" style={{ borderLeft: task.priority === 'high' || task.priority === 'critical' ? '4px solid #ffb703' : '4px solid var(--c-emerald)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--c-gray-400)', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>{task.id.split('-')[0]}...</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: task.priority === 'high' || task.priority === 'critical' ? '#ff3333' : 'var(--c-emerald)' }}>{task.priority?.toUpperCase() || 'HIGH'}</span>
                  </div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem' }}>{task.issue_type.replace('_', ' ')}</h3>
                  <p style={{ color: 'var(--c-gray-400)', fontSize: '0.9rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Navigation size={14} /> Lat: {task.lat.toFixed(4)}, Lng: {task.lng.toFixed(4)}
                  </p>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleResolve(task.id)} className="btn-primary" style={{ flex: 1, padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <Check size={18} /> Resolve
                    </button>
                    <button style={{ background: 'var(--c-midnight-light)', border: '1px solid var(--glass-border)', color: 'white', padding: '12px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Camera size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <h3 style={{ marginBottom: '16px', color: 'var(--c-gray-400)' }}>History (Resolved)</h3>
            {tasks.filter(t => t.status === 'resolved').length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--c-gray-400)', padding: 'var(--space-md)' }}>No completed tasks yet.</div>
            )}
            {tasks.filter(t => t.status === 'resolved').map(task => (
              <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--c-midnight-light)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', marginBottom: '8px' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{task.issue_type.replace('_', ' ')}</h4>
                  <p style={{ color: 'var(--c-gray-400)', fontSize: '0.85rem', margin: '4px 0 0 0', fontFamily: 'monospace' }}>{task.id}</p>
                </div>
                <div style={{ color: 'var(--c-emerald)' }}><CheckCircle size={24} /></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Mobile Navbar */}
      <div style={{ position: 'fixed', bottom: 0, width: '100%', display: 'flex', background: 'var(--c-midnight-light)', borderTop: '1px solid var(--glass-border)', zIndex: 10 }}>
        <button
          onClick={() => setActiveTab('tasks')}
          style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: activeTab === 'tasks' ? 'var(--c-emerald)' : 'var(--c-gray-400)', borderTop: activeTab === 'tasks' ? '2px solid var(--c-emerald)' : '2px solid transparent' }}
        >
          <Clock size={20} /> <span style={{ fontSize: '0.8rem' }}>Pending</span>
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: activeTab === 'completed' ? 'var(--c-emerald)' : 'var(--c-gray-400)', borderTop: activeTab === 'completed' ? '2px solid var(--c-emerald)' : '2px solid transparent' }}
        >
          <CheckSquare size={20} /> <span style={{ fontSize: '0.8rem' }}>Resolved</span>
        </button>
      </div>
    </div>
  );
}

// Inline Mock CheckCircle since it was missed in imports above
function CheckCircle({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
