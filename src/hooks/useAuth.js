import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch session on load
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            else setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // Gracefully handle missing profiles table (404) — 
                // the table may not have been created in Supabase yet.
                console.warn('Profile fetch skipped:', error.message);
                setProfile(null);
            } else {
                setProfile(data);
            }
        } catch (error) {
            console.warn('Profile fetch failed (non-critical):', error.message);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email, password) => {
        return supabase.auth.signInWithPassword({ email, password });
    };

    const signUp = async (email, password, fullName) => {
        return supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName }
            }
        });
    };

    const signOut = async () => {
        return supabase.auth.signOut();
    };

    return {
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        isAdmin: profile?.role === 'admin_councillor'
    };
}
