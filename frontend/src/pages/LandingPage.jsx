import { useNavigate } from 'react-router-dom';
import { QrCode, Zap, Shield, ArrowRight, LayoutDashboard, Gamepad2, Smartphone, Wifi, Wallet, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    setIsLoggedIn(!!userData);
  }, []);

  const services = [
    { title: 'Games', icon: <Gamepad2 className="w-10 h-10 text-red-400" />, path: '/games' },
    { title: 'Pulsa', icon: <Smartphone className="w-10 h-10 text-red-400" />, path: '/pulsa' },
    { title: 'Paket Data', icon: <Wifi className="w-10 h-10 text-red-400" />, path: '/paket-data' },
    { title: 'E-Wallet', icon: <Wallet className="w-10 h-10 text-red-400" />, path: '/topup' },
    { title: 'Telegram', icon: <MessageSquare className="w-10 h-10 text-red-400" />, path: '/telegram' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900">
      {/* Header */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl font-bold text-white">Scan N Go</h1>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate('/register')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition font-medium shadow-lg shadow-red-600/30"
              >
                Jadi Reseller
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 px-4">
            Topup & Transaksi
            <span className="text-red-500"> Instan</span>
          </h2>
          <p className="text-base md:text-xl text-gray-300 mb-8 px-4">
            Platform pembayaran digital terintegrasi dengan QRIS dan layanan produk digital lengkap
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/topup')}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition transform hover:scale-105 shadow-xl shadow-red-600/30"
            >
              Mulai Transaksi
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Services Grid Section */}
        <div className="mb-20">
          <h3 className="text-xl md:text-2xl font-bold text-white text-center mb-8 px-4">
            Daftar Layanan Tersedia
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                onClick={() => navigate(service.path)}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 hover:border-red-500/50 cursor-pointer transition transform hover:-translate-y-1 flex flex-col items-center justify-center gap-4 group"
              >
                <div className="p-4 bg-red-500/10 rounded-2xl group-hover:bg-red-500/20 transition">
                  {service.icon}
                </div>
                <h4 className="text-white font-semibold text-base md:text-lg">{service.title}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-white text-center mb-8 px-4">
            Keunggulan
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard
              icon={<Zap className="w-10 h-10 text-red-500" />}
              title="Proses Cepat"
              description="Transaksi otomatis diproses dalam hitungan detik setelah pembayaran"
            />
            <FeatureCard
              icon={<Shield className="w-10 h-10 text-red-500" />}
              title="Aman & Terpercaya"
              description="Sistem pembayaran QRIS resmi yang aman dan terverifikasi"
            />
            <FeatureCard
              icon={<QrCode className="w-10 h-10 text-red-500" />}
              title="Multi Layanan"
              description="Support berbagai kebutuhan digital mulai dari games hingga e-wallet"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-400 border-t border-white/10">
        <p>&copy; 2026 Scan N Go. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8 hover:bg-white/10 transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg md:text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm md:text-base text-gray-300">{description}</p>
    </div>
  );
};

export default LandingPage;
