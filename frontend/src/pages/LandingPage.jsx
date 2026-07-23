import { useNavigate } from 'react-router-dom';
import { QrCode, Zap, Shield, ArrowRight, LayoutDashboard, Gamepad2, Smartphone, Wifi, Wallet, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=1200&q=80"
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    setIsLoggedIn(!!userData);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const services = [
    { title: 'Games', icon: <Gamepad2 className="w-8 h-8 text-red-400" />, path: '/games' },
    { title: 'Pulsa', icon: <Smartphone className="w-8 h-8 text-red-400" />, path: '/pulsa' },
    { title: 'Paket Data', icon: <Wifi className="w-8 h-8 text-red-400" />, path: '/data' },
    { title: 'E-Wallet', icon: <Wallet className="w-8 h-8 text-red-400" />, path: '/topup' },
    { title: 'Telegram', icon: <Send className="w-8 h-8 text-red-400" />, path: '/telegram' },
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
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Jadi Reseller
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 px-4">
            Topup & Tagihan
            <span className="text-red-500"> Instant</span>
          </h2>
          <p className="text-base md:text-xl text-gray-300 mb-8 px-4">
            Platform transaksi digital terlengkap, cepat, dan otomatis dengan QRIS
          </p>

          {/* Image Slider */}
          <div className="relative w-full h-48 md:h-80 rounded-2xl overflow-hidden mb-12 shadow-2xl border border-white/10">
            {banners.map((banner, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img src={banner} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
              </div>
            ))}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === currentSlide ? 'bg-red-500 w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Daftar Layanan Tersedia */}
        <div className="mt-8 mb-16">
          <h3 className="text-xl md:text-2xl font-bold text-white text-center mb-6">
            Daftar Layanan Tersedia
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                onClick={() => navigate(service.path)}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 transition cursor-pointer flex flex-col items-center justify-center gap-3 transform hover:scale-105"
              >
                <div className="p-3 bg-red-500/10 rounded-xl">{service.icon}</div>
                <h4 className="text-white font-semibold text-base md:text-lg">{service.title}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Keunggulan Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-white">Keunggulan</h3>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          <FeatureCard
            icon={<Zap className="w-12 h-12 text-red-500" />}
            title="Proses Cepat"
            description="Transaksi otomatis diproses dalam hitungan detik setelah pembayaran"
          />
          <FeatureCard
            icon={<Shield className="w-12 h-12 text-red-500" />}
            title="Aman & Terpercaya"
            description="Sistem pembayaran QRIS resmi yang aman dan terverifikasi"
          />
          <FeatureCard
            icon={<QrCode className="w-12 h-12 text-red-500" />}
            title="Multi Layanan"
            description="Support berbagai kebutuhan digital dalam satu platform praktis"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-400 border-t border-white/10 mt-16">
        <p>&copy; 2026 Scan N Go. All rights reserved.</p>
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
