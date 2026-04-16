import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/UserComponents/Navbar";
import axios from "axios";
import Footer from "../../components/UserComponents/Footer";
import { useToast } from '../../components/Toast/ToastContext';
export default function Courses() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const {error} = useToast();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL ; 
  const BASE_URL = import.meta.env.VITE_BASE_URL ; 

  const categories = [
    "All",
    'web development',
        'backend',
        'frontend',
        'mobile development',
        'devops',
        'cybersecurity',
        'data science',
        'machine learning',
        'cloud computing',
        'database',
        'ui/ux design'
  ];

  const levels = ["All", "beginner", "intermediate", "advanced"];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_URL}/courses`);
        setCourses(res.data.data ?? []);
      } catch (err) {
        error("Failed to get courses")
        console.log("Error fetching courses:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  let filteredCourses = Array.isArray(courses) ? courses : [];

  if (selectedCategory !== "All") {
    filteredCourses = filteredCourses.filter(
      (course) => course.category === selectedCategory
    );
  }

  if (selectedLevel !== "All") {
    filteredCourses = filteredCourses.filter(
      (course) => course.level === selectedLevel
    );
  }

  if (searchTerm) {
    filteredCourses = filteredCourses.filter((course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (sortOption === "priceLow") {
    filteredCourses = filteredCourses.sort((a, b) => a.price - b.price);
  }

  if (sortOption === "priceHigh") {
    filteredCourses = filteredCourses.sort((a, b) => b.price - a.price);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-semibold">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      <Navbar />

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Popular Courses
            </h2>
          </div>

          {/* Search + Filters */}
          <div className="grid md:grid-cols-4 gap-4 mb-10">

            <input
              type="text"
              placeholder="Search courses..."
              className="border border-gray-300 rounded-lg px-4 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className="border border-gray-300 rounded-lg px-4 py-2"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              {levels.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>

            <select
              className="border border-gray-300 rounded-lg px-4 py-2"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="">Sort By</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>

          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition ${
                  selectedCategory === category
                    ? "bg-red-800 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-red-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Course Grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

              {filteredCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden"
                >

                  <div className="h-48 bg-gray-200">
                    <img src={`${BASE_URL}${course.thumbnail}`} className="w-full h-48 object-cover" alt={course.title}/>
                  </div>

                  <div className="p-6">

                    <h3
                      onClick={() => navigate(`/courses/${course._id}`)}
                      className="text-xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-red-800"
                    >
                      {course.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="text-sm text-gray-600 mb-3">
                      Instructor: {course.instructor_id?.username}
                    </div>

                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                      <span>Level: {course.level}</span>
                      <span>Duration: {course.duration} months</span>
                    </div>

                    <div className="flex justify-between items-center border-t pt-4">
                      <span className="text-2xl font-bold text-red-800">
                        RS {course.price}
                      </span>

                      <button
                        onClick={() => navigate(`/courses/${course._id}`)}
                        className="bg-red-800 text-white px-5 py-2 rounded-lg hover:bg-red-900"
                      >
                        View Details
                      </button>
                    </div>

                  </div>
                </div>
              ))}

            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No courses found.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}