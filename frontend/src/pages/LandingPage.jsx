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
    { title: 'Games', icon: <Gamepad2 className="w-8 h-8 text-red-400" />, path: '/games' },
    { title: 'Pulsa', icon: <Smartphone className="w-8 h-8 text-red-400" />, path: '/pulsa' },
    { title: 'Paket Data', icon: <Wifi className="w-8 h-8 text-red-400" />, path: '/data' },
    { title: 'E-Wallet', icon: <Wallet className="w-8 h-8 text-red-400" />, path: '/topup' },
    { title: 'Telegram', icon: <Send className="w-8 h-8 text-red-400" />, path: '/telegram' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 text-white">
      {/* Header */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl font-bold tracking-wider">Scan N Go</h1>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl transition shadow-lg shadow-red-600/20"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate('/register')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium transition shadow-lg shadow-red-600/20"
              >
                Jadi Reseller
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-12 pb-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-6 tracking-tight">
            Topup & Transaksi
            <span className="text-red-500"> Instan</span>
          </h2>
          <p className="text-base md:text-xl text-gray-300 mb-8 px-4">
            Platform pembayaran digital modern untuk Games, Pulsa, Data, E-Wallet, dan Telegram dalam satu genggaman
          </p>
        </div>

        {/* Categories Grid (Like Lapakgaming style) */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
            {categories.map((cat) => (
              <div
                key={cat.title}
                onClick={() => navigate(cat.path)}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:bg-white/10 hover:border-red-500/50 cursor-pointer transition transform hover:-translate-y-1 shadow-xl"
              >
                <div className="p-4 bg-red-500/10 rounded-2xl">
                  {cat.icon}
                </div>
                <span className="font-semibold text-lg">{cat.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section Header */}
        <div className="text-center mb-10">
          <h3 className="text-2xl md:text-3xl font-bold tracking-wide text-red-400 uppercase text-sm font-semibold tracking-widest mb-2">
            Keunggulan
          </h3>
          <h4 className="text-3xl font-extrabold">Mengapa Memilih Kami?</h4>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={<Zap className="w-10 h-10 text-red-500" />}
            title="Proses Cepat"
            description="Transaksi otomatis diproses dalam hitungan detik setelah pembayaran berhasil"
          />
          <FeatureCard
            icon={<Shield className="w-10 h-10 text-red-500" />}
            title="Aman & Terpercaya"
            description="Sistem keamanan berlapis dan terverifikasi untuk setiap transaksi Anda"
          />
          <FeatureCard
            icon={<QrCode className="w-10 h-10 text-red-500" />}
            title="Multi Layanan"
            description="Berbagai kebutuhan digital tersedia lengkap dalam satu platform modern"
          />
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
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 hover:bg-white/10 transition">
      <div className="mb-4 inline-block p-3 bg-red-500/10 rounded-xl">{icon}</div>
      <h3 className="text-lg md:text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm md:text-base text-gray-400">{description}</p>
    </div>
  );
};

export default LandingPage;
