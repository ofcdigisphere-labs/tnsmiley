import { useNavigate } from 'react-router-dom';
import { Wallet, Shield, Gamepad2, Smartphone, Wifi, Send, LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    setIsLoggedIn(!!userData);
  }, []);

  // Daftar produk/kategori dengan gaya grid modern terinspirasi referensi
  const categories = [
    {
      title: 'Games',
      description: 'Topup game populer instan',
      icon: <Gamepad2 className="w-8 h-8 text-red-400" />,
      path: '/games',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'Pulsa',
      description: 'Isi pulsa semua operator',
      icon: <Smartphone className="w-8 h-8 text-red-400" />,
      path: '/pulsa',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'Paket Data',
      description: 'Internet murah & cepat',
      icon: <Wifi className="w-8 h-8 text-red-400" />,
      path: '/data',
      image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'E-Wallet',
      description: 'DANA, OVO, GoPay, ShopeePay',
      icon: <Wallet className="w-8 h-8 text-red-400" />,
      path: '/topup',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'Telegram',
      description: 'Beli akun Telegram & Layanan',
      icon: <Send className="w-8 h-8 text-red-400" />,
      path: '/telegram',
      image: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=500&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 text-white">
      {/* Header */}
      <nav className="container mx-auto px-4 py-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Wallet className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl font-bold tracking-wider">Scan N Go</h1>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl transition shadow-lg shadow-red-600/30"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate('/register')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium transition shadow-lg shadow-red-600/30"
              >
                Jadi Reseller
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content / Grid Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            Pilih Layanan <span className="text-red-500">Favoritmu</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base">
            Platform transaksi digital terlengkap, cepat, dan otomatis dengan QRIS
          </p>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => navigate(cat.path)}
              className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:bg-white/10 hover:border-red-500/50 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 shadow-xl"
            >
              <div>
                <div className="relative h-32 md:h-36 rounded-xl overflow-hidden mb-4 bg-slate-900">
                  <img 
                    src={cat.image} 
                    alt={cat.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500 opacity-80 group-hover:opacity-100" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-2 left-2 p-2 bg-slate-900/80 backdrop-blur-md rounded-lg border border-white/10">
                    {cat.icon}
                  </div>
                </div>
                <h3 className="font-bold text-base md:text-lg text-white group-hover:text-red-400 transition">
                  {cat.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                  {cat.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-red-400 font-medium">
                <span>Buka Layanan</span>
                <span className="transform group-hover:translate-x-1 transition">&rarr;</span>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Highlights Minimalist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-start gap-4">
            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Transaksi 24/7 Otomatis</h4>
              <p className="text-sm text-gray-400">Semua pesanan diproses langsung detik ini juga setelah pembayaran terkonfirmasi.</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-start gap-4">
            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Metode QRIS Resmi</h4>
              <p className="text-sm text-gray-400">Mendukung seluruh aplikasi perbankan dan e-wallet berstandar QRIS Indonesia.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-xs md:text-sm text-gray-500 border-t border-white/10 mt-12">
        <p>&copy; 2026 Scan N Go. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
