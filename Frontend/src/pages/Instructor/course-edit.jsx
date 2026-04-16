import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/UserComponents/Navbar";
import { useToast } from "../../components/Toast/ToastContext";

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const API_URL = import.meta.env.VITE_API_URL;
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    level: "",
    duration: "",
  });

  const [modules, setModules] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    fetchCourse();
    fetchModules();
  }, []);

  const fetchCourse = async () => {
    try {
      const res = await axios.get(`${API_URL}/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const course = res.data.data;

      setFormData({
        title: course.title,
        description: course.description,
        price: course.price,
        category: course.category,
        level: course.level,
        duration: course.duration,
      });

      setPreview(`${BASE_URL}${course.thumbnail}`);
    } catch (err) {
      error("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const res = await axios.get(`${API_URL}/instructor/modules/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setModules(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    setThumbnail(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleModuleChange = (index, field, value) => {
    const updated = [...modules];
    updated[index][field] = value;
    setModules(updated);
  };

  const addModule = () => {
    setModules([...modules, { _id: null, title: "", progressPoint: 0 }]);
  };
  const removeModule = (index) => {
    const updated = modules.filter((_, i) => i !== index);
    setModules(updated);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (thumbnail) {
        data.append("thumbnail", thumbnail);
      }

      await axios.put(`${API_URL}/instructor/edit-course/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const cleanedModules = modules.map((m) => ({
        _id: m._id || "",
        title: m.title,
        progressPoint: m.progressPoint || 0
      }));

      await axios.put(
        `${API_URL}/instructor/edit-module/${id}`,
        { modules: cleanedModules },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      success("Course and modules updated successfully");
      navigate("/instructor/courses");

    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || "Failed to update course");
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-10 w-10 border-b-2 border-red-700 rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-8">

          <h1 className="text-2xl font-bold mb-6">Edit Course</h1>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Thumbnail
              </label>

              {preview && (
                <img
                  src={preview}
                  className="w-40 h-28 object-cover rounded mb-3"
                />
              )}

              <input type="file" onChange={handleThumbnail} />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Modules</h2>

              {modules.map((mod, index) => (
                <div key={index} className="flex gap-2 mb-2">

                  <input
                    type="text"
                    placeholder="Module Title"
                    value={mod.title}
                    onChange={(e) =>
                      handleModuleChange(index, "title", e.target.value)
                    }
                    className="flex-1 border rounded px-3 py-2"
                  />

                  <input
                    type="number"
                    placeholder="Progress %"
                    value={mod.progressPoint}
                    onChange={(e) =>
                      handleModuleChange(index, "progressPoint", e.target.value)
                    }
                    className="w-28 border rounded px-2 py-2"
                  />

                  <button
                    type="button"
                    onClick={() => removeModule(index)}
                    className="bg-red-100 text-red-700 px-3 rounded"
                  >
                    X
                  </button>

                </div>
              ))}

              <button
                type="button"
                onClick={addModule}
                className="mt-2 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded"
              >
                + Add Module
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-4">

              <button
                type="button"
                onClick={() => navigate("/instructor/courses")}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800"
              >
                Save Changes
              </button>

            </div>

          </form>
        </div>
      </div>
    </>
  );
}

