import { useState } from "react";
import Navbar from "../../components/UserComponents/Navbar";
import Footer from "../../components/UserComponents/Footer";
import { useToast } from '../../components/Toast/ToastContext';
import axios from "axios";

export default function AddCourse() {
  const { success, error } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    duration: "",
    category: "",
    level: "",
    thumbnail: "",
  });

  const [modules, setModules] = useState([{ title: "", progressPoint: 0 }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleModuleChange = (index, e) => {
    const newModules = [...modules];
    newModules[index][e.target.name] = e.target.value;
    setModules(newModules);
  };

  const addModule = () => {
    if (modules.length >= 12) return;
    setModules([...modules, { title: "", progressPoint: 0 }]);
  };

  const removeModule = (index) => {
    const newModules = [...modules];
    newModules.splice(index, 1);
    setModules(newModules);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.price || !formData.duration || !formData.category) {
      setMessage("Please fill all required fields");
      return;
    }

    if (modules.length === 0 || modules.every(mod => !mod.title)) {
      setMessage("Please add at least one module");
      return;
    }

    if (modules.length > 12) {
      setMessage("Maximum 12 modules allowed");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const token = localStorage.getItem("token");

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("duration", formData.duration);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("level", formData.level || "beginner");

      if (formData.thumbnail) {
        formDataToSend.append("thumbnail", formData.thumbnail);
      }

      formDataToSend.append("modules", JSON.stringify(modules));

      const res = await axios.post(`${API_URL}/instructor/course`, formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      success("Course and modules added successfully!");
      setMessage("Course added successfully!");
      
      setFormData({
        title: "",
        description: "",
        price: "",
        duration: "",
        category: "",
        level: "",
        thumbnail: ""
      });
      setModules([{ title: "", progressPoint: 0 }]);

    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || "Failed to add course");
      setMessage(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8">
        <h2 className="text-3xl font-bold mb-6">Add New Course</h2>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow border">

          <input name="title" value={formData.title} onChange={handleChange} placeholder="Course Title" className="w-full border p-3 rounded" required />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Course Description" className="w-full border p-3 rounded" rows="4" required />
          <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Price" className="w-full border p-3 rounded" required />
          <input name="duration" type="number" value={formData.duration} onChange={handleChange} placeholder="Duration (months)" className="w-full border p-3 rounded" required />
          <select name="category" value={formData.category} onChange={handleChange} className="w-full border p-3 rounded" required>
            <option value="">Select Category</option>
            <option value="web development">Web Development</option>
            <option value="backend">Backend</option>
            <option value="frontend">Frontend</option>
            <option value="mobile">Mobile</option>
            <option value="devops">DevOps</option>
            <option value="cybersecurity">Cybersecurity</option>
            <option value="data science">Data Science</option>
            <option value="machine learning">Machine Learning</option>
            <option value="ui/ux design">UI/UX Design</option>
            <option value="cloud computing">Cloud Computing</option>
            <option value="database">Database</option>
          </select>
          <select name="level" value={formData.level} onChange={handleChange} className="w-full border p-3 rounded">
            <option value="">Select Level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <lable className="block text-sm font-medium mb-1">Thumbnail</lable>
          <input name="thumbnail" type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files[0] })} className="w-full border p-3 rounded" />

          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Modules (max 12)</h3>
            {modules.map((mod, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  name="title"
                  value={mod.title}
                  onChange={(e) => handleModuleChange(idx, e)}
                  placeholder={`Module ${idx + 1} Title`}
                  className="w-2/3 border p-2 rounded"
                  required
                />
                <input
                  name="progressPoint"
                  type="number"
                  value={mod.progressPoint}
                  onChange={(e) => handleModuleChange(idx, e)}
                  placeholder="Progress"
                  className="w-1/4 border p-2 rounded"
                />
                <button type="button" onClick={() => removeModule(idx)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">X</button>
              </div>
            ))}
            {modules.length < 12 && (
              <button type="button" onClick={addModule} className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                Add Module
              </button>
            )}
          </div>

          {message && <p className="text-sm text-red-600 text-center">{message}</p>}

          <button type="submit" disabled={loading} className="w-full bg-red-800 hover:bg-red-900 text-white py-3 rounded font-semibold transition">
            {loading ? "Saving..." : "Add Course"}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}