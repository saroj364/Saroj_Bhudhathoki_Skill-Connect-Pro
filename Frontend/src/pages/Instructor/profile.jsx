import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/UserComponents/Navbar';
import { useToast } from '../../components/Toast/ToastContext';
import NotificationsPopup from '../../components/NotificationsPopup';

export default function Profile() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    skills: [],
    profileImage: ''
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('userInfo');
    
    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(storedUser);
    setUserInfo(user);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      bio: user.bio || '',
      skills: user.skills || [],
      profileImage: user.profileImage || ''
    });

    const mockCourses = [
      {
        id: 1,
        title: 'MERN Stack Development',
        instructor: 'John Smith',
        progress: 65,
        enrolledDate: new Date('2024-01-15'),
        status: 'in-progress',
        image: '/mern-stack.png'
      },
      {
        id: 7,
        title: 'React.js Training',
        instructor: 'David Lee',
        progress: 100,
        enrolledDate: new Date('2023-12-10'),
        status: 'completed',
        image: '/reactjs.png'
      },
      {
        id: 9,
        title: 'Next.js Training',
        instructor: 'Jane Doe',
        progress: 30,
        enrolledDate: new Date('2024-02-01'),
        status: 'in-progress',
        image: '/nextjs.png'
      }
    ];
    
    setEnrolledCourses(mockCourses);
    setLoading(false);
  }, [navigate, API_URL]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      // TODO: Replace with actual API call
      // const response = await fetch(`${API_URL}/users/profile`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(formData)
      // });

      // For now, just update localStorage
      const updatedUser = {
        ...userInfo,
        ...formData
      };
      
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUserInfo(updatedUser);
      setIsEditing(false);
      success('Profile updated successfully!');
    } catch (err) {
      error('Failed to update profile');
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to original user info
    setFormData({
      username: userInfo?.username || '',
      email: userInfo?.email || '',
      bio: userInfo?.bio || '',
      skills: userInfo?.skills || [],
      profileImage: userInfo?.profileImage || ''
    });
    setIsEditing(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      <Navbar />
      
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-24 min-h-[calc(100vh-8rem)]">
              <div className="p-6">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('courses')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === 'courses'
                        ? 'bg-red-800 text-white shadow-md'
                        : 'text-gray-700 hover:bg-red-50 hover:text-red-800'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="font-medium">My Courses</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('certification')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === 'certification'
                        ? 'bg-red-800 text-white shadow-md'
                        : 'text-gray-700 hover:bg-red-50 hover:text-red-800'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <span className="font-medium">Certification</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('forum')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === 'forum'
                        ? 'bg-red-800 text-white shadow-md'
                        : 'text-gray-700 hover:bg-red-50 hover:text-red-800'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    <span className="font-medium">Forum</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === 'chat'
                        ? 'bg-red-800 text-white shadow-md'
                        : 'text-gray-700 hover:bg-red-50 hover:text-red-800'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="font-medium">Chat</span>
                  </button>

                  <div className="border-t border-gray-200 my-2"></div>

                  <button
                    onClick={() => {
                      localStorage.removeItem('userInfo');
                      localStorage.removeItem('token');
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-600 hover:bg-red-50 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Logout</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Side Status Bar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 sticky top-24 overflow-hidden min-h-[calc(100vh-8rem)]">
              {/* Profile Summary */}
              <div className="bg-gradient-to-br from-red-800 to-red-900 p-8 text-white">
                <div className="text-center mb-6">
                  <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-4xl font-bold border-4 border-white/30 mx-auto mb-4">
                    {formData.profileImage ? (
                      <img
                        src={formData.profileImage}
                        alt={formData.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(formData.username)}</span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{formData.username || 'User'}</h3>
                  <p className="text-red-100">{formData.email}</p>
                </div>
                
                {/* Account Status */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-red-100">Account Status</span>
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">Active</span>
                  </div>
                  <div className="text-sm text-red-100">
                    Member since {userInfo?.createdAt ? new Date(userInfo.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2024'}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="p-6 space-y-5">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Quick Stats
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Courses</p>
                          <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Completed</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {enrolledCourses.filter(c => c.status === 'completed').length}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">In Progress</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {enrolledCourses.filter(c => c.status === 'in-progress').length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Overview */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Overall Progress
                  </h4>
                  
                  {enrolledCourses.length > 0 ? (
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-gray-600">Average</span>
                        <span className="font-semibold text-gray-900">
                          {Math.round(enrolledCourses.reduce((acc, c) => acc + c.progress, 0) / enrolledCourses.length)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-red-800 to-red-900 h-2.5 rounded-full"
                          style={{
                            width: `${Math.round(enrolledCourses.reduce((acc, c) => acc + c.progress, 0) / enrolledCourses.length)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No progress yet</p>
                  )}
                </div>

                {/* Quick Links */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Quick Links
                  </h4>
                  
                  <div className="space-y-2">
                    <Link
                      to="/courses"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors group"
                    >
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-red-800">Browse Courses</span>
                    </Link>
                    
                    <Link
                      to="/cart"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors group"
                    >
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-red-800">Shopping Cart</span>
                    </Link>
                    
                    <button
                      onClick={() => setShowNotifications(true)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors group"
                    >
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-red-800">Notifications</span>
                    </button>
                  </div>
                </div>

                {/* Skills Preview */}
                {formData.skills.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.slice(0, 5).map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                      {formData.skills.length > 5 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">
                          +{formData.skills.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6">
            {/* Simplified Profile Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-800 to-red-900 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                    {formData.profileImage ? (
                      <img
                        src={formData.profileImage}
                        alt={formData.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(formData.username)}</span>
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-red-800 text-white rounded-full p-2 shadow-lg hover:bg-red-900 transition-all border-2 border-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="min-w-0">
                      <h1 className="text-3xl font-bold text-gray-900 mb-1 truncate">
                        {formData.username || 'User'}
                      </h1>
                      <div className="flex items-center gap-2 text-gray-500">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{formData.email}</span>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveProfile}
                          className="px-5 py-2.5 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors font-medium flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-5 py-2.5 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors font-medium flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Profile
                      </button>
                    )}
                  </div>
                  
                  {/* Bio */}
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 resize-none transition-all text-sm"
                      rows="3"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {formData.bio || 'No bio added yet. Click "Edit Profile" to add one.'}
                    </p>
                  )}

                  {/* Skills */}
                  {formData.skills.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-800 rounded-full text-xs font-medium border border-red-200"
                          >
                            {skill}
                            {isEditing && (
                              <button
                                onClick={() => handleRemoveSkill(skill)}
                                className="hover:text-red-900 rounded-full p-0.5 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex gap-2 mt-4">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                        placeholder="Add a skill"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-all text-sm"
                      />
                      <button
                        onClick={handleAddSkill}
                        className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors font-medium text-sm"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Simplified Tabs Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'overview'
                        ? 'border-red-800 text-red-800 bg-red-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('courses')}
                    className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'courses'
                        ? 'border-red-800 text-red-800 bg-red-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    My Courses
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'settings'
                        ? 'border-red-800 text-red-800 bg-red-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Settings
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-4xl font-bold mb-1">{enrolledCourses.length}</p>
                  <p className="text-blue-100 font-medium">Total Courses Enrolled</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-4xl font-bold mb-1">
                    {enrolledCourses.filter(c => c.status === 'completed').length}
                  </p>
                  <p className="text-green-100 font-medium">Courses Completed</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-4xl font-bold mb-1">
                    {enrolledCourses.filter(c => c.status === 'in-progress').length}
                  </p>
                  <p className="text-purple-100 font-medium">Courses In Progress</p>
                </div>
              </div>
            )}

                {/* Certification Tab */}
                {activeTab === 'certification' && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium mb-1">No certifications yet</p>
                    <p className="text-gray-500 text-sm">Complete courses to earn certifications!</p>
                  </div>
                )}

                {/* Forum Tab */}
                {activeTab === 'forum' && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium mb-1">Forum coming soon</p>
                    <p className="text-gray-500 text-sm">Community discussions will be available here!</p>
                  </div>
                )}

                {/* Chat Tab */}
                {activeTab === 'chat' && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium mb-1">Chat coming soon</p>
                    <p className="text-gray-500 text-sm">Direct messaging will be available here!</p>
                  </div>
                )}

            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <div className="space-y-6">
                {enrolledCourses.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg mb-2 font-semibold">No courses enrolled yet</p>
                    <p className="text-gray-400 mb-6">Start your learning journey today!</p>
                    <Link
                      to="/courses"
                      className="inline-block px-8 py-3 bg-red-800 text-white rounded-xl hover:bg-red-900 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Browse Courses
                    </Link>
                  </div>
                ) : (
                  enrolledCourses.map((course) => (
                    <div key={course.id} className="border-2 border-gray-200 rounded-2xl p-6 hover:border-red-300 hover:shadow-xl transition-all bg-white group">
                          <div className="flex flex-col sm:flex-row gap-4">
                            {/* Course Image */}
                            <div className="w-full sm:w-40 h-28 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {course.image ? (
                                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                              ) : (
                                <svg className="w-12 h-12 text-red-800 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                  <Link to={`/courses/${course.id}`}>
                                    <h3 className="text-lg font-bold text-gray-900 hover:text-red-800 transition-colors mb-2 truncate">
                                      {course.title}
                                    </h3>
                                  </Link>
                                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                                    <span>{course.instructor}</span>
                                    <span>•</span>
                                    <span>{course.enrolledDate.toLocaleDateString()}</span>
                                  </div>
                                  
                                  {/* Progress Bar */}
                                  <div>
                                    <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                                      <span>Progress</span>
                                      <span className={course.progress === 100 ? 'text-green-600 font-medium' : 'text-red-800 font-medium'}>{course.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${
                                          course.status === 'completed'
                                            ? 'bg-green-500'
                                            : 'bg-red-800'
                                        }`}
                                        style={{ width: `${course.progress}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                                      course.status === 'completed'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-blue-100 text-blue-800'
                                    }`}
                                  >
                                    {course.status === 'completed' ? 'Completed' : 'In Progress'}
                                  </span>
                                  <Link
                                    to={`/courses/${course.id}`}
                                    className="text-red-800 hover:text-red-900 font-medium text-sm flex items-center gap-1"
                                  >
                                    Continue
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Account Settings</h3>
                      <div className="space-y-4 bg-gray-50 rounded-xl p-5 border border-gray-200">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-500 text-sm"
                          />
                          <p className="text-xs text-gray-500 mt-1.5">Email cannot be changed</p>
                        </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Username
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-all"
                        />
                      ) : (
                        <input
                          type="text"
                          value={formData.username}
                          disabled
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-500 font-medium"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Security</h3>
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <button className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-white hover:border-red-800 hover:text-red-800 transition-all font-semibold">
                      Change Password
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-2xl font-bold text-red-800 mb-6">Danger Zone</h3>
                  <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                    <button className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-lg hover:shadow-xl">
                      Delete Account
                    </button>
                    <p className="text-sm text-gray-600 mt-3 flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Popup */}
      <NotificationsPopup
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
}
