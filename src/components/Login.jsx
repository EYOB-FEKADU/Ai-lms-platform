import React, { useState } from 'react';
import { loginUser } from '../api';
import ThemeToggle from './ThemeToggle';

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await loginUser(email, password);
      console.log('Login successful:', response);
      onLoginSuccess(response.user);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Make sure Docker backend is running on port 5000');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transition-colors duration-200">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎓</div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">LMS Platform</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">AI-Powered Learning Management System</p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Backend: localhost:5000
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              required
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm border border-red-200 dark:border-red-800">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Sign In →'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p className="font-medium mb-2">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-blue-50 dark:bg-blue-900 p-2 rounded">📚 Student<br/>student.abebe@lms.com</div>
              <div className="bg-green-50 dark:bg-green-900 p-2 rounded">👨‍🏫 Teacher<br/>teacher.almaz@lms.com</div>
              <div className="bg-purple-50 dark:bg-purple-900 p-2 rounded">👪 Parent<br/>parent.chaltu@lms.com</div>
              <div className="bg-red-50 dark:bg-red-900 p-2 rounded">⚙️ Admin<br/>admin@lms.com</div>
            </div>
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">Password: Student123! / Teacher123! / Parent123! / Admin123!</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;