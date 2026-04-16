import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/UserComponents/Navbar';
import Footer from '../../components/UserComponents/Footer';
import IconComponent from '../../components/UserComponents/Icon';

export default function LearnerHomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredCourses, setCourses] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL ;
  const BASE_URL = import.meta.env.VITE_BASE_URL
  const navigate = useNavigate();
  const fetchCourses = async() => {
    try{
      const res = await fetch(`${API_URL}/courses/featured`); 
      const data = await res.json();
      if(!res.ok){
        throw new Error(data.message); 
      }
      setCourses(data.data); 
    }catch(error){
      console.log(error.message);
    }
  }
  useEffect(()=>{
    fetchCourses();
  },[]);
  


  return (
    
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      <Navbar />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
            Master new skills with
            <span className="block bg-gradient-to-r from-red-800 to-red-900 bg-clip-text text-transparent">
              expert-led courses
            </span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 mb-8 leading-relaxed">
            Join thousands of learners advancing their careers with high-quality courses from industry professionals.
          </p>

          <div className="max-w-2xl mx-auto relative">
            <IconComponent name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search for courses, instructors, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-neutral-200 focus:border-red-800 focus:ring-4 focus:ring-red-100 outline-none transition-all text-neutral-900 placeholder:text-neutral-400 shadow-sm"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Courses', value: '500+' },
            { label: 'Expert Instructors', value: '150+' },
            { label: 'Students Enrolled', value: '50K+' },
            { label: 'Course Hours', value: '10K+' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white border border-neutral-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="p-6 text-center">
                <p className="text-3xl font-bold text-red-800 mb-1">{stat.value}</p>
                <p className="text-sm text-neutral-600">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-neutral-900">Featured Courses</h2>
          <button className="text-red-800 hover:text-red-900 hover:bg-red-50 px-4 py-2 rounded-md transition-colors font-medium">
            View All →
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCourses.map((course) => (
            <div
              key={course._id}
              className="bg-white border border-neutral-200 rounded-lg hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
            >
              <div className="relative overflow-hidden">
                <div className="w-full h-48 bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                  {course.thumbnail ? (
                    <img
                      src={`${BASE_URL}${course.thumbnail}`}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <IconComponent name="book" className="w-16 h-16 text-red-800 opacity-50" />
                  )}
                </div>
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-red-800">
                  {course.category}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-neutral-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-neutral-600 mb-3">
                  {course.instructor_id?.username}
                </p>
                <div className="flex items-center gap-4 mb-3 text-sm text-neutral-600">
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-amber-500 fill-amber-500"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="font-semibold">
                      {course.rating || "New"}
                    </span>
                  </div>

                  <div className="px-2 py-1 bg-neutral-100 rounded text-xs">
                    {course.level}
                  </div>
                </div>
                <div className="flex justify-between items-center mb-3 text-sm text-neutral-600">
                  <span>{course.enrolledStudents} students</span>
                  <span className="font-bold text-red-800">Rs. {course.price}</span>
                </div>
                <button onClick={()=> navigate(`/courses/${course._id}`)} className="w-full bg-red-800 hover:bg-red-900 text-white py-2 px-4 rounded-md shadow-md hover:shadow-lg transition-all font-medium">
                  View Course
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-red-800 to-red-900 rounded-2xl shadow-2xl overflow-hidden border-0">
          <div className="p-12 text-center relative">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to advance your career?
              </h2>
              <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
                Join our community of learners and unlock your potential with expert-led courses.
              </p>
              <button className="bg-white text-red-800 hover:bg-neutral-100 shadow-lg hover:shadow-xl transition-all font-semibold px-8 py-3 rounded-lg text-lg">
                Start Learning Today
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
