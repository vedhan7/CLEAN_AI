import React from 'react';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Loader2, LogOut, CheckCircle } from 'lucide-react';

export default function Auth() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        // Page will re-render automatically via onAuthStateChange
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--c-midnight)] flex items-center justify-center">
                <Loader2 className="animate-spin text-[var(--c-emerald)]" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 px-4 flex items-center justify-center relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--c-emerald)]/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="glass-card p-8 border-t-4 border-t-[var(--c-emerald)] shadow-2xl relative overflow-hidden">

                    {user ? (
                        /* ── Logged-in view ── */
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-[var(--c-emerald)]/10 p-4 rounded-full text-[var(--c-emerald)] mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h2 className="font-display text-2xl font-bold mb-2">You're Signed In</h2>
                            <p className="text-[var(--c-gray-400)] text-sm mb-1">
                                Logged in as
                            </p>
                            <p className="text-[var(--c-emerald)] font-semibold mb-6 break-all">
                                {user.email}
                            </p>

                            <div className="flex flex-col gap-3 w-full">
                                <button
                                    onClick={() => navigate('/report')}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--c-emerald)] to-cyan-500 text-[var(--c-midnight)] font-semibold hover:scale-[1.02] transition-transform"
                                >
                                    Report an Issue
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full py-3 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                                >
                                    <LogOut size={18} /> Sign Out
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* ── Sign-in / Sign-up form ── */
                        <>
                            <div className="flex flex-col items-center mb-6 text-center">
                                <div className="bg-[var(--c-emerald)]/10 p-4 rounded-full text-[var(--c-emerald)] mb-4">
                                    <ShieldAlert size={32} />
                                </div>
                                <h2 className="font-display text-2xl font-bold mb-2">Citizen Portal</h2>
                                <p className="text-[var(--c-gray-400)] text-sm">
                                    Sign in or create an account to securely access the CleanMadurai.AI platform.
                                </p>
                            </div>

                            <SupabaseAuth
                                supabaseClient={supabase}
                                appearance={{
                                    theme: ThemeSupa,
                                    variables: {
                                        default: {
                                            colors: {
                                                brand: '#00d68f',
                                                brandAccent: '#00b377',
                                                inputText: '#fff',
                                                inputBackground: 'rgba(255,255,255,0.05)',
                                                inputBorder: 'rgba(255,255,255,0.1)',
                                                inputBorderHover: 'rgba(0, 214, 143, 0.5)',
                                                inputBorderFocus: '#00d68f',
                                            },
                                        },
                                    },
                                }}
                                providers={['google']}
                                theme="dark"
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
