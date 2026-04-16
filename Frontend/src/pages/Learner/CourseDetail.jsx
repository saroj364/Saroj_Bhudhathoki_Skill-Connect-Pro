import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/UserComponents/Navbar";
import axios from "axios";
import Footer from "../../components/UserComponents/Footer";
import io from "socket.io-client";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartLoading, setCartLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL; 
  const API_URL = import.meta.env.VITE_API_URL; 

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
    if (userInfo?._id) {
      newSocket.emit("register-user", userInfo._id);
    }
    newSocket.on("new-notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (!id || id.length !== 24) {
          setError("Invalid course ID.");
          setLoading(false);
          return;
        }
        const res = await axios.get(`${API_URL}/courses/${id}`);
        if (res.data.data) {
          setCourse(res.data.data);
        } else {
          setError("Course not found.");
        }
      } catch (err) {
        console.error(err);
        if (err.response?.status === 404) {
          setError("Course not found.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);
  useEffect(() => {

  const fetchModules = async () => {

    try {

      const res = await axios.get(`${API_URL}/courses/module/${id}`);

      setModules(res.data.data);

    } catch (error) {

      console.error("Failed to load modules", error);

    } finally {

      setModulesLoading(false);

    }

  };

  if (id) fetchModules();

}, [id]);
  const handleAddToCart = async () => {
    try {
      setCartLoading(true);
      setCartMessage("");
      const token = localStorage.getItem("token");
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
      if (!token) {
        navigate("/login");
        return;
      }
      await axios.post(
        `${API_URL}/cart`,
        { courseId: id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCartMessage("Course added to cart successfully.");
      if (socket && userInfo?._id) {
        socket.emit("send-notification", {
          userId: userInfo._id, 
          type: "cart",
          title: "Course Added to Cart",
          message: `You added "${course.title}" to your cart`,
          relatedCourseId: course._id,
        });
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        setCartMessage(err.response.data.message);
      } else {
        setCartMessage("Failed to add to cart.");
      }
    } finally {
      setCartLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-semibold">Loading course...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar notifications={notifications} />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="bg-gradient-to-r from-red-800 to-red-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold mb-6">{course.title}</h1>
            <div className="flex flex-wrap gap-6 mb-6 text-sm">
              <span>
                Instructor: {course.instructor_id?.username || "N/A"}
              </span>
              <span>
                Students: {course.enrolledStudents || 0}
              </span>
              <span>
                Rating: {course.rating || 0}/5
              </span>
            </div>
            <p className="text-white/90 text-lg">
              {course.description}
            </p>
          </div>
          <div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              {course.thumbnail && (
                <img
                  src={`${BASE_URL}${course.thumbnail}`}
                  alt={course.title}
                  className="rounded-lg mb-6"
                />
              )}
              <div className="text-3xl font-bold mb-2">
                RS {course.price}
              </div>
              <div className="text-sm text-white/80 mb-6">
                One-time payment
              </div>
              <div className="space-y-2 text-sm mb-6">
                <div>Level: {course.level}</div>
                <div>Category: {course.category}</div>
                <div>Duration: {course.duration || 0} months</div>
                <div>Lessons: {course.lessons || 0}</div>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="w-full bg-white text-red-800 py-3 rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-60"
              >
                {cartLoading ? "Adding..." : "Add to Cart"}
              </button>
              {cartMessage && (
                <p className="mt-4 text-sm">
                  {cartMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">
            Course Description
          </h2>
          <p className="text-gray-700 leading-relaxed mb-10">
            {course.description}
          </p>
          <h2 className="text-2xl font-bold mb-6">
            What You Will Get
          </h2>

          <div className="grid md:grid-cols-2 gap-6 text-gray-700">
            <div className="p-4 border rounded-lg">
              Duration: {course.duration || 0} months
            </div>
            <div className="p-4 border rounded-lg">
              Certificate: {course.certificate ? "Available" : "Not Included"}
            </div>
          </div>
        </div>
      </section>
      <section className="py-14 bg-gray-50">
  <div className="max-w-7xl mx-auto px-6">

    <h2 className="text-3xl font-bold mb-8">
      Course Curriculum
    </h2>

    {modulesLoading ? (

      <p className="text-gray-500">Loading modules...</p>

    ) : modules.length === 0 ? (

      <p className="text-gray-500">No modules available</p>

    ) : (

      <div className="space-y-4">

        {modules.map((module, index) => (

          <div
            key={module._id}
            className="flex items-center justify-between border rounded-lg p-5 hover:shadow-md transition"
          >

            <div className="flex items-center gap-4">

              <div className="w-8 h-8 flex items-center justify-center bg-red-800 text-white rounded-full text-sm font-semibold">
                {index + 1}
              </div>

              <div>

                <h3 className="font-semibold text-lg text-gray-900">
                  {module.title}
                </h3>

                <p className="text-sm text-gray-500">
                  Earn {module.progressPoint} points after completion
                </p>

              </div>

            </div>

            <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              {module.progressPoint} pts
            </span>

          </div>

        ))}

      </div>

    )}

  </div>
</section>
      <Footer />
    </div>
  );
}