import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/UserComponents/Navbar";
import { useToast } from "../../components/Toast/ToastContext";

export default function CreateOnlineClass() {
  const { success, error } = useToast();

  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [formData, setFormData] = useState({
    course_id: "",
    module_id: "",
    start_time: ""
  });

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API_URL}/courses/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data.data || []);
    } catch (err) {
      error("Failed to load courses");
    }
  };

  const fetchModules = async (courseId) => {
    try {
      const res = await axios.get(`${API_URL}/courses/module/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModules(res.data.data || []);
    } catch (err) {
      error("Failed to load modules");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    if (name === "course_id") {
      fetchModules(value);
      setFormData(prev => ({ ...prev, course_id: value, module_id: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.course_id || !formData.module_id || !formData.start_time) {
      return error("All fields are required");
    }

    try {
      await axios.post(`${API_URL}/instructor/online-class`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      success("Online class created!");

      setFormData({
        course_id: "",
        module_id: "",
        start_time: ""
      });
      setModules([]);

    } catch (err) {
      console.error(err);
      error("Failed to create class");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-lg border">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Create Online Class
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-semibold mb-1">
              Select Course
            </label>
            <select
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">-- Select Course --</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Module Select */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Select Module
            </label>
            <select
              name="module_id"
              value={formData.module_id}
              onChange={handleChange}
              disabled={!formData.course_id}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">-- Select Module --</option>
              {modules.map(module => (
                <option key={module._id} value={module._id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-red-800 text-white py-3 rounded-xl font-semibold hover:bg-red-900 transition"
          >
            Create Class
          </button>
        </form>
      </div>
    </div>
  );
}