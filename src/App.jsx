import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Report from './pages/Report';
import Track from './pages/Track';
import Leaderboard from './pages/Leaderboard';
import Heatmap from './pages/Heatmap';
import Simulator from './pages/Simulator';
import Chatbot from './pages/Chatbot';
import CouncillorDash from './pages/CouncillorDash';
import WorkerApp from './pages/WorkerApp';
import Navbar from './components/Navbar';
import AuthGateway from './components/AuthGateway';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/report" element={<AuthGateway><Report /></AuthGateway>} />
        <Route path="/track" element={<Track />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/heatmap" element={<Heatmap />} />
        <Route path="/simulator" element={<Simulator />} />

        {/* Protected Dashboard Routes */}
        <Route path="/councillor" element={<AuthGateway><CouncillorDash /></AuthGateway>} />
        <Route path="/worker" element={<AuthGateway><WorkerApp /></AuthGateway>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
