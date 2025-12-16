import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md animate-scale-in">
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8 animate-slide-in">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 glass rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-white">VK</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">VirtuKey</h1>
            <p className="text-sm text-white/80">Employee Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in animate-delay-200">
            {error && (
              <div className="glass-card bg-gray-700/40 border-gray-600/50 text-gray-200 px-4 py-3 rounded-xl animate-scale-in">
                {error}
              </div>
            )}

            <div className="space-y-2 animate-slide-in animate-delay-300">
              <label htmlFor="email" className="block text-sm font-medium text-white/90">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/30"
                placeholder="your.email@virtukey.co.za"
              />
            </div>

            <div className="space-y-2 animate-slide-in animate-delay-300">
              <label htmlFor="password" className="block text-sm font-medium text-white/90">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/30"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glass-button w-full text-white py-3 px-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300 animate-slide-in animate-delay-300"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-pulse">Signing in...</span>
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center animate-fade-in animate-delay-300">
            <p className="text-sm text-white/80">
              Don't have an account?{' '}
              <Link to="/register" className="text-white font-semibold hover:text-white/90 underline transition-colors">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
