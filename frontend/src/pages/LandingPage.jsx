import { useNavigate } from 'react-router-dom';
import { Wallet, Shield, Sparkles, Gamepad2, PhoneCall, Wifi, CreditCard, MessageSquare } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const categories = [
    { title: 'Games', icon: <Gamepad2 className="w-8 h-8 text-red-400" />, path: '/games', desc: 'Top Up Game Populer' },
    { title: 'Pulsa', icon: <PhoneCall className="w-8 h-8 text-red-400" />, path: '/pulsa', desc: 'Isi Pulsa All Operator' },
    { title: 'Paket Data', icon: <Wifi className="w-8 h-8 text-red-400" />, path: '/data', desc: 'Kuota Internet Murah' },
    { title: 'E-Wallet', icon: <CreditCard className="w-8 h-8 text-red-400" />, path: '/topup', desc: 'DANA, OVO, GoPay, Shopee' },
    { title: 'Telegram', icon: <MessageSquare className="w-8 h-8 text-red-400" />, path: '/telegram', desc: 'Akun & Kebutuhan Telegram' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 text-white">
      {/* Header */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Wallet className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl font-bold tracking-wider">PayQRIS</h1>
          </div>
          <div>
            <button
              onClick={() => navigate('/register')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-semibold transition shadow-lg shadow-red-600/30"
            >
              Reseller
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-10 pb-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <span className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" /> Platform Transaksi Digital Terlengkap & Instant
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
            Layanan Digital Dalam <span className="text-red-500">Satu genggaman</span>
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
            Pilih kategori produk digital yang kamu butuhkan dan nikmati proses otomatis dalam hitungan detik.
          </p>
        </div>

        {/* Modern Grid List Menu */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 max-w-6xl mx-auto">
          {categories.map((cat, index) => (
            <div
              key={index}
              onClick={() => navigate(cat.path)}
              className="bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-red-500/50 rounded-2xl p-5 md:p-6 text-center cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 shadow-xl group flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                {cat.title}
              </h3>
              <p className="text-xs text-gray-400 line-clamp-2">
                {cat.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Features Info Section */}
        <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto mt-20 pt-16 border-t border-white/10">
          <div className="flex items-start gap-4 p-4">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Proses Instant</h4>
              <p className="text-sm text-gray-400">Sistem otomatis beroperasi 24 jam tanpa jeda.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Aman & Terpercaya</h4>
              <p className="text-sm text-gray-400">Dilindungi enkripsi sistem pembayaran QRIS resmi.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Harga Bersaing</h4>
              <p className="text-sm text-gray-400">Cocok untuk penggunaan pribadi maupun dijual kembali.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 text-sm border-t border-white/5">
        <p>&copy; {new Date().getFullYear()} PayQRIS. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
