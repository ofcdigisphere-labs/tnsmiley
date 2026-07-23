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
    { title: 'Games', icon: <Gamepad2 className="w-8 h-8 text-red-400" />, path: '/topup' },
    { title: 'Pulsa', icon: <Smartphone className="w-8 h-8 text-red-400" />, path: '/topup' },
    { title: 'Paket Data', icon: <Wifi className="w-8 h-8 text-red-400" />, path: '/topup' },
    { title: 'E-Wallet', icon: <Wallet className="w-8 h-8 text-red-400" />, path: '/topup' },
    { title: 'Telegram OLD', icon: <Send className="w-8 h-8 text-red-400" />, path: '/telegram' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950">
      {/* Header */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl font-bold text-white tracking-wider">Scan N Go</h1>
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
              <button
                onClick={() => navigate('/register')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-medium transition shadow-lg shadow-red-600/20"
              >
                Jadi Reseller
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 md:mb-6 px-4 tracking-tight">
            Topup & Layanan Digital
            <span className="text-red-500 block sm:inline"> Instant</span>
          </h2>
          <p className="text-base md:text-xl text-gray-300 mb-8 md:mb-10 px-4">
            Platform transaksi digital terlengkap, cepat, dan aman dengan pembayaran QRIS
          </p>
        </div>

        {/* Daftar Layanan Tersedia */}
        <div className="mt-6 mb-16">
          <h3 className="text-xl md:text-2xl font-bold text-white text-center mb-6 md:mb-8 tracking-wide">
            Daftar Layanan Tersedia
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 max-w-5xl mx-auto px-2">
            {services.map((service, index) => (
              <div
                key={index}
                onClick={() => navigate(service.path)}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 hover:border-red-500/50 transition duration-300 cursor-pointer group flex flex-col items-center justify-center gap-3 shadow-xl"
              >
                <div className="p-4 bg-red-500/10 rounded-2xl group-hover:scale-110 transition duration-300">
                  {service.icon}
                </div>
                <p className="text-sm md:text-base font-semibold text-white tracking-wide">{service.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Keunggulan Section Heading */}
        <div className="mt-20 mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-white text-center tracking-wide">
            Keunggulan
          </h3>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={<Zap className="w-10 h-10 text-red-500" />}
            title="Proses Cepat"
            description="Transaksi otomatis diproses dalam hitungan detik setelah pembayaran berhasil."
          />
          <FeatureCard
            icon={<Shield className="w-10 h-10 text-red-500" />}
            title="Aman & Terpercaya"
            description="Sistem pembayaran QRIS resmi yang aman, terjamin, dan terverifikasi."
          />
          <FeatureCard
            icon={<QrCode className="w-10 h-10 text-red-500" />}
            title="Multi Layanan"
            description="Mendukung berbagai macam kebutuhan digital dalam satu platform praktis."
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 border-t border-white/10 mt-20">
        <p>&copy; 2026 Scan N Go. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 hover:bg-white/10 transition duration-300 shadow-xl">
      <div className="mb-4 inline-block p-3 bg-red-500/10 rounded-xl">{icon}</div>
      <h3 className="text-lg md:text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm md:text-base text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
};

export default LandingPage;
