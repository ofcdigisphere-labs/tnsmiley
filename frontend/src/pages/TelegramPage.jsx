import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Phone, MessageSquare, Mail, ArrowLeft, Loader2, CreditCard, Coins, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { telegramAPI } from '../services/api'; // Menggunakan kembali telegramAPI Anda yang sudah ada
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Konfigurasi dinamis untuk berbagai jenis layanan nokos
const serviceConfig = {
  telegram: { title: 'Beli Telegram OLD', icon: Phone, color: 'text-blue-400' },
  whatsapp: { title: 'Beli WhatsApp OTP', icon: MessageSquare, color: 'text-green-400' },
  gmail: { title: 'Beli Akun Gmail', icon: Mail, color: 'text-red-400' },
};

const TelegramPage = () => {
  const navigate = useNavigate();
  const { serviceName = 'telegram' } = useParams(); // Mengambil parameter layanan dari URL (jika ada)
  const currentService = serviceConfig[serviceName] || serviceConfig['telegram'];
  const IconComponent = currentService.icon;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [user, setUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null); // 'qris' or 'balance'
  
  const [formData, setFormData] = useState({
    selectedCountry: null,
  });

  const [orderData, setOrderData] = useState(null);
  const [otpCode, setOtpCode] = useState(null);
  const [pollingStatus, setPollingStatus] = useState(''); // 'payment', 'otp'
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 mins for OTP
  const [isCancelled, setIsCancelled] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchCountries();
  }, [serviceName]);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      // Jika backend Anda mendukung parameter jenis layanan, kirim serviceName. 
      // Jika backend Anda hanya untuk Telegram, fungsi ini akan tetap aman berjalan.
      const response = await telegramAPI.getCountries(serviceName);
      if (response.data.success) {
        setCountries(response.data.data);
      }
    } catch (error) {
      toast.error('Gagal memuat daftar negara');
    } finally {
      setLoading(false);
    }
  };

  const selectCountry = (country) => {
    setFormData({ selectedCountry: country });
    if (user) {
      setStep(2);
    } else {
      setPaymentMethod('qris');
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        service: serviceName,
        countryCode: formData.selectedCountry.code,
        countryName: formData.selectedCountry.name,
        price: formData.selectedCountry.price,
      };

      if (!payload.countryCode || !payload.price) {
         toast.error("Data negara tidak lengkap dari API Telekos!");
         setLoading(false);
         return;
      }

      if (paymentMethod === 'balance') {
        payload.userId = user.userId;
        const response = await telegramAPI.createWithBalance(payload);
        
        if (response.data.success) {
          const result = response.data.data;
          const updatedUser = { ...user, balance: result.newBalance };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);

          setOrderData(result);
          setStep(4); 
          startPaymentPolling(result.orderId);
        }
      } else {
        // QRIS
        if (user) payload.userId = user.userId;
        const response = await telegramAPI.create(payload);
        if (response.data.success) {
          setOrderData(response.data.data);
          setStep(4); 
          startPaymentPolling(response.data.data.orderId);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membuat order');
    } finally {
      setLoading(false);
    }
  };

  const startPaymentPolling = (orderId) => {
    setPollingStatus('payment');
    const interval = setInterval(async () => {
      try {
        const res = await telegramAPI.checkStatus(orderId);
        const data = res.data.data;
        if (data.status === 'waiting_code') {
          clearInterval(interval);
          setOrderData(data);
          startOtpPolling(orderId);
        } else if (data.status === 'failed' || data.status === 'expired' || data.status === 'cancelled') {
          clearInterval(interval);
          toast.error(`Order ${data.status}`);
          setIsCancelled(true);
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000);

    return () => clearInterval(interval);
  };

  const startOtpPolling = (orderId) => {
    setPollingStatus('otp');
    setTimeRemaining(180);
    
    let timeLeft = 180;
    
    const interval = setInterval(async () => {
      timeLeft -= 5;
      setTimeRemaining(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(interval);
        handleAutoCancel(orderId);
        return;
      }

      try {
        const res = await telegramAPI.getCode(orderId);
        const data = res.data.data;
        if (data.state === 'ok' && data.code) {
          clearInterval(interval);
          setOtpCode(data.code);
          toast.success('Kode OTP Berhasil didapatkan!');
        } else if (data.state === 'expired' || data.state === 'cancel') {
          clearInterval(interval);
          setIsCancelled(true);
          toast.error('Order expired/cancel dari pusat');
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000);
  };

  const handleAutoCancel = async (orderId) => {
    toast.error('Waktu habis (3 menit). Auto-cancel...');
    await cancelOrder(orderId);
  };

  const cancelOrder = async (orderId) => {
    try {
      const res = await telegramAPI.cancelOrder(orderId, { userId: user?.userId });
      if (res.data.success) {
        setIsCancelled(true);
        toast.success(res.data.message);
        
        if (user) {
          try {
            const profileRes = await axios.get(`${API_URL}/api/auth/profile/${user.userId}`);
            if (profileRes.data.success) {
              setUser(profileRes.data.data);
              localStorage.setItem('user', JSON.stringify(profileRes.data.data));
            }
          } catch (e) {
            console.error('Failed to refresh profile', e);
          }
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membatalkan order');
    }
  };

  const goBack = () => {
    if (step > 1 && step < 4) {
      setStep(step - 1);
    } else if (step === 4) {
      navigate('/'); 
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={goBack} className="p-2 hover:bg-white/10 rounded-lg transition">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <IconComponent className={`w-8 h-8 ${currentService.color}`} />
            <h1 className="text-2xl font-bold text-white">{currentService.title}</h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
          
          {/* Step 1: Select Country */}
          {step === 1 && (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Pilih Negara {currentService.title}</h2>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {countries.length === 0 && (
                    <p className="text-gray-400 col-span-full text-center py-4">Tidak ada negara tersedia</p>
                  )}
                  {countries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => selectCountry(country)}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 text-left transition"
                    >
                      <p className="text-white font-semibold text-lg">{country.flag} {country.name}</p>
                      <p className="text-blue-300 font-bold mt-2">Rp {country.price.toLocaleString('id-ID')}</p>
                      <p className="text-gray-400 text-sm mt-1">Stok: {country.stock}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && user && (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-2">Metode Pembayaran</h2>
              <p className="text-gray-400 mb-6">Saldo Anda: Rp {(user.balance || 0).toLocaleString('id-ID')}</p>
              
              <div className="grid gap-4">
                <button
                  onClick={() => {
                    if ((user.balance || 0) < formData.selectedCountry.price) {
                      toast.error('Saldo tidak cukup! Gunakan QRIS.');
                      return;
                    }
                    setPaymentMethod('balance');
                    setStep(3);
                  }}
                  disabled={(user.balance || 0) < formData.selectedCountry.price}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 disabled:opacity-50 p-6 rounded-xl text-white transition flex justify-between"
                >
                  <div className="flex items-center gap-4">
                    <Coins className="w-8 h-8" />
                    <div className="text-left">
                      <p className="font-bold text-xl">Saldo</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setPaymentMethod('qris');
                    setStep(3);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 p-6 rounded-xl text-white transition flex items-center gap-4"
                >
                  <CreditCard className="w-8 h-8" />
                  <div className="text-left">
                    <p className="font-bold text-xl">QRIS</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Detail Order {currentService.title}</h2>
              <div className="space-y-4 mb-8">
                <div>
                  <p className="text-gray-400 text-sm">Negara</p>
                  <p className="text-white font-semibold text-lg">{formData.selectedCountry?.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Harga</p>
                  <p className="text-white font-semibold text-lg">Rp {formData.selectedCountry?.price.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Metode</p>
                  <p className="text-white font-semibold text-lg">{paymentMethod === 'balance' ? 'Saldo Akun' : 'QRIS'}</p>
                </div>
              </div>

              <button
                onClick={() => handleSubmit()}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Beli Sekarang'}
              </button>
            </div>
          )}

          {/* Step 4: Payment / Polling OTP */}
          {step === 4 && orderData && (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 md:p-8 text-center">
              {isCancelled ? (
                <div>
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Order Dibatalkan</h2>
                  <p className="text-gray-300">Transaksi telah dibatalkan dan direfund (jika menggunakan saldo).</p>
                </div>
              ) : otpCode ? (
                <div>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Berhasil!</h2>
                  <p className="text-gray-300 mb-6">Nomor Telepon dan Kode OTP siap digunakan.</p>
                  
                  <div className="bg-gray-900/50 p-6 rounded-xl inline-block text-left w-full max-w-sm border border-gray-700">
                    <p className="text-gray-400 text-sm">Nomor Telepon:</p>
                    <p className="text-white text-xl font-bold mb-4">{orderData.phoneNumber}</p>
                    
                    <p className="text-gray-400 text-sm">Kode OTP:</p>
                    <p className="text-blue-400 text-3xl font-mono tracking-widest font-bold">{otpCode}</p>
                  </div>
                </div>
              ) : pollingStatus === 'payment' ? (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {orderData.qrCodeDataUrl ? 'Selesaikan Pembayaran' : 'Memproses Pesanan'}
                  </h2>
                  {orderData.qrCodeDataUrl && (
                    <img src={orderData.qrCodeDataUrl} alt="QRIS" className="mx-auto rounded-xl mb-4 w-64 h-64 bg-white p-2" />
                  )}
                  {orderData.qrCodeDataUrl && (
                    <p className="text-gray-300 mb-2">Total: Rp {orderData.totalPayment?.toLocaleString('id-ID')}</p>
                  )}
                  <p className="text-blue-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> {orderData.qrCodeDataUrl ? 'Menunggu pembayaran...' : 'Menghubungi server Telekos...'}
                  </p>
                  <button 
                    onClick={() => cancelOrder(orderData.orderId)}
                    className="mt-6 px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition"
                  >
                    Cancel Order
                  </button>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Menunggu Kode OTP</h2>
                  <div className="bg-gray-900/50 p-6 rounded-xl inline-block text-left w-full max-w-sm border border-gray-700 mb-6">
                    <p className="text-gray-400 text-sm">Nomor Telepon:</p>
                    <p className="text-white text-xl font-bold">{orderData.phoneNumber}</p>
                  </div>
                  
                  <div className="mb-6">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
                    <p className="text-blue-300">Sisa waktu: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</p>
                  </div>

                  <button 
                    onClick={() => cancelOrder(orderData.orderId)}
                    className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition"
                  >
                    Cancel Order
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default TelegramPage;
