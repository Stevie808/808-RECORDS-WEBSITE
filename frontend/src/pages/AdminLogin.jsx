import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Shield } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Add admin-page class to body on mount
  useEffect(() => {
    document.body.classList.add('admin-page');
    document.title = '808 Records - Admin Login';
    return () => {
      document.body.classList.remove('admin-page');
      document.title = '808 Records';
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (loginError) setLoginError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      const response = await axios.post(`${API}/admin/login`, formData);
      localStorage.setItem('admin_token', response.data.token);
      localStorage.setItem('admin_email', response.data.email);
      
      toast({
        title: '✅ Login Successful',
        description: `Welcome back, ${response.data.email}`
      });
      
      navigate('/admin/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Invalid email or password';
      setLoginError(errorMessage);
      
      toast({
        title: '❌ Login Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      
      // Shake animation for visual feedback
      const form = e.target;
      form.classList.add('shake-animation');
      setTimeout(() => form.classList.remove('shake-animation'), 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6" style={{ cursor: 'auto' }}>
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Admin Portal</h1>
          <p className="text-white/40 text-sm">808 Records Content Management</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {loginError && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-red-300 font-medium">{loginError}</p>
                  <p className="text-xs text-red-400/80 mt-1">Please check your email and password and try again.</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="form-field-modern">
            <label className="form-label-modern">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`input-modern ${loginError ? 'border-red-500/50 focus:border-red-500' : ''}`}
              placeholder="Email@808records.com"
              autoComplete="email"
              style={{ cursor: 'text' }}
            />
            <div className={`form-border-modern ${loginError ? 'bg-red-500' : ''}`} />
          </div>

          <div className="form-field-modern">
            <label className="form-label-modern">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`input-modern ${loginError ? 'border-red-500/50 focus:border-red-500' : ''}`}
              placeholder="abc123"
              autoComplete="current-password"
              style={{ cursor: 'text' }}
            />
            <div className={`form-border-modern ${loginError ? 'bg-red-500' : ''}`} />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-submit-modern group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-white/30 text-sm mt-8">
          Authorized personnel only
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
