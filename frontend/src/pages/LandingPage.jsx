import { useNavigate } from 'react-router-dom';
import { Wallet, Zap, Shield, LayoutDashboard, Gamepad2, Smartphone, Wifi, Send } from 'lucide-react';
import { useEffect, useState } from 'react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    setIsLoggedIn(!!userData);
  }, []);

  // Daftar menu produk ala platform top-up modern
  const productMenus = [
    { title: 'Games', icon: <Gamepad2 className="w-8 h-8 text-red-500" />, path: '/games' },
    { title: 'Pulsa', icon: <Smartphone className="w-8 h-8 text-red-500" />, path: '/pulsa' },
    { title: 'Paket Data', icon: <Wifi className="w-8 h-8 text-red-500" />, path: '/paket-data' },
    { title: 'E-Wallet', icon: <Wallet className="w-8 h-8 text-red-500" />, path: '/topup' },
    { title: 'Telegram', icon: <Send className="w-8 h-8 text-red-500" />, path: '/telegram' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-950 text-white">
      {/* Header */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Wallet className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl font-bold tracking-wider text-white">PayQRIS</h1>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-medium transition shadow-lg shadow-red-600/20"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-gray-300 hover:text-red-400 px-4 py-2 rounded-xl font-medium transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-medium transition shadow-lg shadow-red-600/20"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 px-4 tracking-tight">
            Platform Transaksi & Topup
            <span className="text-red-500"> Instan</span>
          </h2>
          <p className="text-sm md:text-lg text-gray-400 px-4 max-w-2xl mx-auto">
            Solusi cepat dan aman untuk kebutuhan Games, Pulsa, Paket Data, E-Wallet, hingga Telegram dalam satu genggaman.
          </p>
        </div>

        {/* Grid Menu Utama (Pengganti Tombol) */}
        <div className="max-w-5xl mx-auto px-2">
          <h3 className="text-lg md:text-xl font-bold text-white mb-6 px-2 border-l-4 border-red-500">
            Pilih Layanan Kami
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
            {productMenus.map((menu, index) => (
              <div
                key={index}
                onClick={() => navigate(menu.path)}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center cursor-pointer hover:bg-white/10 hover:border-red-500/50 transition-all duration-300 transform hover:-translate-y-1 shadow-xl flex flex-col items-center justify-center gap-3 group"
              >
                <div className="p-4 bg-red-500/10 rounded-2xl group-hover:bg-red-500/20 transition">
                  {menu.icon}
                </div>
                <span className="text-sm md:text-base font-semibold text-gray-200 group-hover:text-red-400 transition">
                  {menu.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mt-20">
          <FeatureCard
            icon={<Zap className="w-10 h-10 text-red-500" />}
            title="Proses Cepat"
            description="Transaksi otomatis diproses dalam hitungan detik setelah pembayaran berhasil."
          />
          <FeatureCard
            icon={<Shield className="w-10 h-10 text-red-500" />}
            title="Aman & Terpercaya"
            description="Didukung sistem keamanan berlapis dan metode pembayaran QRIS resmi."
          />
          <FeatureCard
            icon={<Wallet className="w-10 h-10 text-red-500" />}
            title="Layanan Lengkap"
            description="Tersedia berbagai pilihan produk digital terlengkap untuk kebutuhan harian Anda."
          />
        </div>

        {/* Supported E-Wallets */}
        <div className="mt-20">
          <h3 className="text-xl md:text-2xl font-bold text-white text-center mb-8 px-4">
            Didukung Oleh Berbagai Pembayaran & E-Wallet
          </h3>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 px-4">
            {['DANA', 'OVO', 'GoPay', 'ShopeePay', 'QRIS All Payment'].map((wallet) => (
              <div
                key={wallet}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-6 py-3 shadow-md"
              >
                <p className="text-sm md:text-base font-semibold text-gray-300">{wallet}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 border-t border-white/5 mt-20">
        <p>&copy; 2026 PayQRIS. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 hover:bg-white/10 transition">
      <div className="mb-4 p-3 bg-red-500/10 w-fit rounded-xl">{icon}</div>
      <h3 className="text-lg md:text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm md:text-gray-400 text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
};

export default LandingPage;
