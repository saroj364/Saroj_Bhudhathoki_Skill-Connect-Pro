import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/UserComponents/Navbar";
import { useNavigate } from "react-router-dom";
import { useToast } from '../../components/Toast/ToastContext';

export default function ClientCompletedJobs() {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [jobs, setJobs] = useState([]);
  const { warning } = useToast();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/client/job-track`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const completed = res.data.data.filter(
          (job) => job.status === "completed" || job.status === "paid" || job.status === "in-progress"
        );

        setJobs(completed);
      } catch (err) {
        console.error(err);
      }
    };

    fetchJobs();
  }, []);

  const handlePay = (job) => {
    if (job.status === "completed") {
      navigate("/job-payment-redirect", {
        state: { jobId: job._id },
      });
    }
    warning("Payment can be only done when completed"); //not used rn
  };

  return (
    <>
      <Navbar />

<div className="min-h-screen bg-gray-100 py-10 px-6">
  <div className="max-w-6xl mx-auto">

    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-800">
        Hired Freelancers
      </h1>
      <p className="text-gray-500 text-sm mt-1">
        Track your ongoing and completed projects
      </p>
    </div>

    <div className="space-y-6">
      {jobs.map((job) => {
        const isPaid = job.payment?.status === "paid";

        return (
          <div key={job._id} className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                {job.title}
              </h2>
              <p className="text-sm text-gray-500 mb-3">
                {job.description}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                 <span className="font-medium">Freelancer:</span>{" "}
                {job.freelancer?.username}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>Work Type: {job.workType}</span>
                <span>Time: {job.hours} hrs</span>
                <span>Budget: Rs.{job.budget}</span>
              </div>
            </div>

            <div className="flex flex-col justify-between items-end gap-4 min-w-[200px]">
              <div className="flex flex-col gap-2 items-end">
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    job.status === "completed"
                      ? "bg-blue-100 text-blue-700"
                      : job.status === "in-progress"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {job.status}
                </span>

                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    isPaid
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {isPaid ? "Paid" : "Payment Pending"}
                </span>
              </div>

              <div className="flex flex-col gap-2 w-full">
                { job.status === 'completed' && (
                    <button
                    disabled={isPaid}
                    onClick={() => handlePay(job)}
                    className={`w-full py-2 rounded-lg text-sm font-medium ${
                      isPaid
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-red-800 text-white hover:bg-red-900"
                    }`}
                  >
                    {isPaid ? "Paid" : "Pay Now"}
                  </button> 
                )} 

                <button onClick={() => navigate(`/client/chat`)} className="w-full py-2 rounded-lg text-sm font-medium bg-gray-800 text-white hover:bg-black">
                  Open Chat
                </button>

              </div>
            </div>
          </div>
        );
      })}
    </div>

    {jobs.length === 0 && (
      <div className="text-center text-gray-500 mt-10">
        No jobs found.
      </div>
    )}
  </div>
</div>
    </>
  );
}