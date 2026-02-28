import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Report from './pages/Report';
import Track from './pages/Track';
import Leaderboard from './pages/Leaderboard';
import Heatmap from './pages/Heatmap';
import Simulator from './pages/Simulator';
import Chatbot from './pages/Chatbot';
import AdminLayout from './admin/AdminLayout';
import { AdminGateway, AuthGateway } from './components/AuthGateway';

function App() {
    return (
        <div className="min-h-screen bg-[var(--c-midnight)] text-white">
            <Navbar />
            <main className="pt-20">
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/report" element={<AuthGateway><Report /></AuthGateway>} />
                    <Route path="/track" element={<Track />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/heatmap" element={<Heatmap />} />
                    <Route path="/simulator" element={<Simulator />} />
                    <Route path="/chatbot" element={<Chatbot />} />

                    {/* Admin Panel Routes */}
                    <Route element={<AdminGateway />}>
                        <Route path="/admin/*" element={<AdminLayout />} />
                    </Route>
                </Routes>
            </main>
        </div>
    );
}

export default App;
