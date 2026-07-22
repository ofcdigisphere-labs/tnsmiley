import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Loader2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { topupAPI } from '../services/api';

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [status, setStatus] = useState('pending');
  const [serialNumber, setSerialNumber] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef(null);
  const toastShownRef = useRef({
    processing: false,
    completed: false,
    failed: false
  });

  useEffect(() => {
    fetchInitialData();
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [orderId]);

  const fetchInitialData = async () => {
    try {
      // Try to get order data from sessionStorage first
      const storedData = sessionStorage.getItem('orderData');
      if (storedData) {
        const data = JSON.parse(storedData);
        setOrderData(data);
      }

      const response = await topupAPI.checkStatus(orderId);
      
      if (response.data.success) {
        setStatus(response.data.data.status);
        
        if (response.data.data.status === 'pending') {
          startPolling();
        } else if (response.data.data.status === 'completed' && response.data.data.serialNumber) {
          setSerialNumber(response.data.data.serialNumber);
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Gagal memuat data order');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    // Poll every 3 seconds
    pollingRef.current = setInterval(async () => {
      try {
        const response = await topupAPI.checkStatus(orderId);
        
        if (response.data.success) {
          const newStatus = response.data.data.status;
          
          setStatus(newStatus);
          
          // Show toast only once per status change using ref
          if (newStatus === 'completed' && !toastShownRef.current.completed) {
            setSerialNumber(response.data.data.serialNumber);
            clearInterval(pollingRef.current);
            toast.dismiss('processing'); // Dismiss processing toast first
            toast.success('Pembayaran berhasil!', { id: 'payment-success', duration: 4000 });
            toastShownRef.current.completed = true;
          } else if (newStatus === 'processing' && !toastShownRef.current.processing) {
            toast.loading('Sedang memproses topup...', { id: 'processing', duration: Infinity });
            toastShownRef.current.processing = true;
          } else if (['failed', 'expired', 'cancelled'].includes(newStatus) && !toastShownRef.current.failed) {
            clearInterval(pollingRef.current);
            toast.dismiss('processing');
            toast.error('Pembayaran gagal atau expired', { id: 'payment-failed', duration: 4000 });
            toastShownRef.current.failed = true;
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);
  };

  const handleCancel = async () => {
    if (!confirm('Yakin ingin membatalkan transaksi?')) return;

    try {
      await topupAPI.cancelTopup(orderId);
      toast.success('Transaksi dibatalkan');
      navigate('/');
    } catch (error) {
      toast.error('Gagal membatalkan transaksi');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-20 h-20 text-green-500" />;
      case 'failed':
      case 'expired':
        return <XCircle className="w-20 h-20 text-red-500" />;
      case 'processing':
        return <Loader2 className="w-20 h-20 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-20 h-20 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Pembayaran Berhasil!';
      case 'processing':
        return 'Sedang Diproses...';
      case 'failed':
        return 'Pembayaran Gagal';
      case 'expired':
        return 'Pembayaran Expired';
      case 'cancelled':
        return 'Pembayaran Dibatalkan';
      default:
        return 'Menunggu Pembayaran';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>

          {/* Status Text */}
          <h2 className="text-3xl font-bold text-white text-center mb-2">
            {getStatusText()}
          </h2>

          <p className="text-gray-300 text-center mb-8">
            Order ID: {orderId}
          </p>

          {/* QR Code Section - Only show when pending */}
          {status === 'pending' && orderData && (
            <div className="bg-white rounded-2xl p-8 mb-6">
              <div className="flex justify-center mb-4">
                <img 
                  src={orderData.qrCodeDataUrl} 
                  alt="QR Code"
                  className="w-64 h-64"
                />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-gray-600 text-sm">
                  Scan QR Code dengan aplikasi pembayaran QRIS
                </p>
                <p className="text-gray-800 font-semibold">
                  Total: Rp {orderData.totalPayment?.toLocaleString('id-ID')}
                </p>
                <p className="text-gray-600 text-sm">
                  Batas waktu: 15 menit
                </p>
              </div>
            </div>
          )}

          {/* Processing Message */}
          {status === 'processing' && (
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-6 mb-6">
              <p className="text-white text-center">
                Pembayaran diterima! Sedang memproses topup ke akun Anda...
              </p>
            </div>
          )}

          {/* Success Message */}
          {status === 'completed' && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6 mb-6 space-y-3">
              <p className="text-white text-center font-semibold">
                Topup berhasil! Saldo sudah masuk ke akun e-wallet Anda.
              </p>
              {serialNumber && (
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-gray-300 text-sm mb-1">Serial Number:</p>
                  <p className="text-white font-mono break-all">{serialNumber}</p>
                </div>
              )}
            </div>
          )}

          {/* Failed Message */}
          {(status === 'failed' || status === 'expired') && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 mb-6">
              <p className="text-white text-center">
                {status === 'expired' 
                  ? 'Pembayaran melewati batas waktu. Silakan buat order baru.'
                  : 'Terjadi kesalahan saat memproses topup. Silakan hubungi customer service.'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'pending' && (
              <button
                onClick={handleCancel}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Batalkan Transaksi
              </button>
            )}
            
            {['completed', 'failed', 'expired', 'cancelled'].includes(status) && (
              <button
                onClick={() => navigate('/topup')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Buat Topup Baru
              </button>
            )}

            <button
              onClick={() => navigate('/')}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 rounded-lg transition"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-3">Informasi Penting:</h3>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>• Pembayaran akan dicek otomatis setiap 3 detik</li>
            <li>• Jangan tutup halaman ini sampai pembayaran selesai</li>
            <li>• Batas waktu pembayaran adalah 15 menit</li>
            <li>• Topup akan diproses otomatis setelah pembayaran diterima</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
