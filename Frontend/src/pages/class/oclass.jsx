import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/UserComponents/Navbar";
import { useToast } from "../../components/Toast/ToastContext";
import { useNavigate } from "react-router-dom";
export default function OnlineClassesPage() {
  const { success, error } = useToast();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("userInfo"));
  const [meeting, setMeeting] = useState(null);
  const [tokenUrl, setTokenUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_URL}/courses/online-class`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      error("Failed to load classes");
      setLoading(false);
    }
  };

  const handleJoin = async (id) => {
    try {
      await axios.post(`${API_URL}/courses/join/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      success("Joined class!");
      fetchClasses();
    } catch (err) {
      error(err.response?.data?.message || "Join failed");
    }
  };

  const handleComplete = async (id) => {
    try {
      await axios.post(`${API_URL}/online-class/complete/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      success("Class completed!");
      fetchClasses();
    } catch (err) {
      error("Failed to complete class");
    }
  };

  const isJoined = (cls) => {
    return cls.users_joined?.some(
      (u) => u.user_id?._id === user?._id
    );
  };

  const isInstructor = (cls) => {
    return cls.instructor_id?._id === user?._id;
  };

  const getStatusColor = (status) => {
    if (status === "live") return "bg-green-100 text-green-800";
    if (status === "completed") return "bg-gray-100 text-gray-800";
    return "bg-yellow-100 text-yellow-800";
  };
 const handleOpenClass = (cls) => {
    const isInstructorUser = cls.instructor_id === user?._id;
    navigate(`/class/${cls.url}`, { state: { isInstructor: isInstructorUser } });
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-red-800 rounded-full"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Online Classes</h1>
        <div className="grid md:grid-cols-2 gap-6">
          {classes.map((cls) => {
            const joined = isJoined(cls);
            const instructor = isInstructor(cls);
            return (
              <div
                key={cls._id}
                className="bg-white rounded-2xl shadow-lg p-6 border hover:shadow-xl transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-bold">
                    {cls.module_id?.title}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      cls.status
                    )}`}
                  >
                    {cls.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  Course: {cls.course_id?.title || "N/A"}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  Instructor: {cls.instructor_id?.username || "N/A"}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Start:{" "}
                  {cls.start_time
                    ? new Date(cls.start_time).toLocaleString()
                    : "Not scheduled"}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  {cls.users_joined?.length || 0} joined
                </p>
                <div className="flex gap-2 flex-wrap">
                  {!joined && cls.status !== "completed" && (
                    <button onClick={() => handleJoin(cls._id)} className="flex-1 bg-red-800 text-white py-2 rounded-lg hover:bg-red-900">
                      Join Class
                    </button>
                  )}

                  {(joined || instructor) && cls.status !== "completed" && (
                    <button
                    onClick={() => handleOpenClass(cls)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-center hover:bg-blue-700"
                    >
                    Open Class
                    </button>
                    )}
                  {instructor && cls.status !== "completed" && (
                    <button onClick={() => handleComplete(cls._id)} className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800">
                      Complete
                    </button>
                  )}
                </div>

                {cls.users_joined?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-1">
                      Joined Users:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {cls.users_joined.slice(0, 5).map((u, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-100 rounded text-xs"
                        >
                          {u.user_id?.username || "User"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {classes.length === 0 && (
          <div className="text-center mt-20 text-gray-500">
            No online classes available
          </div>
        )}
      </div>
    </div>
  );
}