import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, Users as UsersIcon, Flame, Truck, BarChart3, Settings } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import AdminComplaints from './AdminComplaints';
import AdminMap from './AdminMap';
import AdminDrivers from './AdminDrivers';
import AdminUsers from './AdminUsers';
import AdminAnalytics from './AdminAnalytics';

const sidebarLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/complaints', label: 'Complaints', icon: AlertCircle },
    { to: '/admin/live-map', label: 'Live Map', icon: Flame },
    { to: '/admin/drivers', label: 'LCV Drivers', icon: Truck },
    { to: '/admin/users', label: 'Citizens', icon: UsersIcon },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

const AdminLayout = () => {
    const location = useLocation();

    const isActive = (path, end) => {
        if (end) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-[var(--c-midnight)] flex flex-col md:flex-row text-white pt-20">
            {/* Sidebar */}
            <aside className="w-full md:w-64 glass-panel m-4 rounded-xl flex flex-col sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-[var(--c-gray-400)] text-xs font-bold uppercase tracking-wider mb-4">Command Center</h2>
                    <nav className="flex flex-col gap-2">
                        {sidebarLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(link.to, link.end)
                                    ? 'bg-[var(--c-emerald)]/10 text-[var(--c-emerald)] font-medium'
                                    : 'hover:bg-white/10 text-[var(--c-gray-300)]'
                                    }`}
                            >
                                <link.icon size={20} />
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="p-6 mt-auto">
                    <Link to="/admin/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/settings') ? 'bg-[var(--c-emerald)]/10 text-[var(--c-emerald)]' : 'hover:bg-white/10 text-[var(--c-gray-300)]'}`}>
                        <Settings size={20} />
                        <span>Settings</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/complaints" element={<AdminComplaints />} />
                    <Route path="/live-map" element={<AdminMap />} />
                    <Route path="/drivers" element={<AdminDrivers />} />
                    <Route path="/users" element={<AdminUsers />} />
                    <Route path="/analytics" element={<AdminAnalytics />} />
                    <Route path="*" element={<h2 className="text-xl text-[var(--c-gray-400)]">Coming soon...</h2>} />
                </Routes>
            </main>
        </div>
    );
};

export default AdminLayout;

