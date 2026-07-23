import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Loader2, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { topupAPI } from '../services/api';

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [status, setStatus] = useState('pending');
  const [serialNumber, setSerialNumber] = useState(null);
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
    pollingRef.current = setInterval(async () => {
      try {
        const response = await topupAPI.checkStatus(orderId);
        
        if (response.data.success) {
          const newStatus = response.data.data.status;
          setStatus(newStatus);
          
          if (newStatus === 'completed' && !toastShownRef.current.completed) {
            setSerialNumber(response.data.data.serialNumber);
            clearInterval(pollingRef.current);
            toast.dismiss('processing');
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
        return <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-400" />;
      case 'failed':
      case 'expired':
        return <XCircle className="w-16 h-16 sm:w-20 sm:h-20 text-red-400" />;
      case 'processing':
        return <Loader2 className="w-16 h-16 sm:w-20 sm:h-20 text-red-500 animate-spin" />;
      default:
        return <Clock className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-400" />;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 text-white flex flex-col justify-between">
      {/* Header */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/10 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between max-w-xl">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <QrCode className="w-7 h-7 text-red-500" />
            <h1 className="text-xl font-extrabold tracking-wider text-white">Scan N Go</h1>
          </div>
        </div>
      </nav>

      {/* Main Container Optimized for Mobile */}
      <div className="container mx-auto px-4 py-6 max-w-xl w-full">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Status Icon */}
          <div className="flex justify-center mb-5">
            {getStatusIcon()}
          </div>

          {/* Status Text */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-1">
            {getStatusText()}
          </h2>

          <p className="text-gray-400 text-xs sm:text-sm text-center mb-6 font-mono">
            Order ID: {orderId}
          </p>

          {/* QR Code Section - Only show when pending */}
          {status === 'pending' && orderData && (
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-inner text-slate-900">
              <div className="flex justify-center mb-4">
                <img 
                  src={orderData.qrCodeDataUrl} 
                  alt="QR Code"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                />
              </div>
              
              <div className="text-center space-y-1.5">
                <p className="text-slate-600 text-xs sm:text-sm">
                  Scan QR Code dengan aplikasi pembayaran QRIS
                </p>
                <p className="text-red-600 text-lg sm:text-xl font-bold">
                  Rp {orderData.totalPayment?.toLocaleString('id-ID')}
                </p>
                <p className="text-slate-500 text-xs">
                  Batas waktu: 15 menit
                </p>
              </div>
            </div>
          )}

          {/* Processing Message */}
          {status === 'processing' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 mb-6 text-center">
              <p className="text-white text-sm">
                Pembayaran diterima! Sedang memproses topup ke akun Anda...
              </p>
            </div>
          )}

          {/* Success Message */}
          {status === 'completed' && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 mb-6 space-y-3 text-center">
              <p className="text-white text-sm font-semibold">
                Topup berhasil! Saldo sudah masuk ke akun e-wallet Anda.
              </p>
              {serialNumber && (
                <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-left">
                  <p className="text-gray-400 text-xs mb-1">Serial Number:</p>
                  <p className="text-white font-mono text-xs sm:text-sm break-all">{serialNumber}</p>
                </div>
              )}
            </div>
          )}

          {/* Failed Message */}
          {(status === 'failed' || status === 'expired') && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 mb-6 text-center">
              <p className="text-white text-sm">
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
                className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 font-semibold py-3 rounded-xl transition text-sm shadow-md"
              >
                Batalkan Transaksi
              </button>
            )}
            
            {['completed', 'failed', 'expired', 'cancelled'].includes(status) && (
              <button
                onClick={() => navigate('/topup')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition text-sm shadow-lg shadow-red-600/30"
              >
                Buat Topup Baru
              </button>
            )}

            <button
              onClick={() => navigate('/')}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3 rounded-xl transition text-sm"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg">
          <h3 className="text-white font-bold text-sm mb-2.5">Informasi Penting:</h3>
          <ul className="text-gray-300 text-xs space-y-2 leading-relaxed">
            <li>• Pembayaran akan dicek otomatis setiap 3 detik</li>
            <li>• Jangan tutup halaman ini sampai pembayaran selesai</li>
            <li>• Batas waktu pembayaran adalah 15 menit</li>
            <li>• Topup akan diproses otomatis setelah pembayaran diterima</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-400 bg-slate-950/50 mt-auto">
        <p>&copy; 2026 Scan N Go. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PaymentPage;
