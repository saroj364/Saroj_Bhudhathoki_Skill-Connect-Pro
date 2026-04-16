import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/UserComponents/Navbar';
import Footer from '../../components/UserComponents/Footer';
import { useToast } from '../../components/Toast/ToastContext';

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const { error, warning } = useToast();
  const [recentCourses, setRecentCourses ] = useState([]); 
  const [courses,setCourses] = useState(0);
  const [earnings, setEarnings] = useState(0); 
  const storedUser = localStorage.getItem('userInfo');
  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL; 
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  

  const fetchRecentCourses = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/instructor/courses/recent`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setRecentCourses(res.data.data);
    } catch (err) {
      console.log(err.response?.data?.message || err.message);
      error("Failed to get Recent Courses");
    }
  };
  const mycourse = async () => {
    try{
      const res = await axios.get(
        `${API_URL}/instructor/courses/count`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setCourses(res.data.data);
    }catch(err){
        console.log(err.response?.data?.message || err.message);
        error("Failed to get your courses");
    }
  }
  const myEarning = async () => {
    try{
      const res = await axios.get(
        `${API_URL}/instructor/earnings`,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setEarnings(res.data.data[0].earnings);
    }catch(err){
      console.log(err.response?.data?.message || err.message);
      error("Failed to get your earnings");
    }
  }
  useEffect(() => {
    if (!storedUser ) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(storedUser);
    if (user.role !== 'instructor') {
      navigate('/');
      return;
    }
    setUserInfo(user); 
    fetchRecentCourses();
    mycourse(); 
    myEarning();
  }, [navigate]);

 



  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
      </div>
    );
  }

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-800 to-red-900 rounded-lg shadow-lg p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {userInfo.username}!</h2>
          <p className="text-red-100">Manage your courses and help students learn</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Courses</p>
                <p className="text-2xl font-semibold text-gray-900">{courses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-semibold text-gray-900">0.0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Earnings</p>
                <p className="text-2xl font-semibold text-gray-900">Rs. {earnings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-6 border-2 border-red-800 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-left">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-800 text-white rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Create New Course</h3>
                  <p className="text-sm text-gray-600">Start teaching and share your knowledge</p>
                </div>
              </div>
            </button>
            <Link to="/instructor/create-class" className="p-6 border-2 border-red-800 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-left">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-800 text-white rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Create Room</h3>
                  <p className="text-sm text-gray-600">Create a online classroom for students</p>
                </div>
              </div>
            </Link>
            <Link to="/instructor/courses" className="p-6 border-2 border-gray-200 rounded-lg hover:border-red-800 hover:bg-red-50 transition-colors text-left">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-200 rounded-lg">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">My Courses</h3>
                  <p className="text-sm text-gray-600">Manage your existing courses</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Courses</h2>

          {recentCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253"
                />
              </svg>

              <p className="mb-4">You haven't created any courses yet</p>

              <button
                onClick={() => navigate("/instructor/add-course")}
                className="px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900"
              >
                Create Your First Course
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentCourses.map((course) => (
                <div key={course._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                  <img src={`${BASE_URL}${course.thumbnail}`} alt={course.title} className="w-full h-40 object-cover"/>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {course.category}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-red-800 font-semibold">
                        Rs. {course.price}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {course.level}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
            </div>
          )}
          
        </div>
          <div className='text-center py-10'>
            <button
                onClick={() => navigate("/instructor/courses")}
                className="px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900"
              >
                View Your other Courses
              </button>
          </div>
      </main>
    </div>
    <Footer/>
    </>
  );
}

