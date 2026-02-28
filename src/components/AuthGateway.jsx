import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const AdminGateway = () => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" size={40} color="var(--c-emerald)" /></div>;
    if (!user || !isAdmin) return <Navigate to="/" replace />;

    return <Outlet />;
};

export const AuthGateway = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-midnight)' }}>
                <Loader2 className="animate-spin" size={40} color="var(--c-emerald)" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px', paddingBottom: '80px' }}>
                <div className="glass-card animate-fade-in-up" style={{ width: '100%', maxWidth: '400px', borderTop: '4px solid var(--c-emerald)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--space-md)', textAlign: 'center' }}>
                        <div style={{ background: 'rgba(0, 214, 143, 0.1)', padding: '12px', borderRadius: '50%', color: 'var(--c-emerald)', marginBottom: '16px' }}>
                            <ShieldAlert size={32} />
                        </div>
                        <h2 style={{ margin: '0 0 8px 0' }} className="font-display">Restricted Access</h2>
                        <p style={{ color: 'var(--c-gray-400)', fontSize: '0.9rem', margin: 0 }}>
                            Sign in or create an account to securely access {location.pathname.replace('/', '')}.
                        </p>
                    </div>

                    <Auth
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
                        redirectTo={window.location.origin}
                        theme="dark"
                    />
                </div>
            </div>
        );
    }

    return children ? children : <Outlet />;
};
