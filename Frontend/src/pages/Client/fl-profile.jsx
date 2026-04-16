import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/UserComponents/Navbar";
import Footer from "../../components/UserComponents/Footer";
import HireDialog from "../../components/Hire";
import { useToast } from "../../components/Toast/ToastContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function FreelancerProfile() {
  const { id } = useParams();

  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hireOpen, setHireOpen] = useState(false);

  const [payload, setPayload] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const { success, error } =useToast();
  const formRef = useRef();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/freelancer/${id}`);
        setFreelancer(res.data.data);
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load freelancer");
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancer();
  }, [id]);

 const sendHireRequest = async (data) => {
  try {
    const res = await axios.post(
      `${API_URL}/users/freelancer/create`,
      {
        freelancerId: freelancer._id,
        ...data, // form data
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );


    success("Hire request has been sent")
  } catch (err) {
    error(err);
    setErrorMsg("Failed to send hire request");
  }
};
  useEffect(() => {
    if (payload && formRef.current) {
      formRef.current.submit();
    }
  }, [payload]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin w-10 h-10 border-b-2 border-red-800 rounded-full"></div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{errorMsg}</p>
      </div>
    );
  }

  if (payload) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="mb-4 text-gray-600">
          Redirecting to eSewa for hiring...
        </p>

        <form
          ref={formRef}
          action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
          method="POST"
        >
          {Object.entries(payload).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        </form>
      </div>
    );
  }

  if (!freelancer) return null;

  return (
    <>
      <Navbar />

      <div className="bg-gradient-to-b from-red-50 to-white pb-16">
        <div className="h-40 bg-gradient-to-r from-red-800 to-red-600"></div>

        <div className="max-w-6xl mx-auto px-4 -mt-16">
          <div className="bg-white rounded-2xl shadow-lg border p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-center">

              <div className="w-24 h-24 rounded-full bg-red-800 text-white flex items-center justify-center text-4xl font-bold">
                {freelancer.username?.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold">
                  {freelancer.username}
                </h1>

                <p className="text-gray-500 mt-1">
                  {freelancer.bio}
                </p>

                <div className="flex gap-4 mt-3 text-sm">
                  <span className="text-yellow-500 font-semibold">
                    {freelancer.rating}
                  </span>

                  <span className="text-gray-500">
                    {freelancer.location}
                  </span>

                  <span className="text-gray-500 capitalize">
                    {freelancer.experienceLevel}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {freelancer.badges?.map((badge) => (
                    <span
                      key={badge}
                      className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-center md:text-right">
                <p className="text-gray-400 text-sm">Hourly Rate</p>

                <p className="text-3xl font-bold">
                  Rs. {freelancer.hourlyRate}
                </p>

                <button
                  onClick={() => setHireOpen(true)}
                  className="bg-red-800 text-white px-6 py-2 rounded-lg mt-3"
                >
                  Hire Freelancer
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Skills</h2>

            <div className="flex flex-wrap gap-3">
              {freelancer.skills?.map((skill) => (
                <span
                  key={skill}
                  className="bg-red-50 text-red-700 px-4 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">About</h2>

            <p className="text-gray-600">
              {freelancer.bio}
            </p>
          </div>
        </div>
      </div>

      <HireDialog
  isOpen={hireOpen}
  onClose={() => setHireOpen(false)}
  onSendHireRequest={sendHireRequest}
  ratePerHour={freelancer.hourlyRate}
  />
    </>
  );
}