import { useNavigate } from 'react-router-dom';
import { QrCode, Zap, Shield, ArrowRight, LayoutDashboard, Gamepad2, Smartphone, Wifi, Wallet, Send, Megaphone } from 'lucide-react';
import { useEffect, useState } from 'react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80"
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    setIsLoggedIn(!!userData);

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
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition shadow-lg shadow-red-600/30"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate('/register')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition shadow-lg shadow-red-600/30"
              >
                Jadi Reseller
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        {/* Banner Slider 16:9 */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/40">
            {banners.map((banner, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img src={banner} alt="Promo Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              </div>
            ))}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide ? 'bg-red-500 w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 px-4">
            Topup & Transaksi
            <span className="text-red-500"> Instant</span>
          </h2>
          <p className="text-base md:text-xl text-gray-300 mb-10 px-4">
            Solusi lengkap pembayaran digital, Games, Pulsa, dan E-Wallet dalam satu genggaman.
          </p>
        </div>

        {/* Daftar Layanan Tersedia (Grid) */}
        <div className="max-w-5xl mx-auto mt-8">
          <h3 className="text-xl md:text-2xl font-bold text-white text-center mb-6 px-4">
            Daftar Layanan Tersedia
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 px-4">
            {services.map((item, index) => (
              <div
                key={index}
                onClick={() => navigate(item.path)}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-red-600/20 hover:border-red-500/50 transition-all transform hover:scale-105 shadow-xl group"
              >
                <div className="p-4 rounded-xl bg-white/5 mb-3 group-hover:bg-red-500/20 transition">
                  {item.icon}
                </div>
                <h4 className="text-white font-semibold text-base md:text-lg">{item.title}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Keunggulan */}
        <div className="max-w-6xl mx-auto mt-24">
          <h3 className="text-xl md:text-2xl font-bold text-white text-center mb-10 px-4">
            Keunggulan
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 px-4">
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
              icon={<Megaphone className="w-12 h-12 text-red-500" />}
              title="Layanan Lengkap"
              description="Support berbagai produk digital mulai dari Games hingga E-Wallet"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-400 border-t border-white/10 mt-20">
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
