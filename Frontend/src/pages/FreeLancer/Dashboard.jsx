import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/UserComponents/Navbar";
import Footer from "../../components/UserComponents/Footer";
import axios from "axios";
import { useToast } from "../../components/Toast/ToastContext";

export default function FreelancerDashboard() {
  const navigate = useNavigate();
  const { error, success } = useToast();

  const [userInfo, setUserInfo] = useState(null);
  const [jobs, setJobs] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [completedJobs, setCompletedJobs] = useState(0);
  const [recentProjects, setRecentProjects] = useState([]);
  const [hireRequests, setHireRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("userInfo");
  const API_URL = import.meta.env.VITE_API_URL;

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };


  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/freelancer/stats`, authHeader);

      setJobs(res.data?.totalJobs || 0);
      setCompletedJobs(res.data?.completedJobs || 0);
      setEarnings(res.data?.earnings || 0);
    } catch {
      error("Failed to load stats");
    }
  };

  const fetchRecentProjects = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/freelancer/recent-projects`,
        authHeader
      );
      setRecentProjects(res.data?.data || []);
    } catch {
      error("Failed to load projects");
    }
  };

  const fetchHireRequests = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/freelancer/hire-requests`,
        authHeader
      );
      setHireRequests(res.data?.data || []);
    } catch {
      error("Failed to load hire requests");
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchRecentProjects(),
      fetchHireRequests(),
    ]);
    setLoading(false);
  };


  const handleRequestAction = async (id, action) => {
    try {
      await axios.put(
        `${API_URL}/freelancer/hire-requests/${id}/${action}`,
        {},
        authHeader
      );

      success(`Request ${action}ed`);

      fetchHireRequests();
      fetchStats();
    } catch {
      error(`Failed to ${action} request`);
    }
  };


  useEffect(() => {
    if (!storedUser || !token) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);

    if (user.role !== "freelancer") {
      navigate("/");
      return;
    }

    setUserInfo(user);
    loadAllData();
  }, []);


  if (!userInfo || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-red-800 rounded-full"></div>
      </div>
    );
  }


  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50">
        <header className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Freelancer Dashboard
            </h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-red-800 to-red-900 text-white p-8 rounded-lg shadow mb-8">
            <h2 className="text-3xl font-bold">
              Welcome back, {userInfo.username}!
            </h2>
            <p className="text-red-100">
              Manage your gigs and track your performance
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Jobs" value={jobs} />
            <StatCard title="Completed" value={completedJobs} color="text-green-600" />
            <StatCard title="Earnings" value={`Rs. ${earnings}`} color="text-purple-600" />
            <StatCard title="Rating" value="4.5" color="text-yellow-500" />
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Incoming Hire Requests
            </h2>

            {hireRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-6">
                No new hire requests
              </p>
            ) : (
              <div className="space-y-4">
                {hireRequests.map((req) => (
                  <div
                    key={req._id}
                    className="border rounded-lg p-4 flex flex-col md:flex-row md:justify-between gap-4 hover:shadow-md"
                  >
                    <div>
                      <h3 className="font-semibold">{req.projectTitle}</h3>
                      <p className="text-sm text-gray-600">
                        Client: {req.clientName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {req.message || "No message"}
                      </p>
                      <p className="text-red-800 font-semibold">
                        Rs. {req.budget}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleRequestAction(req._id, "accept")
                        }
                        className="px-4 py-2 bg-green-600 text-white rounded h-10 "
                      >
                        Accept
                      </button>

                      <button
                        onClick={() =>
                          handleRequestAction(req._id, "reject")
                        }
                        className="px-4 py-2 bg-gray-300 rounded h-10"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <ProjectSection projects={recentProjects} navigate={navigate} />
        </main>
      </div>

      <Footer />
    </>
  );
}

const StatCard = ({ title, value, color = "text-gray-900" }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <p className="text-sm text-gray-600">{title}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const ProjectSection = ({ projects, navigate }) => (
  <>
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>

      {projects.length === 0 ? (
        <p className="text-gray-500 text-center py-6">
          No recent projects found
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <div key={proj._id} className="border rounded-lg p-4">
              <h3 className="font-semibold">{proj.title}</h3>
              <p className="text-sm text-gray-600">
                {proj.description?.slice(0, 60)}...
              </p>

              <div className="flex justify-between mt-3">
                <span className="text-red-800 font-semibold">
                  Rs. {proj.budget}
                </span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {proj.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="text-center py-10">
      <button
        onClick={() => navigate("/freelancer/gigs")}
        className="px-6 py-2 bg-red-800 text-white rounded-lg"
      >
        View All Projects
      </button>
    </div>
  </>
);