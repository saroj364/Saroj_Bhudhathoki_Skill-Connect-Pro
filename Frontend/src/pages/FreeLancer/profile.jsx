import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/UserComponents/Navbar';
import { useToast } from '../../components/Toast/ToastContext';
import axios from 'axios';

export default function FreelanceProfile() {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    skills: [],
    profileImage: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0 });

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('userInfo');

  // Predefined skill options
  const SKILL_OPTIONS = [
    'Node', 'React', 'Vue', 'Angular', 'Python', 'Django', 'Flask', 'Java', 'Spring', 'C++', 'Go', 'Ruby'
  ];

  useEffect(() => {
    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(storedUser);
    setUserInfo(user);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      bio: user.bio || '',
      skills: user.skills || [],
      profileImage: user.profileImage || ''
    });

    const fetchJobsAndStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const jobsRes = await axios.get(`${API_URL}/freelancer/client/completed-jobs`, config);
        setJobs(jobsRes.data.jobs || []);

        const statsRes = await axios.get(`${API_URL}/freelancer/stats`, config);
        setStats({
          total: statsRes.data.totalJobs || 0,
          completed: statsRes.data.completedJobs || 0,
          inProgress: statsRes.data.inProgressJobs || 0
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        error('Failed to load jobs or stats');
        setLoading(false);
      }
    };
    fetchJobsAndStats();
  }, [navigate, API_URL, error]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const handleSaveProfile = async () => {
    try {
      const updatedUser = { ...userInfo, ...formData };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUserInfo(updatedUser);
      setIsEditing(false);
      success('Profile updated!');

      await axios.put(`${API_URL}/freelancer/profile`, updatedUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      error('Failed to update profile');
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    setFormData({ ...userInfo });
    setIsEditing(false);
    setNewSkill('');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 sticky top-24 p-6">
            <div className="text-center mb-6">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-red-800 to-red-900 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4 border-4 border-white shadow-lg">
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt={formData.username} className="w-full h-full rounded-full object-cover" />
                ) : <span>{getInitials(formData.username)}</span>}
              </div>
              <h3 className="text-2xl font-bold">{formData.username}</h3>
              <p className="text-red-700">{formData.email}</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Total Jobs</p>
                  <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-xl font-bold text-gray-900">{stats.inProgress}</p>
                </div>
              </div>
            </div>

            {formData.skills.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-semibold flex items-center gap-1">
                      {skill}
                      {isEditing && (
                        <button onClick={() => handleRemoveSkill(skill)} className="text-red-700 hover:text-red-900 font-bold text-xs">×</button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-9 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-800 to-red-900 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                  {formData.profileImage ? <img src={formData.profileImage} alt={formData.username} className="w-full h-full rounded-full object-cover" /> : <span>{getInitials(formData.username)}</span>}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold">{formData.username}</h1>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <button onClick={handleSaveProfile} className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900">Save</button>
                      <button onClick={handleCancelEdit} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900">Edit Profile</button>
                  )}
                </div>

                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Add your bio..."
                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-700"
                  />
                ) : (
                  <p className="text-gray-600 mb-4">{formData.bio || 'No bio yet.'}</p>
                )}

                {isEditing && (
                  <div className="flex flex-wrap gap-2 mt-2 items-center">
                    <select
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select skill</option>
                      {SKILL_OPTIONS.filter(skill => !formData.skills.includes(skill)).map((skill, idx) => (
                        <option key={idx} value={skill}>{skill}</option>
                      ))}
                    </select>
                    <button onClick={handleAddSkill} className="px-3 py-1 bg-red-800 text-white rounded-lg">Add</button>
                  </div>
                )}
                {formData.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {formData.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-semibold flex items-center gap-1">
                        {skill}
                        {isEditing && (
                          <button 
                            onClick={() => handleRemoveSkill(skill)} 
                            className="text-red-700 hover:text-red-900 font-bold text-xs"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">My Jobs</h2>
            <div className="space-y-4">
              {jobs.map(job => (
                <div key={job.id} className="p-4 border rounded-xl flex justify-between items-center hover:shadow-lg transition-all">
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.client}</p>
                    <p className="text-sm text-gray-500">{job.budget} • Deadline: {job.deadline}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    job.status === 'completed' ? 'bg-green-100 text-green-800' :
                    job.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{job.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}