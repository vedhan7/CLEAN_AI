import React, { useState } from 'react';
import { Sliders, Award, ArrowUpRight } from 'lucide-react';

export default function Simulator() {
  const [metrics, setMetrics] = useState({
    door_collection: 37,
    segregation: 26,
    processing: 4,
    remediation: 25
  });

  // Simplified Swachh Survekshan Score Logic (Madurai currently at ~4823 rank)
  // Max possible score is conceptually 100 for this simulation UI
  const calculateScore = () => {
    return Math.round(
      (metrics.door_collection * 0.4) +
      (metrics.segregation * 0.3) +
      (metrics.processing * 0.2) +
      (metrics.remediation * 0.1)
    );
  };

  const currentScore = calculateScore();
  const projectedRank = currentScore > 90 ? "Top 10" : currentScore > 75 ? "Top 100" : currentScore > 50 ? "Top 500" : "4,823";

  return (
    <div className="container" style={{ paddingTop: '100px', maxWidth: '800px' }}>
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <h1 className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Sliders color="var(--c-emerald)" /> Swachh Impact Simulator
        </h1>
        <p className="animate-fade-in-up delay-100" style={{ color: 'var(--c-gray-400)' }}>
          Adjust the key performance indicators below to see what it takes for Madurai to break into the Top 10 cleanest cities in India.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-md)' }}>

        {/* Sliders Panel */}
        <div className="glass-card animate-fade-in-up delay-200" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: 600 }}>Door-to-Door Collection</label>
              <span style={{ color: 'var(--c-emerald)', fontWeight: 'bold' }}>{metrics.door_collection}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={metrics.door_collection}
              onChange={(e) => setMetrics({ ...metrics, door_collection: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--c-emerald)' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: 600 }}>Source Segregation</label>
              <span style={{ color: 'var(--c-emerald)', fontWeight: 'bold' }}>{metrics.segregation}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={metrics.segregation}
              onChange={(e) => setMetrics({ ...metrics, segregation: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--c-emerald)' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: 600 }}>Scientific Waste Processing</label>
              <span style={{ color: 'var(--c-emerald)', fontWeight: 'bold' }}>{metrics.processing}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={metrics.processing}
              onChange={(e) => setMetrics({ ...metrics, processing: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--c-emerald)' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: 600 }}>Dumpsite Remediation</label>
              <span style={{ color: 'var(--c-emerald)', fontWeight: 'bold' }}>{metrics.remediation}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={metrics.remediation}
              onChange={(e) => setMetrics({ ...metrics, remediation: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--c-emerald)' }}
            />
          </div>
        </div>

        {/* Results Panel */}
        <div className="glass-card animate-fade-in-up delay-300" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'var(--c-midnight)' }}>
          <Award size={48} color={currentScore > 75 ? "var(--c-emerald)" : "var(--c-saffron)"} style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--c-gray-400)' }}>Projected Rank</h2>
          <h1 style={{ fontSize: '4rem', color: currentScore > 75 ? 'var(--c-emerald)' : 'var(--c-white)', margin: 0 }}>
            {projectedRank}
          </h1>

          <div style={{ marginTop: 'var(--space-md)', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', width: '100%' }}>
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 600 }}>
              <ArrowUpRight color="var(--c-emerald)" /> {currentScore}/100 Score
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
