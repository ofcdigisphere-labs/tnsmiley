import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, ArrowLeft, Loader2, CreditCard, Coins } from 'lucide-react';
import toast from 'react-hot-toast';
import { topupAPI } from '../services/api'; // Sesuaikan jika Anda punya gamesAPI khusus
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Daftar Game (Bisa disesuaikan dengan produk game Anda)
const GAMES = [
  { 
    id: 'mobile-legends', 
    name: 'Mobile Legends', 
    publisher: 'Moonton',
    color: 'from-blue-600 to-indigo-700', 
    logo: 'https://cdn1.codashop.com/S/content/common/images/mkt-default/MLBB_Square_Thumbnail.jpg' 
  },
  { 
    id: 'free-fire', 
    name: 'Free Fire', 
    publisher: 'Garena',
    color: 'from-orange-500 to-amber-600', 
    logo: 'https://cdn1.codashop.com/S/content/common/images/mkt-default/ff-square.jpg' 
  },
  { 
    id: 'pubg-mobile', 
    name: 'PUBG Mobile', 
    publisher: 'Level Infinite',
    color: 'from-yellow-600 to-amber-700', 
    logo: 'https://cdn1.codashop.com/S/content/common/images/mkt-default/pubg-square.jpg' 
  },
  { 
    id: 'genshin-impact', 
    name: 'Genshin Impact', 
    publisher: 'HoYoverse',
    color: 'from-blue-500 to-cyan-600', 
    logo: 'https://cdn1.codashop.com/S/content/common/images/mkt-default/Genshin_Square.jpg' 
  },
  { 
    id: 'valorant', 
    name: 'Valorant', 
    publisher: 'Riot Games',
    color: 'from-red-600 to-rose-700', 
    logo: 'https://cdn1.codashop.com/S/content/common/images/mkt-default/VALORANT_Square_Thumbnail.jpg' 
  },
];

const GamesPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null); // 'qris' or 'balance'
  
  const [formData, setFormData] = useState({
    gameType: '',
    selectedProduct: null,
    userIdTarget: '', // User ID Game
    zoneIdTarget: '', // Server / Zone ID (Opsional untuk beberapa game)
    email: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const selectGame = async (game) => {
    setFormData({ ...formData, gameType: game.id });
    setLoading(true);
    try {
      // Mengambil produk berdasarkan game yang dipilih (menggunakan endpoint API yang ada)
      const response = await topupAPI.getProducts(game.id);
      setProducts(response.data.data);
      setStep(2);
    } catch (error) {
      toast.error('Gagal memuat produk game');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const selectNominal = (product) => {
    setFormData({ ...formData, selectedProduct: product });
    if (user) {
      setStep(3);
    } else {
      setPaymentMethod('qris');
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userIdTarget) {
      toast.error('User ID Game harus diisi');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        productCode: formData.selectedProduct.productCode,
        productName: formData.selectedProduct.productName,
        amount: formData.selectedProduct.amount,
        // Menggabungkan User ID dan Zone ID jika ada
        targetId: formData.zoneIdTarget 
          ? `${formData.userIdTarget} (${formData.zoneIdTarget})` 
          : formData.userIdTarget,
        email: formData.email
      };

      if (paymentMethod === 'balance') {
        payload.userId = user.userId;
        const response = await axios.post(`${API_URL}/api/topup/create-with-balance`, payload);
        
        if (response.data.success) {
          const result = response.data.data;
          if (result.status === 'completed') {
            toast.success('✅ Pembelian game berhasil!');
            const updatedUser = { ...user, balance: result.newBalance };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          } else if (result.status === 'failed') {
            toast.error('❌ Transaksi gagal. Saldo telah dikembalikan.');
            navigate('/dashboard');
          }
        }
      } else {
        const response = await topupAPI.createTopup(payload);
        if (response.data.success) {
          toast.success('Order game berhasil dibuat!');
          sessionStorage.setItem('orderData', JSON.stringify(response.data.data));
          navigate(`/payment/${response.data.data.orderId}`);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memproses transaksi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/');
    }
  };

  const selectedGame = GAMES.find(g => g.id === formData.gameType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 text-white">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={goBack} 
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-7 h-7 text-red-500" />
            <h1 className="text-xl font-bold text-white">Topup Games</h1>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 px-1">
          <div className="flex items-center justify-between">
            {(user ? [1, 2, 3, 4] : [1, 2, 3]).map((num) => (
              <div key={num} className="flex items-center flex-1 last:flex-initial">
                <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition ${
                  step >= num 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                    : 'bg-white/5 border border-white/10 text-gray-400'
                }`}>
                  {num}
                </div>
                {((user && num < 4) || (!user && num < 3)) && (
                  <div className={`flex-1 h-1 mx-1 sm:mx-2 rounded-full ${
                    step > num ? 'bg-red-600' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[11px] sm:text-xs">
            <span className={`${step >= 1 ? 'text-white font-medium' : 'text-gray-400'} text-center`}>Game</span>
            <span className={`${step >= 2 ? 'text-white font-medium' : 'text-gray-400'} text-center`}>Nominal</span>
            {user && (
              <span className={`${step >= 3 ? 'text-white font-medium' : 'text-gray-400'} text-center`}>Metode</span>
            )}
            <span className={`${step >= (user ? 4 : 3) ? 'text-white font-medium' : 'text-gray-400'} text-center`}>Detail ID</span>
          </div>
        </div>

        {/* Content */}
        <div>
          {/* Step 1: Select Game */}
          {step === 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {GAMES.map((game) => (
                <button
                  key={game.id}
                  onClick={() => selectGame(game)}
                  disabled={loading}
                  className="bg-white/5 hover:bg-white/15 active:scale-95 border border-white/10 hover:border-red-500/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition shadow-md group disabled:opacity-50"
                >
                  <div className="relative mb-3">
                    <img 
                      src={game.logo} 
                      alt={game.name} 
                      className="w-14 h-14 object-cover rounded-xl shadow-inner"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className={`hidden w-14 h-14 bg-gradient-to-br ${game.color} rounded-xl items-center justify-center`}>
                      <span className="text-white font-bold text-lg">{game.name.charAt(0)}</span>
                    </div>
                  </div>
                  <p className="font-bold text-sm text-white group-hover:text-red-400 transition line-clamp-1">{game.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{game.publisher}</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Select Nominal */}
          {step === 2 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-md">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Pilih Item / Nominal {selectedGame?.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map((product) => (
                  <button
                    key={product.productCode}
                    onClick={() => selectNominal(product)}
                    className="bg-white/5 hover:bg-white/15 active:scale-98 border border-white/10 hover:border-red-500/50 rounded-xl p-4 text-left transition group"
                  >
                    <p className="font-bold text-sm sm:text-base text-white group-hover:text-red-400 mb-1">
                      {product.label}
                    </p>
                    <p className="text-gray-400 text-xs line-clamp-2">{product.productName}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Payment Method (Only for logged in users) */}
          {step === 3 && user && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-md">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-1">Pilih Metode Pembayaran</h2>
              <p className="text-xs sm:text-sm text-gray-400 mb-5">Saldo Anda: Rp {(user.balance || 0).toLocaleString('id-ID')}</p>
              
              <div className="grid gap-3">
                <button
                  onClick={() => {
                    if ((user.balance || 0) < formData.selectedProduct.amount) {
                      toast.error('Saldo tidak cukup! Gunakan QRIS untuk pembayaran.');
                      return;
                    }
                    setPaymentMethod('balance');
                    setStep(4);
                  }}
                  disabled={(user.balance || 0) < formData.selectedProduct.amount}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-700 disabled:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed p-4 rounded-xl text-white transition flex items-center justify-between shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <Coins className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm sm:text-base">Saldo Akun</p>
                      <p className="text-[11px] sm:text-xs opacity-90">Potong saldo instan</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] sm:text-xs opacity-75">Tersedia</p>
                    <p className="font-bold text-xs sm:text-sm">Rp {(user.balance || 0).toLocaleString('id-ID')}</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setPaymentMethod('qris');
                    setStep(4);
                  }}
                  className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 p-4 rounded-xl text-white transition flex items-center gap-3 shadow-lg shadow-red-600/20"
                >
                  <div className="p-2 bg-white/10 rounded-lg">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm sm:text-base">QRIS Instant</p>
                    <p className="text-[11px] sm:text-xs opacity-90">Scan QR code via semua e-wallet/bank</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 4 (Logged in) OR Step 3 (Guest): Input Target ID Game */}
          {((step === 4 && user) || (step === 3 && !user)) && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-md">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Masukkan Tujuan Akun Game</h2>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 mb-5">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-400">Game</span>
                  <span className="text-white font-semibold">{selectedGame?.name}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-400">Item</span>
                  <span className="text-white font-semibold text-right max-w-[200px] truncate">
                    {formData.selectedProduct?.productName}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm border-t border-white/10 pt-2">
                  <span className="text-gray-400">Total Harga</span>
                  <span className="text-red-400 font-bold">
                    Rp {formData.selectedProduct?.amount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {paymentMethod === 'balance' && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-300 text-xs flex items-center gap-2">
                    <span>⚠️ Saldo akun sebesar <strong>Rp {formData.selectedProduct?.amount.toLocaleString('id-ID')}</strong> akan langsung dipotong.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">
                      User ID *
                    </label>
                    <input
                      type="text"
                      value={formData.userIdTarget}
                      onChange={(e) => setFormData({ ...formData, userIdTarget: e.target.value })}
                      placeholder="Contoh: 12345678"
                      className="w-full bg-white/5 border border-white/10 focus:border-red-500 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">
                      Server / Zone ID (Opsional)
                    </label>
                    <input
                      type="text"
                      value={formData.zoneIdTarget}
                      onChange={(e) => setFormData({ ...formData, zoneIdTarget: e.target.value })}
                      placeholder="Contoh: 1234"
                      className="w-full bg-white/5 border border-white/10 focus:border-red-500 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">
                    Email (Opsional - untuk bukti transaksi)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full bg-white/5 border border-white/10 focus:border-red-500 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 active:scale-98 text-white font-semibold py-3.5 rounded-xl text-sm transition shadow-lg shadow-red-600/30 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>{paymentMethod === 'balance' ? 'Proses Topup Game' : 'Lanjut ke Pembayaran QRIS'}</span>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default GamesPage;
