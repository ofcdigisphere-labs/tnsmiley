import { useNavigate } from 'react-router-dom';
import { Wallet, Zap, Shield, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    setIsLoggedIn(!!userData);
  }, []);

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
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 px-4">
            Topup E-Wallet
            <span className="text-purple-400"> Instant</span>
          </h2>
          <p className="text-base md:text-xl text-gray-300 mb-6 md:mb-8 px-4">
            Isi saldo DANA, OVO, GoPay, dan ShopeePay dengan mudah menggunakan QRIS
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/topup')}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg text-base md:text-lg font-semibold transition transform hover:scale-105"
            >
              Mulai Topup
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => navigate('/telegram')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg text-base md:text-lg font-semibold transition transform hover:scale-105"
            >
              Beli Telegram OLD
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
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
            title="Multi E-Wallet"
            description="Support DANA, OVO, GoPay, dan ShopeePay dalam satu platform"
          />
        </div>

        {/* Supported E-Wallets */}
        <div className="mt-16 md:mt-20">
          <h3 className="text-xl md:text-2xl font-bold text-white text-center mb-6 md:mb-8 px-4">
            E-Wallet yang Didukung
          </h3>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 px-4">
            {['DANA', 'OVO', 'GoPay', 'ShopeePay'].map((wallet) => (
              <div
                key={wallet}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-8 py-4"
              >
                <p className="text-xl font-semibold text-white">{wallet}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-400 border-t border-white/10">
        <p>&copy; 2024 PayQRIS. All rights reserved.</p>
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
