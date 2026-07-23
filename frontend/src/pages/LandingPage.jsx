import { useNavigate } from 'react-router-dom';
import { QrCode, Zap, Shield, ArrowRight, LayoutDashboard, Gamepad2, Smartphone, Wifi, Wallet, Send } from 'lucide-react';
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
    { title: 'Games', icon: <Gamepad2 className="w-8 h-8 text-red-400" />, path: '/games' },
    { title: 'Pulsa', icon: <Smartphone className="w-8 h-8 text-red-400" />, path: '/pulsa' },
    { title: 'Paket Data', icon: <Wifi className="w-8 h-8 text-red-400" />, path: '/data' },
    { title: 'E-Wallet', icon: <Wallet className="w-8 h-8 text-red-400" />, path: '/topup' },
    { title: 'Telegram', icon: <Send className="w-8 h-8 text-red-400" />, path: '/telegram' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 text-white">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-red-500/10 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-7 h-7 text-red-500" />
            <h1 className="text-xl font-bold tracking-wide">Scan N Go</h1>
          </div>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-xl transition font-medium"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate('/register')}
                className="bg-red-600 hover:bg-red-700 text-white text-sm px-5 py-2 rounded-xl transition font-semibold shadow-lg shadow-red-600/30"
              >
                Jadi Reseller
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-md mx-auto px-4 pt-6 pb-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold mb-3 leading-tight">
            Topup E-Wallet & Digital <span className="text-red-500">Instant</span>
          </h2>
          <p className="text-sm text-gray-300 px-2">
            Platform transaksi digital tercepat dan termurah dengan QRIS
          </p>
        </div>

        {/* Daftar Layanan Tersedia (Grid Mobile-Optimized) */}
        <div className="mb-10">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Daftar Layanan Tersedia
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {services.map((item, idx) => (
              <div
                key={item.title}
                onClick={() => navigate(item.path)}
                className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-red-600/10 hover:border-red-500/30 transition active:scale-95 ${
                  idx === 4 ? 'col-span-2' : ''
                }`}
              >
                <div className="bg-red-500/10 p-3 rounded-xl mb-2">{item.icon}</div>
                <span className="font-semibold text-sm text-gray-200">{item.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 mb-12">
          <button
            onClick={() => navigate('/topup')}
            className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl text-base font-bold shadow-lg shadow-red-600/30 transition transform active:scale-98"
          >
            Mulai Topup Sekarang
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Keunggulan */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Keunggulan
          </h3>
          <div className="flex flex-col gap-3">
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-red-500" />}
              title="Proses Cepat"
              description="Transaksi otomatis diproses dalam hitungan detik"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-red-500" />}
              title="Aman & Terpercaya"
              description="Sistem pembayaran resmi yang aman dan terverifikasi"
            />
            <FeatureCard
              icon={<QrCode className="w-6 h-6 text-red-500" />}
              title="QRIS Support"
              description="Mendukung pembayaran scan QRIS dari seluruh bank & e-wallet"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-md mx-auto px-4 py-6 text-center text-xs text-gray-500 border-t border-white/5">
        <p>&copy; 2026 Scan N Go. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-start gap-3.5">
      <div className="bg-red-500/10 p-2.5 rounded-lg shrink-0">{icon}</div>
      <div>
        <h4 className="font-bold text-sm text-white mb-0.5">{title}</h4>
        <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default LandingPage;
