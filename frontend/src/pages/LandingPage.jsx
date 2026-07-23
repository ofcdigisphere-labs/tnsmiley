import { useNavigate } from 'react-router-dom';
import { QrCode, Zap, Shield, ArrowRight, LayoutDashboard, Gamepad2, Smartphone, Wifi, Wallet, MessageSquare, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    setIsLoggedIn(!!userData);
  }, []);

  const services = [
    { title: 'Games', icon: <Gamepad2 className="w-8 h-8 text-red-400" />, path: '/games' },
    { title: 'Pulsa', icon: <Smartphone className="w-8 h-8 text-red-400" />, path: '/pulsa' },
    { title: 'Paket Data', icon: <Wifi className="w-8 h-8 text-red-400" />, path: '/data' },
    { title: 'E-Wallet', icon: <Wallet className="w-8 h-8 text-red-400" />, path: '/topup' },
    { title: 'Telegram', icon: <MessageSquare className="w-8 h-8 text-red-400" />, path: '/telegram' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 text-white">
      {/* Header */}
      <nav className="container mx-auto px-4 py-4 sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-7 h-7 text-red-500" />
            <h1 className="text-xl font-bold tracking-tight text-white">Scan N Go</h1>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-lg shadow-red-600/30"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-lg shadow-red-600/30"
              >
                <UserPlus className="w-4 h-4" />
                Jadi Reseller
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-8 pb-12">
        <div className="max-w-4xl mx-auto text-center mt-4 mb-8">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 px-2">
            Topup & Transaksi <span className="text-red-500">Instant</span>
          </h2>
          <p className="text-sm md:text-lg text-gray-300 mb-6 px-4">
            Platform otomatis serba ada untuk kebutuhan digital Anda dengan sistem QRIS cepat dan aman.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/topup')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-red-600/30 transform active:scale-95"
            >
              Mulai Transaksi
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Daftar Layanan Tersedia */}
        <div className="mt-8 mb-12">
          <h3 className="text-lg font-bold text-white mb-4 px-1">Daftar Layanan Tersedia</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            {services.map((service, idx) => (
              <div
                key={idx}
                onClick={() => navigate(service.path)}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/10 hover:border-red-500/50 transition cursor-pointer active:scale-95 shadow-md"
              >
                <div className="p-3 bg-red-500/10 rounded-xl mb-3">
                  {service.icon}
                </div>
                <span className="text-sm font-semibold text-white">{service.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Keunggulan */}
        <div className="mt-12">
          <h3 className="text-lg font-bold text-white mb-4 px-1">Keunggulan</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-red-500" />}
              title="Proses Cepat"
              description="Transaksi otomatis diproses dalam hitungan detik setelah pembayaran."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-red-500" />}
              title="Aman & Terpercaya"
              description="Sistem pembayaran QRIS resmi yang aman dan terverifikasi."
            />
            <FeatureCard
              icon={<Wallet className="w-8 h-8 text-red-500" />}
              title="Multi Layanan"
              description="Lengkap mulai dari games, pulsa, hingga akun digital dalam satu platform."
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-6 text-center text-xs md:text-sm text-gray-400 border-t border-white/10">
        <p>&copy; 2026 Scan N Go. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition shadow-md">
      <div className="p-2.5 bg-red-500/10 w-fit rounded-xl mb-3">{icon}</div>
      <h3 className="text-base font-bold text-white mb-1">{title}</h3>
      <p className="text-xs md:text-sm text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
};

export default LandingPage;
