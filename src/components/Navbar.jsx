import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Leaf, LogOut, LogIn } from 'lucide-react';
import Button from './ui/Button';
import NotificationBell from './NotificationBell';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass-panel py-3 !rounded-none !border-l-0 !border-r-0 !border-t-0' : 'bg-transparent py-5'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <Leaf className="text-[var(--c-emerald)]" size={28} />
                        <span className="font-display font-bold text-xl tracking-tight">CleanMadurai.AI</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/track" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Track Status</Link>
                        <Link to="/leaderboard" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Leaderboard</Link>
                        {user && isAdmin && (
                            <Link to="/admin" className="text-sm font-bold text-[var(--c-emerald)] hover:text-emerald-400 transition-colors">Admin Panel</Link>
                        )}
                        {user && isAdmin && <NotificationBell />}
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-2 rounded border border-[var(--glass-border)] text-[var(--c-gray-400)] hover:text-red-400 hover:border-red-400 transition-colors"
                            >
                                <LogOut size={16} /> Log Out
                            </button>
                        ) : (
                            <Link to="/report">
                                <Button variant="secondary" className="flex items-center gap-2 border border-[var(--c-emerald)]/40 text-[var(--c-emerald)] hover:bg-[var(--c-emerald)]/10">
                                    <LogIn size={16} /> Sign In
                                </Button>
                            </Link>
                        )}
                        {(!user || !isAdmin) && (
                            <Link to="/report">
                                <Button className="bg-[var(--c-emerald)] text-[var(--c-midnight)] hover:scale-105 border-transparent transition-transform shadow-[0_0_15px_rgba(13,243,154,0.3)]">Report Issue</Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center gap-2">
                        {user && isAdmin && <NotificationBell />}
                        <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-[var(--c-emerald)] transition-colors">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden absolute top-full left-0 w-full transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="glass-panel m-4 p-4 flex flex-col gap-2">
                    {(!user || !isAdmin) && <Link to="/report" onClick={() => setIsOpen(false)} className="px-4 py-3 hover:bg-white/10 rounded-lg w-full text-left">Report Issue</Link>}
                    <Link to="/track" onClick={() => setIsOpen(false)} className="px-4 py-3 hover:bg-white/10 rounded-lg w-full text-left">Track Status</Link>
                    <Link to="/leaderboard" onClick={() => setIsOpen(false)} className="px-4 py-3 hover:bg-white/10 rounded-lg w-full text-left">Leaderboard</Link>
                    {user && isAdmin && (
                        <Link to="/admin" onClick={() => setIsOpen(false)} className="px-4 py-3 hover:bg-white/10 rounded-lg w-full text-left font-bold text-[var(--c-emerald)]">Admin Panel</Link>
                    )}
                    <hr className="border-[var(--glass-border)] my-2" />
                    {user ? (
                        <Button variant="ghost" className="justify-start w-full text-red-400 hover:text-red-300" onClick={() => { setIsOpen(false); handleLogout(); }}>
                            <LogOut size={16} className="mr-2" /> Log Out
                        </Button>
                    ) : (
                        <Link to="/report" onClick={() => setIsOpen(false)} className="px-4 py-3 hover:bg-white/10 rounded-lg w-full text-left flex items-center gap-2 text-[var(--c-emerald)] font-medium">
                            <LogIn size={16} /> Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
