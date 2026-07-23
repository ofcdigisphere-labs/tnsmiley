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

  const categories = [
    { title: 'Games', icon: <Gamepad2 className="w-8 h-8 text-rose-400" />, path: '/games' },
    { title: 'Pulsa', icon: <Smartphone className="w-8 h-8 text-rose-400" />, path: '/pulsa' },
    { title: 'Paket Data', icon: <Wifi className="w-8 h-8 text-rose-400" />, path: '/data' },
    { title: 'E-Wallet', icon: <Wallet className="w-8 h-8 text-rose-400" />, path: '/topup' },
    { title: 'Telegram', icon: <Send className="w-8 h-8 text-rose-400" />, path: '/telegram' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/40">
      {/* Header */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-8 h-8 text-rose-500" />
            <h1 className="text-2xl font-bold text-white tracking-wide">Scan N Go</h1>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate('/register')}
                className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg font-medium transition shadow-lg shadow-rose-900/30"
              >
                Jadi Reseller
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 px-4">
            Platform Transaksi
            <span className="text-rose-500"> Serba Ada</span>
          </h2>
          <p className="text-base md:text-xl text-gray-300 mb-8 px-4">
            Solusi cepat dan aman untuk kebutuhan digital, e-wallet, dan game Anda dalam satu genggaman.
          </p>
        </div>

        {/* Categories Grid (LapakGaming Style) */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
            {categories.map((cat, index) => (
              <div
                key={index}
                onClick={() => navigate(cat.path)}
                className="bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-rose-500/50 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-900/10 group flex flex-col items-center justify-center gap-3"
              >
                <div className="p-4 rounded-xl bg-slate-800/80 group-hover:bg-rose-500/10 transition">
                  {cat.icon}
                </div>
                <h3 className="text-white font-semibold text-base tracking-wide">{cat.title}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Keunggulan Section */}
        <div className="max-w-6xl mx-auto mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
            Keunggulan
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard
              icon={<Zap className="w-10 h-10 text-rose-500" />}
              title="Proses Cepat"
              description="Transaksi otomatis diproses dalam hitungan detik setelah pembayaran"
            />
            <FeatureCard
              icon={<Shield className="w-10 h-10 text-rose-500" />}
              title="Aman & Terpercaya"
              description="Sistem pembayaran QRIS resmi yang aman dan terverifikasi"
            />
            <FeatureCard
              icon={<Wallet className="w-10 h-10 text-rose-500" />}
              title="Multi Layanan"
              description="Support berbagai kebutuhan digital dan e-wallet dalam satu platform"
            />
          </div>
        </div>

        {/* Supported E-Wallets */}
        <div className="mt-16 md:mt-20 max-w-4xl mx-auto text-center">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8 px-4">
            E-Wallet yang Didukung
          </h3>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 px-4">
            {['DANA', 'OVO', 'GoPay', 'ShopeePay'].map((wallet) => (
              <div
                key={wallet}
                className="bg-slate-900/60 backdrop-blur-lg border border-slate-800 rounded-xl px-8 py-4 shadow-sm"
              >
                <p className="text-xl font-semibold text-gray-200">{wallet}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 border-t border-slate-800/80">
        <p>&copy; 2026 Scan N Go. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-slate-900/60 backdrop-blur-lg border border-slate-800 rounded-2xl p-6 md:p-8 hover:bg-slate-900/90 transition shadow-lg">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg md:text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm md:text-base text-gray-400">{description}</p>
    </div>
  );
};

export default LandingPage;
