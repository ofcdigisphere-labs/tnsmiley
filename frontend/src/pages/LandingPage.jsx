import { useNavigate } from 'react-router-dom';
import { QrCode, Zap, Shield, ArrowRight, LayoutDashboard, Gamepad2, Smartphone, Wifi, Wallet, MessageSquare, Store, CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // State untuk angka transaksi acak
  const [stats, setStats] = useState({
    successTx: 0,
    failedTx: 0
  });

  const heroBanners = [
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80"
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    setIsLoggedIn(!!userData);

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 3500);

    // Generator angka acak untuk transaksi sukses (1.833 - 7.373) dan gagal/batal (500 - 1.000)
    const randomSuccess = Math.floor(Math.random() * (7373 - 1833 + 1)) + 1833;
    const randomFailed = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;
    
    setStats({
      successTx: randomSuccess.toLocaleString('id-ID'),
      failedTx: randomFailed.toLocaleString('id-ID')
    });

    return () => clearInterval(timer);
  }, [heroBanners.length]);

  const serviceCategories = [
    { title: 'Games', icon: <Gamepad2 className="w-8 h-8 text-red-400" />, path: '/games', desc: 'Topup Voucher Game' },
    { title: 'Pulsa', icon: <Smartphone className="w-8 h-8 text-red-400" />, path: '/pulsa', desc: 'Semua Operator Seluler' },
    { title: 'Paket Data', icon: <Wifi className="w-8 h-8 text-red-400" />, path: '/internet', desc: 'Internet & Kuota Murah' },
    { title: 'E-Wallet', icon: <Wallet className="w-8 h-8 text-red-400" />, path: '/topup', desc: 'DANA, OVO, GoPay, dll' },
    { title: 'Telegram', icon: <MessageSquare className="w-8 h-8 text-red-400" />, path: '/telegram', desc: 'Akun Luar Negri' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 text-white">
      {/* Header */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/10 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <QrCode className="w-7 h-7 text-red-500" />
            <h1 className="text-xl font-extrabold tracking-wider text-white">Scan N Go</h1>
          </div>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-lg shadow-red-600/30"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-lg shadow-red-600/30"
              >
                <Store className="w-4 h-4" />
                Jadi Reseller
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content (Mobile Optimized) */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        
        {/* Banner Slider 16:9 */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl mb-8 border border-white/10 bg-slate-900">
          {heroBanners.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              }`}
            >
              <img src={img} alt={`Banner ${idx + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs font-medium bg-red-600/90 text-white px-2.5 py-1 rounded-md backdrop-blur-sm">
                  Selamat datang di SNG
                </span>
              </div>
            </div>
          ))}
          <div className="absolute bottom-3 right-3 flex gap-1.5 z-10">
            {heroBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all ${idx === currentSlide ? 'w-6 bg-red-500' : 'w-1.5 bg-white/40'}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Layanan Tersedia Section */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-white mb-4 px-1 flex items-center justify-between">
            <span>Daftar Layanan Tersedia</span>
            <span className="text-xs font-normal text-red-400">Pilih & Klik Menu</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {serviceCategories.map((item, index) => (
              <div
                key={index}
                onClick={() => navigate(item.path)}
                className="bg-white/5 hover:bg-white/15 active:scale-95 border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer transition shadow-md group"
              >
                <div className="p-3 bg-red-500/10 rounded-xl mb-3 group-hover:bg-red-500/20 transition">
                  {item.icon}
                </div>
                <h4 className="font-bold text-sm text-white mb-1">{item.title}</h4>
                <p className="text-[11px] text-gray-400 leading-tight">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Status Statistik Transaksi (Baru) */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-white mb-4 px-1">Statistik Transaksi Hari Ini</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Berhasil */}
            <div className="bg-white/5 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400">Berhasil</p>
                <h4 className="font-extrabold text-lg text-emerald-400">{stats.successTx}</h4>
              </div>
            </div>

            {/* Gagal / Batal */}
            <div className="bg-white/5 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400 shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400">Gagal / Batal</p>
                <h4 className="font-extrabold text-lg text-rose-400">{stats.failedTx}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Keunggulan Section */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-white mb-4 px-1">Keunggulan</h3>
          <div className="grid grid-cols-1 gap-3">
            <FeatureCard
              icon={<Zap className="w-7 h-7 text-red-400" />}
              title="Proses Cepat"
              description="Transaksi otomatis diproses dalam hitungan detik setelah pembayaran"
            />
            <FeatureCard
              icon={<Shield className="w-7 h-7 text-red-400" />}
              title="Aman & Terpercaya"
              description="Sistem pembayaran QRIS resmi yang aman dan terverifikasi"
            />
            <FeatureCard
              icon={<QrCode className="w-7 h-7 text-red-400" />}
              title="Multi Layanan"
              description="Games, pulsa, paket data, dan e-wallet lengkap dalam satu genggaman"
            />
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-400 bg-slate-950/50">
        <p>&copy; 2026 Scan N Go. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-4">
      <div className="p-2 bg-red-500/10 rounded-lg shrink-0">{icon}</div>
      <div>
        <h4 className="font-bold text-sm text-white mb-1">{title}</h4>
        <p className="text-xs text-gray-300 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default LandingPage;
