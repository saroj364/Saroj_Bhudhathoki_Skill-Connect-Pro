import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast/ToastContext';
import Navbar from '../../components/UserComponents/Navbar';

import axios from 'axios';

export default function AdminCourses() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const API_URL = import.meta.env.VITE_API_URL;
  const BASE_URL = import.meta.env.VITE_BASE_URL; 
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL; 
  const [modulePopupOpen, setModulePopupOpen] = useState(false);
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [selectedCourse, setSelectedCourse ] = useState(false);

  
  useEffect(() => {
    if ( !user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCourses(res.data.data || []);
    } catch (err) {
      console.error(err);
      error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId) => {
    try {
      const token = localStorage.getItem('token');

      await axios.put(
        `${API_URL}/admin/courses/approve/${courseId}`,{

        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      success('Course approved successfully');
      setCourses((prev) =>
        prev.map((course) =>
          course._id === courseId
            ? { ...course, isPublished: true, isRequested: true }
            : course
        )
      );
    } catch (err) {
      error('Failed to approve course');
    }
  };

  const handleReject = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/admin/courses/reject/${courseId}`,{
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      success('Course rejected successfully');
      setCourses((prev) =>
        prev.filter((course) => course._id !== courseId)
      );
    } catch (err) {
      error('Failed to reject course');
    }
  };
  const toggleExpand = (courseId) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
    }
  };
  const viewModules = async (course) => {
  try {
    setSelectedCourse(course);
    setLoadingModules(true);

    const res = await axios.get(
      `${API_URL}/admin/courses/module/${course._id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setModules(res.data.data || []);
    setModulePopupOpen(true);
  } catch (err) {
    console.error(err);
    error("Failed to load modules");
  } finally {
    setLoadingModules(false);
  }
};
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
      </div>
    );
  }

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Review Courses
          </h1>
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Instructor
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {courses.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No courses found
                  </td>
                </tr>
              )}

              {courses.map((course) => (
                <React.Fragment key={course._id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <img
                        src={`${BASE_URL}${course.thumbnail}`}
                        alt={course.title}
                        className="w-14 h-14 rounded-md object-cover"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{course.title}</div>
                        <div className="text-sm text-gray-500">{course.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{course.instructor_id?.username || "N/A"}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">Rs {course.price}</td>
                    <td className="px-6 py-4">
                      {course.isPublished ? (
                        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          Approved
                        </span>
                      ) : course.isRequested ? (
                        <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                          Pending
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => toggleExpand(course._id)}
                        className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300"
                      >
                        {expandedCourse === course._id ? "Hide" : "View"}
                      </button>
                      {!course.isPublished && course.isRequested && (
                        <>  
                          <button
                            onClick={() => handleApprove(course._id)}
                            className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(course._id)}
                            className="px-3 py-1 bg-red-800 text-white rounded-md text-sm hover:bg-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                  {expandedCourse === course._id && (
                    <tr className="bg-gray-50">
                      <td colSpan="5" className="px-6 py-6">
                        <div className="grid md:grid-cols-3 gap-6">
                          <div>
                            <img
                              src={`${BASE_URL}${course.thumbnail}`}
                              className="rounded-lg w-full h-40 object-cover"
                            />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                            <p>
                              <span className="font-semibold">Description:</span> {course.description}
                            </p>
                            <p>
                              <span className="font-semibold">Category:</span> {course.category}
                            </p>
                            <p>
                              <span className="font-semibold">Level:</span> {course.level}
                            </p>
                            <p>
                              <span className="font-semibold">Duration:</span> {course.duration} months
                            </p>
                            <p>
                              <span className="font-semibold">Students:</span> {course.enrolledStudents}
                            </p>
                            <p>
                              <span className="font-semibold">Created:</span>{" "}
                              {new Date(course.createdAt).toLocaleDateString()}
                            </p>
                            <button
                              onClick={() => viewModules(course)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                            >
                              Modules
                            </button>
                            {modulePopupOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 relative">
      
      {/* Close Button */}
      <button
        onClick={() => setModulePopupOpen(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-black"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold mb-4">
        Modules - {selectedCourse?.title}
      </h2>

      {loadingModules ? (
        <div className="text-center py-6">Loading modules...</div>
      ) : modules.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          No modules found
        </div>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {modules.map((mod, index) => (
            <div
              key={mod._id}
              className="border rounded-lg p-4 bg-gray-50"
            >
              <h3 className="font-semibold text-lg">
                {index + 1}. {mod.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {mod.description}
              </p>

              {/* Optional: Lessons */}
              {mod.lessons?.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
                  {mod.lessons.map((lesson) => (
                    <li key={lesson._id}>{lesson.title}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
}