import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../components/Toast/ToastContext';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { warning } = useToast();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem(
        'userInfo',
        JSON.stringify({
          _id: data._id,
          username: data.username,
          email: data.email,
          role: data.role,
          profileImage: data.profileImage,
          bio: data.bio,
          skills: data.skills
        })
      );
      // Check if user needs approval
      if (data.isApproved === false && (data.role === 'instructor' || data.role === 'freelancer')) {
        // Don't store token or redirect - show approval pending message
        warning('Registration successful! Your account is pending approval from admin. You will be able to login once approved.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // Redirect based on role
      const userRole = data.role;
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'instructor') {
        navigate('/dashboard/instructor');
      } else if (userRole === 'freelancer') {
        navigate('/dashboard/freelancer');
      } else {
        navigate('/'); // Client goes to home
      }
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-800 rounded-2xl mb-4 shadow-lg">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Join LearnHub</h1>
          <p className="text-gray-600 text-lg">Create your account and start learning today</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">I want to join as</label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Note: Only Client and Instructor shown for registration. Admin and Freelancer can be assigned separately */}
                  {/* Client Role */}
                  <label
                    className={`relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.role === 'client' ? 'border-red-800 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="client"
                      checked={formData.role === 'client'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                        formData.role === 'client' ? 'bg-red-800 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div
                        className={`font-semibold text-sm ${
                          formData.role === 'client' ? 'text-red-900' : 'text-gray-700'
                        }`}
                      >
                        Client
                      </div>
                      <div className="text-xs text-gray-500">Learn & Hire</div>
                    </div>
                  </label>

                  {/* Instructor Role */}
                  <label
                    className={`relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.role === 'instructor'
                        ? 'border-red-800 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="instructor"
                      checked={formData.role === 'instructor'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                        formData.role === 'instructor' ? 'bg-red-800 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div
                        className={`font-semibold text-sm ${
                          formData.role === 'instructor' ? 'text-red-900' : 'text-gray-700'
                        }`}
                      >
                        Instructor
                      </div>
                      <div className="text-xs text-gray-500">Teach courses</div>
                    </div>
                  </label>

                  {/* Freelancer Role */}
                  <label
                    className={`relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.role === 'freelancer'
                        ? 'border-red-800 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="freelancer"
                      checked={formData.role === 'freelancer'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                        formData.role === 'freelancer' ? 'bg-red-800 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div
                        className={`font-semibold text-sm ${
                          formData.role === 'freelancer' ? 'text-red-900' : 'text-gray-700'
                        }`}
                      >
                        Freelancer
                      </div>
                      <div className="text-xs text-gray-500">Offer services</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-800 text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-red-900 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-800 disabled:active:scale-100 shadow-lg shadow-red-800/20 mt-6"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>

          {/* Login Link */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-red-800 hover:text-red-900 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">© 2025 LearnHub. Empowering learners worldwide.</p>
      </div>
    </div>
  );
}
