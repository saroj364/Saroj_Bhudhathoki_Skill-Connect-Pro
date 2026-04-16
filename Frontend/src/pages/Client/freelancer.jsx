import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import Navbar from '../../components/UserComponents/Navbar';
import Footer from '../../components/UserComponents/Footer';

export default function FreelancersPage() {

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedSkills, setSelectedSkills] = useState([]);

  const [freelancers, setFreelancers] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL; 
  const navigate = useNavigate();

  const categories = [
    "All",
    "Web Development",
    "UI/UX Design",
    "Mobile Development",
    "DevOps",
    "Data Science",
    "Cybersecurity",
  ];

  const skills = ["React", "Node.js", "Figma", "Python", "AWS", "MongoDB"];

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {

        const res = await axios.get(`${API_URL}/users/freelancer`);

        const formatted = res.data.data.map((f) => ({
          id: f._id,
          name: f.username,
          title: f.bio || "Freelancer",
          avatar: f.username?.charAt(0).toUpperCase(),
          avatarColor: "bg-red-800",
          available: true,
          badge: "Top Rated",
          location: f.location || "Remote",
          description: f.bio || "Experienced freelancer.",
          skills: f.skills || [],
          rating: f.rating || 0,
          reviews: f.totalReviews || 0,
          jobs: f.completedJobs || 0,
          rate: f.hourlyRate || 0,
          category: f.category || "Web Development"
        }));

        setFreelancers(formatted);
        setFiltered(formatted);

      } catch (error) {
        console.log(error);
      }
    };

    fetchFreelancers();
  }, []);

  useEffect(() => {

    let result = freelancers;

    if (searchQuery) {
      result = result.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.skills.join(" ").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeCategory !== "All") {
      result = result.filter(f => f.category === activeCategory);
    }

    if (selectedSkills.length > 0) {
      result = result.filter(f =>
        selectedSkills.every(skill => f.skills.includes(skill))
      );
    }

    setFiltered(result);

  }, [searchQuery, activeCategory, selectedSkills, freelancers]);


  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50">

        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto py-12 text-center">
            <h1 className="text-3xl font-bold">Hire Top Freelancers</h1>

            <div className="mt-6 max-w-md mx-auto relative">
              <input
                type="text"
                placeholder="Search freelancers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 pl-10"
              />
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-6 p-6">

          <aside className="bg-white p-5 rounded-xl">

            <h2 className="font-semibold mb-3">Categories</h2>

            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`block w-full text-left px-3 py-2 rounded ${
                  activeCategory === cat
                    ? "bg-red-800 text-white"
                    : "bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}

            <h2 className="mt-6 font-semibold mb-3">Skills</h2>

            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <button
                  key={skill}
                  onClick={() =>
                    setSelectedSkills(prev =>
                      prev.includes(skill)
                        ? prev.filter(s => s !== skill)
                        : [...prev, skill]
                    )
                  }
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedSkills.includes(skill)
                      ? "bg-red-800 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>

          </aside>

          <div className="lg:col-span-3 grid sm:grid-cols-2 gap-6">

            {filtered.map(f => (

              <div key={f.id} className="bg-white p-5 rounded-xl shadow-sm">

                <h3 className="font-bold">{f.name}</h3>
                <p className="text-sm text-gray-500">{f.title}</p>

                <p className="text-sm mt-2">{f.description}</p>

                <div className="flex gap-1 mt-2 flex-wrap">
                  {f.skills.map(s => (
                    <span key={s} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between mt-3 text-sm">
                  <span> {f.rating}</span>
                  <span>{f.jobs} jobs</span>
                  <span>Rs. {f.rate}/hr</span>
                </div>

                <div className="flex gap-2 mt-4">




                  <button
                    onClick={() => navigate(`/freelancer/${f.id}`)}
                    className="px-4 py-2 text-sm font-semibold text-white bg-red-700 rounded-lg shadow hover:bg-red-800 active:bg-red-900 transition duration-200 w-[100%]"
                  >
                    View
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>
      </div>

    

      <Footer />
    </>
  );
}