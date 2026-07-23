import { useNavigate } from 'react-router-dom';
import { Wallet, Zap, Shield, ArrowRight, LayoutDashboard, Gamepad2, Smartphone, Wifi, Send } from 'lucide-react';
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
    { name: 'Games', icon: <Gamepad2 className="w-8 h-8 text-purple-400" />, path: '/games', desc: 'Topup game favoritmu' },
    { name: 'Pulsa', icon: <Smartphone className="w-8 h-8 text-purple-400" />, path: '/pulsa', desc: 'Isi pulsa semua operator' },
    { name: 'Paket Data', icon: <Wifi className="w-8 h-8 text-purple-400" />, path: '/paket-data', desc: 'Internet murah & cepat' },
    { name: 'E-Wallet', icon: <Wallet className="w-8 h-8 text-purple-400" />, path: '/topup', desc: 'DANA, OVO, GoPay, ShopeePay' },
    { name: 'Telegram', icon: <Send className="w-8 h-8 text-purple-400" />, path: '/telegram', desc: 'Beli akun & kebutuhan Telegram' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">PayQRIS</h1>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-white hover:text-purple-400 px-4 py-2 rounded-lg transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 px-4">
            Platform Transaksi
            <span className="text-purple-400"> Instant</span>
          </h2>
          <p className="text-base md:text-xl text-gray-300 mb-8 md:mb-12 px-4">
            Layanan topup game, pulsa, paket data, e-wallet, dan produk digital terlengkap dengan QRIS
          </p>
        </div>

        {/* Categories Grid (LapakGaming Style) */}
        <div className="mt-8 mb-16 md:mt-12 md:mb-20">
          <h3 className="text-xl md:text-2xl font-bold text-white text-center mb-6 md:mb-8 px-4">
            Kategori Layanan
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 px-2">
            {categories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => navigate(cat.path)}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 text-center hover:bg-white/20 transition cursor-pointer flex flex-col items-center justify-center group transform hover:scale-105"
              >
                <div className="mb-3 p-3 bg-white/5 rounded-full group-hover:bg-purple-600/20 transition">
                  {cat.icon}
                </div>
                <h4 className="text-base md:text-lg font-bold text-white mb-1">{cat.name}</h4>
                <p className="text-xs text-gray-300 line-clamp-2">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mt-16 md:mt-20">
          <FeatureCard
            icon={<Zap className="w-12 h-12 text-purple-400" />}
            title="Proses Cepat"
            description="Transaksi otomatis diproses dalam hitungan detik setelah pembayaran"
          />
          <FeatureCard
            icon={<Shield className="w-12 h-12 text-purple-400" />}
            title="Aman & Terpercaya"
            description="Sistem pembayaran QRIS resmi yang aman dan terverifikasi"
          />
          <FeatureCard
            icon={<Wallet className="w-12 h-12 text-purple-400" />}
            title="Multi Layanan"
            description="Berbagai kebutuhan digital lengkap tersedia dalam satu platform"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-400 border-t border-white/10">
        <p>&copy; 2026 PayQRIS. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 md:p-8 hover:bg-white/20 transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg md:text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm md:text-base text-gray-300">{description}</p>
    </div>
  );
};

export default LandingPage;
