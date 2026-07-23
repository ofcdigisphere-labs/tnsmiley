import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowLeft, Loader2, CreditCard, Coins } from 'lucide-react';
import toast from 'react-hot-toast';
import { topupAPI } from '../services/api';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EWALLETS = [
  { 
    id: 'dana', 
    name: 'DANA', 
    color: 'from-blue-500 to-blue-600',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRR1DD_m4UxYnCD2DmrYfY63PYHsU1AdHcWnFw1MY6sE6u1KO7l0d3YiGo&s=10'
  },
  { 
    id: 'ovo', 
    name: 'OVO', 
    color: 'from-purple-500 to-purple-600',
    logo: 'https://play-lh.googleusercontent.com/5S2rYbdnZMc9V_6kPHMuh7aJf9tKh129v9qTRqVSRzWhtmS7T0DUZdeBKyyuFENlz441cAKv7D4UjKcwMGTE=w240-h480-rw'
  },
  { 
    id: 'gopay', 
    name: 'GoPay', 
    color: 'from-green-500 to-green-600',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRcMWMHGDkwaNjoAKJDlYlMY6QwZf_Q-jM6gFGN3MAFoR2dSCqBpGe4A4&s=10'
  },
  { 
    id: 'shopeepay', 
    name: 'ShopeePay', 
    color: 'from-orange-500 to-orange-600',
    logo: 'https://down-id.img.susercontent.com/file/bcf694cb47d49bb4cf93b0ac030bd94b'
  },
  { 
    id: 'linkaja', 
    name: 'LinkAja', 
    color: 'from-red-500 to-red-600',
    logo: 'https://play-lh.googleusercontent.com/JVSLi2Jl1coXG1lRELydI3RlALoqL9QrrHDy6-_0BoF-KTzpsTy4r6P8206iDkn2S5tqEKBstY8zUYHbAlYmJg'
  },
];

const TopupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null); // 'qris' or 'balance'
  
  const [formData, setFormData] = useState({
    ewalletType: '',
    selectedProduct: null,
    phoneNumber: '',
    email: '',
  });

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const selectEwallet = async (ewallet) => {
    setFormData({ ...formData, ewalletType: ewallet.id });
    setLoading(true);
    
    try {
      const response = await topupAPI.getProducts(ewallet.id);
      setProducts(response.data.data);
      setStep(2);
    } catch (error) {
      toast.error('Gagal memuat produk');
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
    
    if (!formData.phoneNumber) {
      toast.error('Nomor HP harus diisi');
      return;
    }

    if (formData.phoneNumber.length < 10) {
      toast.error('Nomor HP tidak valid');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        productCode: formData.selectedProduct.productCode,
        productName: formData.selectedProduct.productName,
        amount: formData.selectedProduct.amount,
        phoneNumber: formData.phoneNumber,
        email: formData.email
      };

      if (paymentMethod === 'balance') {
        // Pay with balance
        payload.userId = user.userId;

        const response = await axios.post(`${API_URL}/api/topup/create-with-balance`, payload);
        
        if (response.data.success) {
          const result = response.data.data;
          
          if (result.status === 'completed') {
            toast.success('✅ Topup berhasil!');
            
            // Update user balance in localStorage
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
        // Pay with QRIS
        const response = await topupAPI.createTopup(payload);
        
        if (response.data.success) {
          toast.success('Order berhasil dibuat!');
          sessionStorage.setItem('orderData', JSON.stringify(response.data.data));
          navigate(`/payment/${response.data.data.orderId}`);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membuat order');
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

  const selectedEwallet = EWALLETS.find(e => e.id === formData.ewalletType);

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
            <Wallet className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Topup E-Wallet</h1>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto mb-8 px-2">
          <div className="flex items-center justify-between">
            {(user ? [1, 2, 3, 4] : [1, 2, 3]).map((num, index) => (
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
              E-Wallet
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
              Detail
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Select E-Wallet */}
          {step === 1 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {EWALLETS.map((ewallet) => (
                <button
                  key={ewallet.id}
                  onClick={() => selectEwallet(ewallet)}
                  disabled={loading}
                  className="aspect-square bg-white/10 backdrop-blur-lg border-2 border-white/20 hover:border-purple-400 rounded-2xl p-6 transition transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 group"
                >
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <img 
                      src={ewallet.logo} 
                      alt={ewallet.name}
                      className="w-20 h-20 object-contain rounded-xl"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div 
                      className={`hidden w-20 h-20 bg-gradient-to-br ${ewallet.color} rounded-xl flex items-center justify-center`}
                    >
                      <span className="text-white font-bold text-xl">
                        {ewallet.name.charAt(0)}
                      </span>
                    </div>
                    <p className="text-white font-semibold text-lg group-hover:text-purple-300 transition">
                      {ewallet.name}
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
                Pilih Nominal {selectedEwallet?.name}
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
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed p-6 rounded-xl text-white transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <Coins className="w-10 h-10" />
                    <div className="text-left">
                      <p className="font-bold text-xl">Saldo</p>
                      <p className="text-sm opacity-90">Bayar menggunakan saldo Anda</p>
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

          {/* Step 3 (for guest) OR Step 4 (for logged in): Input Details */}
          {((step === 4 && user) || (step === 3 && !user)) && (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Detail Order</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-gray-400 text-sm">E-Wallet</p>
                  <p className="text-white font-semibold text-lg">
                    {selectedEwallet?.name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Produk</p>
                  <p className="text-white font-semibold text-lg">
                    {formData.selectedProduct?.productName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Harga</p>
                  <p className="text-white font-semibold text-lg">
                    Rp {formData.selectedProduct?.amount.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {paymentMethod === 'balance' && (
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-4">
                    <p className="text-yellow-300 text-sm">
                      ⚠️ Saldo sebesar <strong>Rp {formData.selectedProduct?.amount.toLocaleString('id-ID')}</strong> akan dipotong dari akun Anda.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-white mb-2">
                    Nomor HP/ID E-Wallet *
                  </label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    placeholder="08xxxxxxxxxx"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">
                    Email (Opsional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
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
                      {paymentMethod === 'balance' ? 'Memproses Topup...' : 'Memproses...'}
                    </>
                  ) : (
                    paymentMethod === 'balance' ? 'Proses Topup' : 'Lanjut Pembayaran'
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

export default TopupPage;
