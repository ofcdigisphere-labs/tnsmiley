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
    { title: 'Games', icon: <Gamepad2 className="w-8 h-8 text-red-400" />, path: '/games', desc: 'Topup game populer' },
    { title: 'Pulsa', icon: <Smartphone className="w-8 h-8 text-red-400" />, path: '/pulsa', desc: 'Isi pulsa semua operator' },
    { title: 'Paket Data', icon: <Wifi className="w-8 h-8 text-red-400" />, path: '/data', desc: 'Kuota internet murah' },
    { title: 'E-Wallet', icon: <Wallet className="w-8 h-8 text-red-400" />, path: '/topup', desc: 'DANA, OVO, GoPay, ShopeePay' },
    { title: 'Telegram', icon: <Send className="w-8 h-8 text-red-400" />, path: '/telegram', desc: 'Beli akun Telegram OLD' },
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
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl transition shadow-lg shadow-red-900/30 font-medium"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate('/register')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl transition shadow-lg shadow-red-900/30 font-medium"
              >
                Reseller
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 px-4 tracking-tight">
            Platform Transaksi Digital
            <span className="text-red-500 block mt-1">Serba Instan & Otomatis</span>
          </h2>
          <p className="text-sm md:text-lg text-gray-300 px-4">
            Pilih kategori produk digital favoritmu dan nikmati kemudahan pembayaran dengan QRIS
          </p>
        </div>

        {/* Categories Grid (Mobile-friendly Grid Layout) */}
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 px-2">
          {categories.map((cat) => (
            <div
              key={cat.title}
              onClick={() => navigate(cat.path)}
              className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-center cursor-pointer hover:bg-white/10 hover:border-red-500/50 transition-all duration-300 transform hover:-translate-y-1 shadow-xl flex flex-col items-center justify-between"
            >
              <div className="p-4 bg-red-500/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 border border-red-500/20">
                {cat.icon}
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold text-white mb-1">{cat.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-2">{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-6 mt-20">
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-red-400" />}
            title="Proses Cepat"
            description="Transaksi otomatis diproses dalam hitungan detik setelah pembayaran"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-red-400" />}
            title="Aman & Terpercaya"
            description="Sistem pembayaran QRIS resmi yang aman dan terverifikasi"
          />
          <FeatureCard
            icon={<QrCode className="w-8 h-8 text-red-400" />}
            title="QRIS Otomatis"
            description="Mendukung seluruh aplikasi e-banking dan e-wallet di Indonesia"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-400 border-t border-white/10 mt-16 text-sm">
        <p>&copy; 2026 Scan N Go. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
      <div className="mb-3 p-3 bg-red-500/10 w-fit rounded-xl border border-red-500/20">{icon}</div>
      <h3 className="text-base md:text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-xs md:text-sm text-gray-400">{description}</p>
    </div>
  );
};

export default LandingPage;
