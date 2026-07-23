import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QrCode, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, formData);
      
      if (response.data.success) {
        // Save user data to localStorage
        localStorage.setItem('user', JSON.stringify(response.data.data));
        toast.success('Login berhasil!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 flex items-center justify-center px-4 py-8 text-white">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div 
          className="flex items-center justify-center gap-2 mb-6 md:mb-8 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <QrCode className="w-8 h-8 md:w-10 md:h-10 text-red-500" />
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-wider text-white">Scan N Go</h1>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2 text-center">
            Login Paged
          </h2>
          <p className="text-xs text-gray-400 text-center mb-6">
            Masuk ke panel akun Scan N Go Anda
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-red-600/30 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300">
              Belum punya akun?{' '}
              <Link to="https://wa.me/62895412898210" className="text-red-400 hover:text-red-300 font-semibold transition">
                Register Via Admin
              </Link>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <Link to="/" className="text-xs text-gray-400 hover:text-white transition inline-flex items-center gap-1">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
