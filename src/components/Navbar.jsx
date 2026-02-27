import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

export default function Navbar() {
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
        </div>
      </div>
    </nav>
  );
}
