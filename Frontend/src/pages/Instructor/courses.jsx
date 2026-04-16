import { useEffect, useState } from "react";
import Navbar from "../../components/UserComponents/Navbar";
import { useToast } from '../../components/Toast/ToastContext';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from "../../components/Toast/ConfirmDialog";

export default function InstructorCourses() {
  const API_URL = import.meta.env.VITE_API_URL;
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const [modulePopupOpen, setModulePopupOpen] = useState(false);
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  const fetchInstructorCourses = async () => {
    try {
      const res = await axios.get(`${API_URL}/instructor/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCourses(res.data.data);
    } catch (err) {
      console.log(err.response?.data?.message || err.message);
      error("Failed to get your courses");
    } finally {
      setLoading(false);
    }
  };

  const requestPublish = async (courseId) => {
    try {
      await axios.put(`${API_URL}/instructor/request-publish/${courseId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      success("Your request has been sent");
      fetchInstructorCourses();
    } catch (err) {
      console.log(err.response?.data?.message || err.message);
      error("Failed to request.");
    }
  };

  const handleDelete = async () => {
    try {
      if (!courseToDelete) return;

      await axios.delete(`${API_URL}/instructor/course/${courseToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      success("Course deleted successfully");
      setCourses(prev => prev.filter(c => c._id !== courseToDelete._id));
      setCourseToDelete(null);
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || "Failed to delete course");
    } finally {
      setDialogOpen(false);
    }
  };

  const viewModules = async (courseId) => {
    try {
      setLoadingModules(true);
      const res = await axios.get(`${API_URL}/instructor/modules/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModules(res.data.data);
      setModulePopupOpen(true);
    } catch (err) {
      console.error(err);
      error("Failed to load modules");
    } finally {
      setLoadingModules(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Courses</h1>
          <a href="/instructor/add-course" className="bg-red-800 hover:bg-red-900 text-white px-5 py-2 rounded-lg">
            + Add Course
          </a>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading courses...</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course._id} className="bg-white border rounded-xl shadow hover:shadow-lg transition overflow-hidden">
                <img src={`${BASE_URL}${course.thumbnail}`} alt={course.title} className="w-full h-40 object-cover"/>
                <div className="p-5">
                  <h2 className="font-bold text-lg line-clamp-2 mb-2">{course.title}</h2>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>

                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${course.isPublished
                        ? "bg-green-100 text-green-700"
                        : course.isRequested
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                      {course.isPublished
                        ? "Published"
                        : course.isRequested
                          ? "Pending Approval"
                          : "Draft"}
                    </span>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    {!course.isPublished && !course.isRequested && (
                      <button onClick={() => requestPublish(course._id)} className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-lg text-sm">
                        Request Publish
                      </button>
                    )}

                    <button
                      className="bg-neutral-100 hover:bg-neutral-200 px-4 py-2 rounded-lg text-sm"
                      onClick={() => navigate(`/instructor/edit-course/${course._id}`)}
                    >
                      Edit
                    </button>

                    <button
                      className="bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg text-sm"
                      onClick={() => {
                        setCourseToDelete(course);
                        setDialogOpen(true);
                      }}
                    >
                      Delete
                    </button>

                    <button
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-lg text-sm"
                      onClick={() => viewModules(course._id)}
                    >
                      View Modules
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Course"
        message={`Are you sure you want to delete "${courseToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {modulePopupOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 overflow-y-auto max-h-[80vh]">
            <h3 className="text-xl font-bold mb-4">Modules</h3>
            {loadingModules ? (
              <p>Loading modules...</p>
            ) : modules.length === 0 ? (
              <p>No modules found for this course.</p>
            ) : (
              <ul className="space-y-2">
                {modules.map((mod, idx) => (
                  <li key={mod._id} className="p-2 border rounded">{idx + 1}. {mod.title}</li>
                ))}
              </ul>
            )}
            <button
              className="mt-4 w-full bg-red-800 hover:bg-red-900 text-white py-2 rounded"
              onClick={() => setModulePopupOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}