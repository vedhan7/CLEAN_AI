import React from 'react';
import { Link } from 'react-router-dom';
import { TriangleAlert, ArrowRight, ShieldCheck, Truck, TrendingUp, Activity, BarChart2, LogIn } from 'lucide-react';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import WardMap from '../components/WardMap';
import { useAuth } from '../hooks/useAuth';

const Landing = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen pt-24 pb-12">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 pb-16">
                <div className="inline-block mb-4 px-3 py-1 rounded-full bg-[var(--c-emerald)]/10 border border-[var(--c-emerald)]/20 text-[var(--c-emerald)] text-sm font-semibold tracking-wide animate-in fade-in slide-in-from-bottom-4">
                    Mission: Top 10 Swachh Survekshan 2026
                </div>

                <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    Transforming Madurai.<br />
                    <span className="text-[var(--c-emerald)] text-glow">Together.</span>
                </h1>

                <p className="max-w-2xl mx-auto text-lg text-[var(--c-gray-400)] mb-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                    Real-time accountability, AI-driven coordination, and citizen engagement to build a cleaner, greener Madurai.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                    <Link to="/report">
                        <Button className="bg-[var(--c-emerald)] text-[var(--c-midnight)] border-none hover:scale-105 transition-all text-lg px-8 py-6 h-auto shadow-[0_0_20px_rgba(13,243,154,0.4)]">
                            <TriangleAlert className="mr-2" size={20} />
                            Report an Issue
                        </Button>
                    </Link>
                    <Link to="/track">
                        <Button variant="secondary" className="text-lg px-8 py-6 h-auto hover:bg-white/5 border border-[var(--glass-border)]">
                            Track Status
                            <ArrowRight className="ml-2" size={20} />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Stats KPI Ribbon */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <GlassCard className="p-6 flex items-center justify-between border-t border-[var(--glass-border)] hover:border-[var(--c-emerald)]/30 transition-colors">
                        <div>
                            <span className="text-[var(--c-gray-400)] text-xs font-semibold tracking-wider mb-1 uppercase flex items-center gap-2">
                                Active Wards <span className="w-1.5 h-1.5 rounded-full bg-[var(--c-emerald)] animate-pulse shadow-[0_0_8px_var(--c-emerald)] inline-block"></span>
                            </span>
                            <h3 className="text-4xl font-bold">100</h3>
                        </div>
                        <div className="text-[var(--c-emerald)]">
                            <ShieldCheck size={28} />
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 flex items-center justify-between border-t border-[var(--glass-border)] hover:border-[var(--c-emerald)]/30 transition-colors">
                        <div>
                            <p className="text-[var(--c-gray-400)] text-xs font-semibold tracking-wider mb-1 uppercase">LCVs Deployed</p>
                            <h3 className="text-4xl font-bold">240</h3>
                        </div>
                        <div className="text-[var(--c-emerald)]">
                            <Truck size={28} />
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 flex flex-col justify-center border-t border-[var(--glass-border)] hover:border-[var(--c-emerald)]/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[var(--c-gray-400)] text-xs font-semibold tracking-wider uppercase">Resolved (24H)</p>
                            <TrendingUp size={20} className="text-[var(--c-emerald)]" />
                        </div>
                        <h3 className="text-4xl font-bold mb-1">1,204</h3>
                        <span className="text-xs text-[var(--c-emerald)] font-medium bg-[var(--c-emerald)]/10 inline-flex px-2 py-0.5 rounded items-center gap-1 w-max">
                            <TrendingUp size={12} /> 12% compared to last week
                        </span>
                    </GlassCard>

                    <GlassCard className="p-6 flex flex-col justify-center border-t border-[var(--glass-border)] hover:border-[var(--c-emerald)]/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[var(--c-gray-400)] text-xs font-semibold tracking-wider uppercase">Avg Response</p>
                            <Activity size={20} className="text-[var(--c-emerald)]" />
                        </div>
                        <h3 className="text-4xl font-bold mb-1 flex items-baseline gap-1">4<span className="text-xl text-[var(--c-gray-400)] font-medium">h</span></h3>
                        <span className="text-xs text-[var(--c-emerald)] font-medium bg-[var(--c-emerald)]/10 inline-flex px-2 py-0.5 rounded items-center gap-1 w-max">
                            <TrendingUp size={12} /> 18% compared to last week
                        </span>
                    </GlassCard>
                </div>
            </section>

            {/* Live Control Center / Map */}
            <section className="bg-[var(--c-midnight-light)] border-y border-[var(--glass-border)] py-16 mb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                        <div>
                            <h2 className="font-display text-3xl font-bold mb-2">Live Control Center</h2>
                            <p className="text-[var(--c-gray-400)] max-w-xl">
                                Monitor real-time cleanliness metrics, active LCVs, and citizen reports across all 100 wards of the city.
                            </p>
                        </div>
                        <Link to="/leaderboard" className="text-sm font-medium text-white hover:text-[var(--c-emerald)] transition-colors flex items-center gap-1 group">
                            View detailed leaderboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="h-[500px] w-full rounded-xl overflow-hidden border border-[var(--glass-border)] shadow-2xl relative">
                        {/* Fake Map Overlay to mimic screenshot style specifically */}
                        <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_100px_rgba(10,15,20,0.8)]"></div>
                        <WardMap height="500px" />
                    </div>
                </div>
            </section>

            {/* The Swachh Gap */}
            <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-24">
                <h2 className="font-display text-3xl font-bold mb-4">The Swachh Gap</h2>
                <div className="mb-4">
                    <h3 className="text-7xl font-bold inline-block tracking-tight">4,823<span className="text-4xl text-[var(--c-gray-500)] font-medium">/ 12,500</span></h3>
                </div>
                <p className="text-[var(--c-gray-400)] mb-12">
                    Our current Swachh Survekshan score. We need massive improvements in these three critical areas to reach our goal.
                </p>

                <div className="space-y-6 text-left">
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="font-semibold text-sm">Door-to-Door Collection</span>
                            <span className="font-bold text-[var(--c-emerald)]">37%</span>
                        </div>
                        <div className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] h-3 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-[var(--c-emerald)] to-cyan-400 h-full rounded-full" style={{ width: '37%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="font-semibold text-sm">Waste Processing</span>
                            <span className="font-bold text-[#FF3333]">4%</span>
                        </div>
                        <div className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] h-3 rounded-full overflow-hidden">
                            <div className="bg-[#FF3333] h-full rounded-full" style={{ width: '4%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="font-semibold text-sm">Public Toilet Cleanliness</span>
                            <span className="font-bold text-[#FF3333]">3%</span>
                        </div>
                        <div className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] h-3 rounded-full overflow-hidden">
                            <div className="bg-[#FF3333] h-full rounded-full" style={{ width: '3%' }}></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="max-w-md mx-auto px-4 text-center">
                <GlassCard className="p-8 border border-[var(--glass-border)]">
                    <h3 className="font-display text-xl font-bold mb-2">Ready to make a difference?</h3>
                    <p className="text-[var(--c-gray-400)] text-sm mb-6">Every report helps us map and fix issues faster.</p>
                    <Link to="/report">
                        <Button className="w-full bg-[var(--c-emerald)] text-[var(--c-midnight)] border-transparent hover:scale-105 transition-transform shadow-[0_0_15px_rgba(13,243,154,0.3)]">
                            Submit a Report
                        </Button>
                    </Link>
                </GlassCard>
            </section>
        </div>
    );
};

export default Landing;
