import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, TrendingUp, AlertTriangle } from 'lucide-react';
import WardMap from '../components/WardMap';

export default function Landing() {
  return (
    <div style={{ paddingTop: '80px' }}>
      <header className="container animate-fade-in-up" style={{ padding: 'var(--space-lg) var(--space-sm)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', color: 'var(--c-emerald)', marginBottom: 'var(--space-sm)' }}>
          CleanMadurai.AI
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--c-gray-400)', maxWidth: '600px', margin: '0 auto', marginBottom: 'var(--space-md)' }}>
          Real-time accountability and AI coordination to transform Madurai's waste management and reach the Top 10 Swachh Survekshan list.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center' }}>
          <Link to="/report" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
            <AlertTriangle size={20} /> Report Issue
          </Link>
          <Link to="/leaderboard" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
            <TrendingUp size={20} /> View Leaderboard
          </Link>
        </div>
      </header>

      <section className="container delay-100 animate-fade-in-up" style={{ padding: 'var(--space-md) var(--space-sm)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <div style={{ background: 'rgba(0, 214, 143, 0.1)', padding: '16px', borderRadius: '50%', color: 'var(--c-emerald)' }}>
              <ShieldCheck size={32} />
            </div>
            <div>
              <p style={{ color: 'var(--c-gray-400)', fontSize: '0.9rem' }}>Active Wards</p>
              <h3 style={{ fontSize: '2rem' }}>100</h3>
            </div>
          </div>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <div style={{ background: 'rgba(255, 107, 53, 0.1)', padding: '16px', borderRadius: '50%', color: 'var(--c-saffron)' }}>
              <Truck size={32} />
            </div>
            <div>
              <p style={{ color: 'var(--c-gray-400)', fontSize: '0.9rem' }}>LCVs Deployed</p>
              <h3 style={{ fontSize: '2rem' }}>240</h3>
            </div>
          </div>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '16px', borderRadius: '50%' }}>
              <TrendingUp size={32} />
            </div>
            <div>
              <p style={{ color: 'var(--c-gray-400)', fontSize: '0.9rem' }}>Issues Resolved (24h)</p>
              <h3 style={{ fontSize: '2rem' }}>1,204</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="delay-200 animate-fade-in-up">
        <div className="container" style={{ marginBottom: 'var(--space-sm)' }}>
          <h2>Live Ward Map</h2>
          <p style={{ color: 'var(--c-gray-400)' }}>Select a ward to view real-time cleanliness metrics and active complaints.</p>
        </div>
        <div style={{ width: '100%', height: '500px', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
          <WardMap height="500px" />
        </div>
      </section>
    </div>
  );
}
