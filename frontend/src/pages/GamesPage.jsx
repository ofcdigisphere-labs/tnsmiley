import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, ArrowLeft, Loader2, CreditCard, Coins } from 'lucide-react';
import toast from 'react-hot-toast';
import { topupAPI } from '../services/api'; // Anda bisa sesuaikan dengan gamesAPI jika ada di api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const GAMES = [
  { 
    id: 'mobile-legends', 
    name: 'Mobile Legends', 
    color: 'from-blue-600 to-indigo-600',
    logo: 'https://placehold.co/100x100/blue/white?text=MLBB', // Ganti dengan URL logo resmi game
    needZoneId: true 
  },
  { 
    id: 'free-fire', 
    name: 'Free Fire', 
    color: 'from-amber-500 to-orange-600',
    logo: 'https://placehold.co/100x100/orange/white?text=FF',
    needZoneId: false 
  },
  { 
    id: 'pubg-mobile', 
    name: 'PUBG Mobile', 
    color: 'from-yellow-600 to-amber-700',
    logo: 'https://placehold.co/100x100/yellow/white?text=PUBG',
    needZoneId: false 
  },
  { 
    id: 'genshin-impact', 
    name: 'Genshin Impact', 
    color: 'from-sky-500 to-blue-700',
    logo: 'https://placehold.co/100x100/sky/white?text=GI',
    needZoneId: true 
  },
  { 
    id: 'valorant', 
    name: 'Valorant', 
    color: 'from-rose-500 to-red-600',
    logo: 'https://placehold.co/100x100/red/white?text=VAL',
    needZoneId: false 
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
    gameId: '',
    selectedProduct: null,
    userIdGame: '',
    zoneId: '',
    email: '',
  });

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const selectGame = async (game) => {
    setFormData({ ...formData, gameId: game.id });
    setLoading(true);
    
    try {
      // Menggunakan API endpoint produk game (bisa disesuaikan dengan backend Anda)
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
    
    // If user is logged in, show payment method selection
    if (user) {
      setStep(3);
    } else {
      // Guest user, go directly to detail form
      setPaymentMethod('qris');
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.userIdGame) {
      toast.error('User ID Game harus diisi');
      return;
    }

    const currentGame = GAMES.find(g => g.id === formData.gameId);
    if (currentGame?.needZoneId && !formData.zoneId) {
      toast.error('Zone ID / Server ID harus diisi');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        productCode: formData.selectedProduct.productCode,
        productName: formData.selectedProduct.productName,
        amount: formData.selectedProduct.amount,
        targetAccount: currentGame?.needZoneId 
          ? `${formData.userIdGame} (${formData.zoneId})` 
          : formData.userIdGame,
        email: formData.email
      };

      if (paymentMethod === 'balance') {
        payload.userId = user.userId;

        const response = await axios.post(`${API_URL}/api/topup/create-with-balance`, payload);
        
        if (response.data.success) {
          const result = response.data.data;
          
          if (result.status === 'completed') {
            toast.success('✅ Topup Game berhasil!');
            
            const updatedUser = { ...user, balance: result.newBalance };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          } else if (result.status === 'failed') {
            toast.error('❌ Topup gagal. Saldo telah dikembalikan.');
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
      toast.error(error.response?.data?.message || 'Gagal membuat order game');
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

  const selectedGame = GAMES.find(g => g.id === formData.gameId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={goBack}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Topup Games</h1>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto mb-8 px-2">
          <div className="flex items-center justify-between">
            {(user ? [1, 2, 3, 4] : [1, 2, 3]).map((num) => (
              <div key={num} className="flex items-center flex-1 last:flex-initial">
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition ${
                    step >= num
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {num}
                </div>
                {((user && num < 4) || (!user && num < 3)) && (
                  <div
                    className={`flex-1 h-1 mx-1 md:mx-2 ${
                      step > num ? 'bg-purple-600' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs md:text-sm">
            <span className={`${step >= 1 ? 'text-white' : 'text-gray-400'} w-1/4 md:w-auto text-center md:text-left`}>
              Game
            </span>
            <span className={`${step >= 2 ? 'text-white' : 'text-gray-400'} w-1/4 md:w-auto text-center`}>
              Nominal
            </span>
            {user && (
              <span className={`${step >= 3 ? 'text-white' : 'text-gray-400'} w-1/4 md:w-auto text-center`}>
                Metode
              </span>
            )}
            <span className={`${step >= (user ? 4 : 3) ? 'text-white' : 'text-gray-400'} w-1/4 md:w-auto text-center md:text-right`}>
              Detail Akun
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Select Game */}
          {step === 1 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {GAMES.map((game) => (
                <button
                  key={game.id}
                  onClick={() => selectGame(game)}
                  disabled={loading}
                  className="aspect-square bg-white/10 backdrop-blur-lg border-2 border-white/20 hover:border-purple-400 rounded-2xl p-6 transition transform hover:scale-105 disabled:opacity-50 group"
                >
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <img 
                      src={game.logo} 
                      alt={game.name}
                      className="w-20 h-20 object-contain rounded-xl"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className={`hidden w-20 h-20 bg-gradient-to-br ${game.color} rounded-xl items-center justify-center`}
                    >
                      <span className="text-white font-bold text-xl">
                        {game.name.charAt(0)}
                      </span>
                    </div>
                    <p className="text-white font-semibold text-center text-sm md:text-base group-hover:text-purple-300 transition">
                      {game.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Select Nominal */}
          {step === 2 && (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Pilih Nominal {selectedGame?.name}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
                  <button
                    key={product.productCode}
                    onClick={() => selectNominal(product)}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-6 text-left transition"
                  >
                    <p className="text-white font-semibold text-lg mb-1">
                      {product.label}
                    </p>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {product.productName}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Payment Method (Only for logged in users) */}
          {step === 3 && user && (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-2">Pilih Metode Pembayaran</h2>
              <p className="text-gray-400 mb-6">Saldo Anda: Rp {(user.balance || 0).toLocaleString('id-ID')}</p>
              
              <div className="grid gap-4">
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
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:opacity-50 p-6 rounded-xl text-white transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <Coins className="w-10 h-10" />
                    <div className="text-left">
                      <p className="font-bold text-xl">Saldo</p>
                      <p className="text-sm opacity-90">Bayar menggunakan saldo akun</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-75">Saldo Anda</p>
                    <p className="font-bold text-lg">Rp {(user.balance || 0).toLocaleString('id-ID')}</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setPaymentMethod('qris');
                    setStep(4);
                  }}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 p-6 rounded-xl text-white transition flex items-center gap-4"
                >
                  <CreditCard className="w-10 h-10" />
                  <div className="text-left">
                    <p className="font-bold text-xl">QRIS</p>
                    <p className="text-sm opacity-90">Bayar dengan scan QR code</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Input Game ID Details */}
          {((step === 4 && user) || (step === 3 && !user)) && (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Detail Tujuan Game</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-gray-400 text-sm">Game</p>
                  <p className="text-white font-semibold text-lg">{selectedGame?.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Item / Nominal</p>
                  <p className="text-white font-semibold text-lg">{formData.selectedProduct?.productName}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Harga</p>
                  <p className="text-white font-semibold text-lg">Rp {formData.selectedProduct?.amount.toLocaleString('id-ID')}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {paymentMethod === 'balance' && (
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-4">
                    <p className="text-yellow-300 text-sm">
                      ⚠️ Saldo sebesar <strong>Rp {formData.selectedProduct?.amount.toLocaleString('id-ID')}</strong> akan dipotong.
                    </p>
                  </div>
                )}

                <div className={selectedGame?.needZoneId ? "grid grid-cols-2 gap-4" : ""}>
                  <div>
                    <label className="block text-white mb-2">User ID *</label>
                    <input
                      type="text"
                      value={formData.userIdGame}
                      onChange={(e) => setFormData({ ...formData, userIdGame: e.target.value })}
                      placeholder="Masukkan User ID"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  {selectedGame?.needZoneId && (
                    <div>
                      <label className="block text-white mb-2">Zone ID / Server *</label>
                      <input
                        type="text"
                        value={formData.zoneId}
                        onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                        placeholder="Contoh: 1234"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-white mb-2">Email (Opsional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    paymentMethod === 'balance' ? 'Proses Topup Game' : 'Lanjut Pembayaran'
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
