import React, { useState } from 'react';
import { Target, TrendingUp, Trophy, ArrowRight } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

const Simulator = () => {
    const [metrics, setMetrics] = useState({
        doorToDoor: 37,
        segregation: 26,
        processing: 4,
        remediation: 25,
        publicToilets: 3,
    });

    const weights = {
        doorToDoor: 0.3,
        segregation: 0.25,
        processing: 0.2,
        remediation: 0.15,
        publicToilets: 0.1,
    };

    const currentScore = Math.round(
        (metrics.doorToDoor * weights.doorToDoor) +
        (metrics.segregation * weights.segregation) +
        (metrics.processing * weights.processing) +
        (metrics.remediation * weights.remediation) +
        (metrics.publicToilets * weights.publicToilets)
    );

    const nationalAverage = 65;
    const targetScore = 85;

    const handleSliderChange = (e) => {
        const { name, value } = e.target;
        setMetrics(prev => ({ ...prev, [name]: parseInt(value) }));
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-[var(--c-emerald)] drop-shadow-[0_0_15px_rgba(13,243,154,0.5)]';
        if (score >= 50) return 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]';
        return 'text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-8">
            <div className="mb-8">
                <h1 className="font-display font-bold text-4xl mb-2 flex items-center gap-3">
                    <Target className="text-[var(--c-emerald)]" size={36} /> Swachh Score Simulator
                </h1>
                <p className="text-[var(--c-gray-400)] max-w-2xl">
                    Interact with the sliders below to simulate how improving various waste management metrics impacts Madurai's overall Swachh Survekshan score.
                </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
                {/* Score Display Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <GlassCard className="p-8 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-[var(--c-emerald)]"></div>
                        <h2 className="text-[var(--c-gray-400)] text-lg font-medium mb-4 uppercase tracking-widest">Projected KPI Score</h2>
                        <div className={`text-8xl font-display font-bold mb-4 transition-colors duration-500 ${getScoreColor(currentScore)}`}>
                            {currentScore}<span className="text-4xl text-[var(--c-gray-500)] font-medium">/100</span>
                        </div>
                        <div className="flex gap-4 justify-center mt-4">
                            <div className="bg-white/5 border border-[var(--glass-border)] px-4 py-2 rounded-lg flex items-center gap-2">
                                <span className="text-xs text-[var(--c-gray-400)] uppercase">Nat Avg</span>
                                <span className="font-bold text-white">{nationalAverage}</span>
                            </div>
                            <div className="bg-white/5 border border-[var(--glass-border)] px-4 py-2 rounded-lg flex items-center gap-2">
                                <span className="text-xs text-[var(--c-gray-400)] uppercase">Mission</span>
                                <span className="font-bold text-[var(--c-emerald)]">{targetScore}</span>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <h3 className="font-bold mb-4 text-lg">AI Impact Analysis</h3>
                        {currentScore < 50 ? (
                            <p className="text-[var(--c-gray-300)] text-sm leading-relaxed">
                                <strong className="text-red-400">Critical Status:</strong> Madurai is currently far below the national average. Focus heavily on expanding door-to-door collection networks and initiating basic source segregation campaigns.
                            </p>
                        ) : currentScore < 80 ? (
                            <p className="text-[var(--c-gray-300)] text-sm leading-relaxed">
                                <strong className="text-yellow-400">Improving Status:</strong> Solid foundation established. To reach the top 10, significant investments are needed in Waste Processing facilities (currently dragging the score down) and rigorous public toilet maintenance.
                            </p>
                        ) : (
                            <p className="text-[var(--c-gray-300)] text-sm leading-relaxed whitespace-pre-line">
                                <strong className="text-[var(--c-emerald)]">Excellent Status:</strong> Target achieved! Madurai is operating at a highly efficient level. Maintain this score by ensuring continuous LCV fleet uptime and enforcing 100% source segregation.
                            </p>
                        )}
                    </GlassCard>
                </div>

                {/* Controls Panel */}
                <div className="lg:col-span-3">
                    <GlassCard className="p-6 h-full border border-[var(--c-emerald)]/20 shadow-[inset_0_0_20px_rgba(0,214,143,0.05)]">
                        <h2 className="text-2xl font-bold mb-8">Performance Levers</h2>

                        <div className="space-y-8">
                            <MetricSlider
                                label="Door-to-Door Collection"
                                name="doorToDoor"
                                value={metrics.doorToDoor}
                                weight="30%"
                                desc="Percentage of households covered by daily waste pickup."
                                onChange={handleSliderChange}
                            />
                            <MetricSlider
                                label="Segregation at Source"
                                name="segregation"
                                value={metrics.segregation}
                                weight="25%"
                                desc="Percentage of waste segregated into wet/dry at household level."
                                onChange={handleSliderChange}
                            />
                            <MetricSlider
                                label="Waste Processing & Recycling"
                                name="processing"
                                value={metrics.processing}
                                weight="20%"
                                desc="Total municipal solid waste processed effectively."
                                onChange={handleSliderChange}
                            />
                            <MetricSlider
                                label="Dumpsite Remediation"
                                name="remediation"
                                value={metrics.remediation}
                                weight="15%"
                                desc="Progress on clearing legacy waste from Vellaikkal dump yard."
                                onChange={handleSliderChange}
                            />
                            <MetricSlider
                                label="Public Toilet Cleanliness"
                                name="publicToilets"
                                value={metrics.publicToilets}
                                weight="10%"
                                desc="Sanitation and usability index of city corporation toilets."
                                onChange={handleSliderChange}
                            />
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

const MetricSlider = ({ label, name, value, weight, desc, onChange }) => {
    return (
        <div className="group">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                        {label} <span className="text-[var(--c-emerald)] text-xs bg-[var(--c-emerald)]/10 px-2 py-0.5 rounded">Weight: {weight}</span>
                    </h4>
                    <p className="text-xs text-[var(--c-gray-400)] mt-1">{desc}</p>
                </div>
                <span className="text-2xl font-bold font-display w-16 text-right">{value}%</span>
            </div>
            <div className="relative pt-2">
                <input
                    type="range"
                    name={name}
                    min="0"
                    max="100"
                    value={value}
                    onChange={onChange}
                    className="w-full h-2 bg-[var(--c-midnight)] rounded-lg appearance-none cursor-pointer border border-[var(--glass-border)]"
                    style={{
                        background: `linear-gradient(to right, var(--c-emerald) ${value}%, var(--c-midnight) ${value}%)`
                    }}
                />
                <style>{`
                    input[type='range']::-webkit-slider-thumb {
                        appearance: none;
                        width: 20px;
                        height: 20px;
                        background: white;
                        border: 2px solid var(--c-emerald);
                        border-radius: 50%;
                        cursor: pointer;
                        box-shadow: 0 0 10px rgba(0, 214, 143, 0.5);
                        transition: transform 0.1s;
                    }
                    input[type='range']::-webkit-slider-thumb:hover {
                        transform: scale(1.2);
                    }
                `}</style>
            </div>
        </div>
    );
};

export default Simulator;
