import { useState } from "react";
import Footer from "../../components/UserComponents/Footer";
import Navbar from "../../components/UserComponents/Navbar";

export default function Contact() {
  const API_URL = import.meta.env.VITE_API_URL ;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSuccess("Message sent successfully!");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-neutral-50 py-16 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
        <div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Contact Us
          </h1>

          <p className="text-neutral-600 mb-6">
            Have questions about our courses or platform?  
            Send us a message and our team will respond as soon as possible.
          </p>

          <div className="space-y-4 text-neutral-700">

            <div>
              <p className="font-semibold">Email</p>
              <p>support@learnhub.com</p>
            </div>

            <div>
              <p className="font-semibold">Phone</p>
              <p>+977 9800000000</p>
            </div>

            <div>
              <p className="font-semibold">Location</p>
              <p>Kathmandu, Nepal</p>
            </div>

          </div>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg border border-neutral-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Message
              </label>
              <textarea
                rows="4"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-800"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            {success && (
              <p className="text-green-600 text-sm">{success}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-800 hover:bg-red-900 text-white py-2 rounded-md font-semibold transition"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>

          </form>

        </div>

      </div>
    </div>
    <Footer />
    </>
  );
}