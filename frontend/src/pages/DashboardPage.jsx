import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, LogOut, Copy, RefreshCw, BarChart3, 
  CheckCircle, Clock, XCircle, Eye, EyeOff,
  Smartphone, MessageCircle, Server, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      
      // Fetch latest user data (to get updated balance)
      const userResponse = await axios.get(`${API_URL}/api/auth/profile/${userData.userId}`);
      if (userResponse.data.success) {
        const updatedUser = userResponse.data.data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      // Fetch stats from backend
      const statsResponse = await axios.get(`${API_URL}/api/merchant/stats`, {
        headers: { 'x-api-key': userData.apiKey }
      });

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // Fetch unified transaction history
      const historyResponse = await axios.get(`${API_URL}/api/auth/history/${userData.userId}`);

      if (historyResponse.data.success) {
        setTransactions(historyResponse.data.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logout berhasil');
    navigate('/');
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(user.apiKey);
    toast.success('API Key copied!');
  };

  const regenerateApiKey = async () => {
    if (!confirm('Yakin ingin regenerate API Key? API Key lama akan tidak valid lagi.')) {
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/regenerate-api-key`, {
        userId: user.userId
      });

      if (response.data.success) {
        const newApiKey = response.data.data.apiKey;
        const updatedUser = { ...user, apiKey: newApiKey };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('API Key berhasil di-regenerate!');
      }
    } catch (error) {
      toast.error('Gagal regenerate API Key');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <nav className="bg-white/15 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-8 h-8 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-white hover:text-red-400 transition"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Halo {user.name}!
            </h2>
            <p className="text-gray-300 text-sm md:text-base">
              {user.businessName || 'Merchant Dashboard'}
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-gray-400 text-xs md:text-sm">Saldo Anda</p>
            <p className="text-3xl md:text-4xl font-bold text-green-400">
              Rp {(user.balance || 0).toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* Quick Action Topup Button Section */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-gray-300 text-sm">Penarikan secara instan Ke Ewallet.</p>
          </div>
          <button
            onClick={() => navigate('/topup')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition transform hover:scale-105 shrink-0"
          >
            Withdraw Saldo
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* API Key Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">API Key</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
                title={showApiKey ? 'Hide' : 'Show'}
              >
                {showApiKey ? (
                  <EyeOff className="w-5 h-5 text-white" />
                ) : (
                  <Eye className="w-5 h-5 text-white" />
                )}
              </button>
              <button
                onClick={copyApiKey}
                className="p-2 hover:bg-white/10 rounded-lg transition"
                title="Copy"
              >
                <Copy className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={regenerateApiKey}
                className="p-2 hover:bg-white/10 rounded-lg transition"
                title="Regenerate"
              >
                <RefreshCw className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="bg-black/30 rounded-lg p-4">
            <code className="text-white font-mono text-sm break-all">
              {showApiKey ? user.apiKey : user.apiKey.replace(/./g, '*')}
            </code>
          </div>

          <p className="text-gray-400 text-sm mt-4">
            Gunakan API Key ini untuk mengintegrasikan payment gateway ke aplikasi Anda.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <StatCard
            icon={<BarChart3 className="w-6 h-6 text-blue-400" />}
            title="Total Transaksi"
            value={stats?.total || 0}
            color="blue"
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6 text-green-400" />}
            title="Berhasil"
            value={stats?.completed || 0}
            color="green"
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-yellow-400" />}
            title="Pending"
            value={stats?.pending || 0}
            color="yellow"
          />
          <StatCard
            icon={<XCircle className="w-6 h-6 text-red-400" />}
            title="Gagal"
            value={stats?.failed || 0}
            color="red"
          />
        </div>

        {/* Transaction History */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 md:p-6 mb-8">
          <h3 className="text-lg md:text-xl font-bold text-white mb-4">Riwayat Transaksi</h3>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Belum ada transaksi ngab.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-sm">
                    <th className="py-3 px-4 font-medium">Jenis</th>
                    <th className="py-3 px-4 font-medium">Detail</th>
                    <th className="py-3 px-4 font-medium">Nominal</th>
                    <th className="py-3 px-4 font-medium">Metode</th>
                    <th className="py-3 px-4 font-medium">Tanggal</th>
                    <th className="py-3 px-4 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {transactions.slice(0, 10).map((tx) => (
                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="py-3 px-4">
                        {tx.type === 'topup' && <span className="flex items-center gap-2 text-purple-400"><Smartphone className="w-4 h-4"/> Topup</span>}
                        {tx.type === 'telegram' && <span className="flex items-center gap-2 text-blue-400"><MessageCircle className="w-4 h-4"/> Nokos</span>}
                        {tx.type === 'api_payment' && <span className="flex items-center gap-2 text-green-400"><Server className="w-4 h-4"/> API</span>}
                      </td>
                      <td className="py-3 px-4 text-white">
                        <p className="font-medium">{tx.title}</p>
                        <p className="text-xs text-gray-500 font-mono">{tx.id}</p>
                      </td>
                      <td className="py-3 px-4 text-white font-medium">Rp {tx.amount.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4 text-gray-300 uppercase text-xs">{tx.method}</td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(tx.date).toLocaleString('id-ID', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {tx.status === 'completed' && <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium border border-green-500/20">Sukses</span>}
                        {tx.status === 'processing' && <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-medium border border-blue-500/20">Proses</span>}
                        {tx.status === 'waiting_code' && <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-medium border border-blue-500/20">Nunggu OTP</span>}
                        {tx.status === 'pending' && <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-medium border border-yellow-500/20">Pending</span>}
                        {['failed', 'expired', 'cancelled'].includes(tx.status) && <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-medium border border-red-500/20">Gagal/Batal</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length > 10 && (
                <div className="text-center mt-4 text-xs text-gray-500">
                  *Menampilkan 10 transaksi terakhir
                </div>
              )}
            </div>
          )}
        </div>

        {/* API Documentation Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold text-white mb-4">Dokumentasi API Payment Gateway</h3>
          
          <div className="space-y-4">
            <div className="bg-black/30 rounded-lg p-3 md:p-4">
              <h4 className="text-white font-semibold mb-2 text-sm md:text-base">1. Generate QRIS Payment</h4>
              <div className="bg-black/50 rounded p-2 md:p-3 overflow-x-auto">
                <code className="text-green-400 text-xs md:text-sm block whitespace-pre-wrap break-all">
{`POST ${API_URL}/api/payment/create
Headers: {
  "x-api-key": "YOUR_API_KEY",
  "Content-Type": "application/json"
}
Body: {
  "amount": 50000,
  "orderId": "ORDER-123",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "08123456789"
}
Response: {
  "success": true,
  "data": {
    "transactionId": "TXN...",
    "orderId": "ORDER-123",
    "amount": 50000,
    "totalPayment": 50380,
    "fee": 380,
    "qrCodeDataUrl": "data:image/png;base64...",
    "qrisString": "00020101021226...",
    "expiryTime": 1234567890,
    "expiresIn": 900
  }
}`}
                </code>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">2. Check Payment Status</h4>
              <div className="bg-black/50 rounded p-3 overflow-x-auto">
                <code className="text-green-400 text-sm">
{`GET ${API_URL}/api/payment/status/:transactionId
Headers: {
  "x-api-key": "YOUR_API_KEY"
}
Response: {
  "success": true,
  "data": {
    "transactionId": "TXN...",
    "status": "completed",
    "amount": 50000,
    "totalPayment": 50380,
    "merchantOrderId": "ORDER-123",
    "paidAt": 1234567890
  }
}
// Status: pending, completed, failed, expired, cancelled`}
                </code>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">3. Cancel Payment</h4>
              <div className="bg-black/50 rounded p-3 overflow-x-auto">
                <code className="text-green-400 text-sm">
{`POST ${API_URL}/api/payment/cancel/:transactionId
Headers: {
  "x-api-key": "YOUR_API_KEY"
}
Response: {
  "success": true,
  "message": "Payment cancelled successfully",
  "data": {
    "transactionId": "TXN...",
    "status": "cancelled"
  }
}`}
                </code>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">4. Get Transaction History</h4>
              <div className="bg-black/50 rounded p-3 overflow-x-auto">
                <code className="text-green-400 text-sm">
{`GET ${API_URL}/api/merchant/transactions?limit=50&status=completed
Headers: {
  "x-api-key": "YOUR_API_KEY"
}`}
                </code>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">5. Get Statistics</h4>
              <div className="bg-black/50 rounded p-3 overflow-x-auto">
                <code className="text-green-400 text-sm">
{`GET ${API_URL}/api/merchant/stats
Headers: {
  "x-api-key": "YOUR_API_KEY"
}`}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-lg border rounded-xl p-4 md:p-6`}>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
        <div className="p-2 md:p-3 bg-white/10 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-gray-300 text-xs md:text-sm">{title}</p>
          <p className="text-white text-xl md:text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
