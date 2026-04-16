import { useRef, useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast/ToastContext';
import ConfirmDialog from '../../components/Toast/ConfirmDialog';
import axios from 'axios';
import Navbar from '../../components/UserComponents/Navbar';
import { io } from 'socket.io-client';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [userInfo, setUserInfo] = useState(null);
  const [pendingInstructors, setPendingInstructors] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [courses, setCourses] = useState(0);
  const [users, setUsers] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem("token");
  const socket = useRef(null);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  useEffect(() => {
    socket.current = io(import.meta.env.VITE_SOCKET_URL);
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo?.role === "admin") {
      socket.current.emit("join_admin");
    }

    socket.current.on("receive-notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
    return () => {
      socket.current.disconnect();
    };
  }, []);

  const fetchPendingInstructors = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_URL}/admin/pending-instructors`,
        config
      );
      setPendingInstructors(res.data.data || []);
    } catch (err) {
      console.error("Error fetching pending instructors", err);
    }
  }, [API_URL, token]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_URL}/admin/notifications`,
        config
      );
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  }, [API_URL, token]);
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (!storedUser || !token) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(storedUser);
    if (user.role !== "admin") {
      navigate("/");
      return;
    }
    setUserInfo(user);
    const fetchData = async () => {
      setLoading(true);

      await Promise.all([
        fetchPendingInstructors(),
        fetchNotifications(),
      ]);

      setLoading(false);
    };

    fetchData();
  }, [navigate, fetchPendingInstructors, fetchNotifications]);

  const handleApprove = async (userId) => {
    try {
      await axios.put(
        `${API_URL}/admin/approve-user/${userId}`,
        {},
        config
      );

      setPendingInstructors((prev) =>
        prev.filter((user) => user._id !== userId)
      );

      await fetchNotifications();

      success("Instructor approved successfully!");
    } catch (err) {
      error("Failed to approve instructor");
    }
  };

  const handleRejectClick = (userId) => {
    setSelectedUserId(userId);
    setShowRejectDialog(true);
  };

  const handleReject = async () => {
    if (!selectedUserId) return;

    try {
      await axios.delete(
        `${API_URL}/admin/reject-user/${selectedUserId}`,
        config
      );

      setPendingInstructors((prev) =>
        prev.filter((user) => user._id !== selectedUserId)
      );

      await fetchNotifications();

      success("Instructor rejected successfully!");
      setSelectedUserId(null);
    } catch (err) {
      error("Failed to reject instructor");
    }
  };



  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [courseRes, userRes] = await Promise.all([
          axios.get(`${API_URL}/admin/courses/count`, config),
          axios.get(`${API_URL}/admin/users/count`, config),
        ]);

        if (courseRes.data.success)
          setCourses(courseRes.data.data);

        if (userRes.data.success)
          setUsers(userRes.data.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <header className="bg-white shadow-sm border-b border-gray-200">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex justify-between items-center h-16">

            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
             
              <span className="text-sm text-gray-600">Welcome, {userInfo?.username}</span>

            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{users}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Courses</p>
                <p className="text-2xl font-semibold text-gray-900">{courses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gigs</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">$0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to ="/admin/all_users" className="p-6 border-2 border-gray-200 rounded-lg hover:border-red-800 hover:bg-red-50 transition-all text-left group">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">Manage Users</h3>
              </div>
              <p className="text-sm text-gray-600">View, edit, and manage all platform users and their roles</p>
            </Link>
            <Link
              to="/admin/courses"
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-red-800 hover:bg-red-50 transition-all text-left group block"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> </svg>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">Review Courses</h3>
              </div>
              <p className="text-sm text-gray-600">
                Approve, reject, or manage course submissions from instructors
              </p>
            </Link>
            <button className="p-6 border-2 border-gray-200 rounded-lg hover:border-red-800 hover:bg-red-50 transition-all text-left group">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">System Settings</h3>
              </div>
              <p className="text-sm text-gray-600">Configure platform settings, fees, and system preferences</p>
            </button>
          </div>
        </div>

        {/* Pending Instructors Section */}
        {pendingInstructors.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900">
                  Pending Instructor Approvals ({pendingInstructors.length})
                </h2>
              </div>
            </div>
            <div className="space-y-4">
              {pendingInstructors.map((instructor) => (
                <div key={instructor._id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{instructor.username}</h3>
                      <p className="text-sm text-gray-600">{instructor.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Registered: {new Date(instructor.createdAt).toLocaleDateString()}
                      </p>
                      {instructor.bio && (
                        <p className="text-sm text-gray-600 mt-2">{instructor.bio.substring(0, 100)}...</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(instructor._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectClick(instructor._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity & User Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No recent activity to display</p>
              </div>
            </div>
          </div>

          {/* User Management Preview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">User Overview</h2>
              <button className="text-sm text-red-800 hover:text-red-900 font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    A
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Admins</p>
                    <p className="text-sm text-gray-500">Platform administrators</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-gray-900">0</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                    I
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Instructors</p>
                    <p className="text-sm text-gray-500">Course creators</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-gray-900">0</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    F
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Freelancers</p>
                    <p className="text-sm text-gray-500">Service providers</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-gray-900">0</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">
                    C
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Clients</p>
                    <p className="text-sm text-gray-500">Students & customers</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-gray-900">0</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Reject Confirmation Dialog */}
      {showRejectDialog && (
        <ConfirmDialog
          isOpen={showRejectDialog}
          onClose={() => {
            setShowRejectDialog(false);
            setSelectedUserId(null);
          }}
          onConfirm={handleReject}
          title="Reject Instructor"
          message="Are you sure you want to reject this instructor? This action cannot be undone."
          confirmText="Reject"
          cancelText="Cancel"
          type="danger"
        />
      )} 
    </div>
  );
}

