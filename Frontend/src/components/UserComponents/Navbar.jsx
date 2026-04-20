import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import NotificationsPopup from '../NotificationsPopup';

const Navbar = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    }

    // Load cart count from localStorage
    const updateCartCount = () => {
      const cart = localStorage.getItem('cart');
      if (cart) {
        const cartItems = JSON.parse(cart);
        setCartCount(cartItems.length);
      } else {
        setCartCount(0);
      }
    };

    // Initial load
    updateCartCount();

    // Listen for cart updates
    window.addEventListener('cartUpdated', updateCartCount);

    // TODO: Fetch notification count from API
    setNotificationCount(0);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    setUserInfo(null);
    setShowProfileDropdown(false);
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-red-800 font-semibold' : 'text-neutral-700 hover:text-red-800';
  };

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-800 to-red-900 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-red-800 to-red-900 bg-clip-text text-transparent">
              Skill Connect Pro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Home */}
            <Link to="/" className={`${isActive('/')} font-medium transition-colors`}>
              Home
            </Link>

            {/* Courses */}
            <Link to="/courses" className={`${isActive('/courses')} font-medium transition-colors`}>
              Courses
            </Link>
            <Link to="/freelancer" className={`${isActive('/freelancer')} font-medium transition-colors`}>
              Freelancers
            </Link>
            {/* About Us */}
            <Link to="/about" className={`${isActive('/about')} font-medium transition-colors`}>
              About Us
            </Link>

            {/* Add to Cart */}
            <Link 
              to="/cart" 
              className="relative text-neutral-700 hover:text-red-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-neutral-700 hover:text-red-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
                {notificationCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
            </button>

            {/* Profile */}
            {userInfo ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 text-neutral-700 hover:text-red-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-red-800 to-red-900 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {userInfo.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium">{userInfo.username}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    
                    {userInfo.role === 'client' &&(
                      <Link
                      to="/order"
                      onClick={() => setShowProfileDropdown(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M9 8h6m3 13l-1.5-1.5L15 21l-1.5-1.5L12 21l-1.5-1.5L9 21l-1.5-1.5L6 21V3h12v18z"/>
                        </svg>
                        Orders
                      </div>
                    </Link>
                    
                    )}
                    {userInfo.role === 'client' && (
                      <Link
                      to="/profile"
                      onClick={() => setShowProfileDropdown(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </div>
                    </Link>
                    )
                    }
                    {userInfo.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setShowProfileDropdown(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Admin Dashboard
                        </div>
                      </Link>
                    )}
                    {userInfo.role === 'instructor'  && (
                      <Link
                        to={`/instructor/dashboard`}
                        onClick={() => setShowProfileDropdown(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Instructor Dashboard
                        </div>
                      </Link>
                    )}
                    {userInfo.role === 'instructor'  && (
                      <Link
                        to={`/online-class`}
                        onClick={() => setShowProfileDropdown(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" 
                            width="24" height="24" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            stroke-width="2">
                          <circle cx="12" cy="7" r="4"/>
                          <path d="M5.5 21a6.5 6.5 0 0 1 13 0"/>
                        </svg>
                          Online Class
                        </div>
                      </Link>
                    )}
                    {userInfo.role === 'freelancer'  && (
                      <Link
                        to={`/freelancer/dashboard`}
                        onClick={() => setShowProfileDropdown(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Freelancer Dashboard
                        </div>
                      </Link>
                    )}
                    {userInfo.role === 'freelancer' && (
                      <Link
                        to="/freelancer/chat"
                        onClick={() => setShowProfileDropdown(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {/* Chat Icon */}
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                          </svg>
                          Chat
                        </div>
                      </Link>
                    )}
                    {userInfo.role === 'freelancer' && (
                      <Link
                      to="/freelancer/profile"
                      onClick={() => setShowProfileDropdown(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </div>
                    </Link>
                    )}
                    {userInfo.role === 'client' && (
                      <Link
                        to="/client/chat"
                        onClick={() => setShowProfileDropdown(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {/* Chat Icon */}
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                          </svg>
                          Chat
                        </div>
                      </Link>
                    )}
                    {userInfo.role === 'client' && (
                      <Link
                        to="/online-class"
                        onClick={() => setShowProfileDropdown(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" 
                              width="24" height="24" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              stroke-width="2">
                            <circle cx="12" cy="7" r="4"/>
                            <path d="M5.5 21a6.5 6.5 0 0 1 13 0"/>
                          </svg>
                          Online Class
                        </div>
                      </Link>
                    )}
                    {userInfo.role === 'client' && (
                      <Link
                        to="/client/jobs"
                        onClick={() => setShowProfileDropdown(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" 
                            width="24" height="24" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            stroke-width="2" 
                            stroke-linecap="round" 
                            stroke-linejoin="round">
                          <line x1="12" y1="20" x2="12" y2="10"/>
                          <line x1="18" y1="20" x2="18" y2="4"/>
                          <line x1="6" y1="20" x2="6" y2="16"/>
                        </svg>
                          Jobs Track
                        </div>
                      </Link>
                    )}
                    <div className="border-t border-gray-200 my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-neutral-700 hover:text-red-800 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-900 transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-neutral-100"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`${isActive('/')} px-4 py-2 font-medium transition-colors`}
              >
                Home
              </Link>
              <Link
                to="/courses"
                onClick={() => setMobileMenuOpen(false)}
                className={`${isActive('/courses')} px-4 py-2 font-medium transition-colors`}
              >
                Courses
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`${isActive('/about')} px-4 py-2 font-medium transition-colors`}
              >
                About Us
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-2 text-neutral-700 hover:text-red-800 font-medium transition-colors"
              >
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => {
                  setShowNotifications(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-between w-full px-4 py-2 text-neutral-700 hover:text-red-800 font-medium transition-colors"
              >
                <span>Notifications</span>
                {notificationCount > 0 && (
                  <span className="bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
              {userInfo ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-neutral-700 hover:text-red-800 font-medium transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-left px-4 py-2 text-red-600 font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-neutral-700 hover:text-red-800 font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors font-medium text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notifications Popup */}
      <NotificationsPopup
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        setUnreadCount={setUnreadCount}
      />
      {/* Click outside to close dropdowns */}
      {showProfileDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileDropdown(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;
