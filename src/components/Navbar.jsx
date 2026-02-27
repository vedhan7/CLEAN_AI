import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, LogOut } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav style={{ padding: 'var(--space-sm) var(--space-md)', background: 'var(--c-midnight)', borderBottom: '1px solid var(--glass-border)', position: 'fixed', top: 0, width: '100%', zIndex: 50, backdropFilter: 'var(--glass-blur)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--c-emerald)', fontWeight: 700, fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>
          <Trash2 /> CleanMadurai.AI
        </Link>
        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
          <Link to="/track">Track Status</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/report" className="btn-primary">Report Issue</Link>
          {user && (
            <button
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--c-gray-400)', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s ease' }}
              onMouseOver={(e) => { e.currentTarget.style.color = '#ff3333'; e.currentTarget.style.borderColor = '#ff3333'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = 'var(--c-gray-400)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
            >
              <LogOut size={16} /> Log Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
