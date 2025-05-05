import React, { useState } from 'react';
import { useSession } from '../store/SessionContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Building2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate('/');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="w-12 h-12 text-dxc-purple" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">KYC Enterprise Portal</h1>
          <p className="text-sm text-gray-600">Sign in to access your workspace</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dxc-purple focus:border-transparent transition-colors"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dxc-purple focus:border-transparent transition-colors"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-dxc-purple focus:ring-dxc-purple border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm font-medium text-dxc-purple hover:text-dxc-purple/80">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-dxc-purple text-white py-2.5 rounded-lg font-medium hover:bg-dxc-purple/90 transition-colors focus:outline-none focus:ring-2 focus:ring-dxc-purple focus:ring-offset-2"
            >
              Sign in
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a href="#" className="font-medium text-dxc-purple hover:text-dxc-purple/80">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 