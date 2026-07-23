import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import TopupPage from './pages/TopupPage';
import PaymentPage from './pages/PaymentPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import GamesPage from './pages/GamesPage';
import PulsaPage from './pages/PulsaPage';
import InternetPage from './pages/InternetPage';
import TelegramPage from './pages/TelegramPage';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/topup" element={<TopupPage />} />
        <Route path="/telegram" element={<TelegramPage />} />
        <Route path="/payment/:orderId" element={<PaymentPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
