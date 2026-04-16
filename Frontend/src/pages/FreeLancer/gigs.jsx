import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/UserComponents/Navbar";
import { useToast } from "../../components/Toast/ToastContext";

export default function FreelancerGigs() {
  const { success, error } = useToast();

  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGig, setExpandedGig] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
  try {
    setLoading(true);

    const gigsRes = await axios.get(`${API_URL}/freelancer/alljobs`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const paidRes = await axios.get(`${API_URL}/freelancer/client/completed-jobs`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const allGigs = gigsRes.data.data || [];
    const paidJobs = paidRes.data.data || [];

    const paymentMap = {};
    paidJobs.forEach((job) => {
      paymentMap[job._id] = job.payment;
    });

    const merged = allGigs.map((gig) => ({
      ...gig,
      payment: paymentMap[gig._id] || { status: "pending" },
    }));

    setGigs(merged);

  } catch (err) {
    console.error(err);
    error("Failed to fetch gigs");
  } finally {
    setLoading(false);
  }
};

  const handleAccept = async (id) => {
    try {
      await axios.put(
        `${API_URL}/freelancer/hire-requests/${id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      success("Gig accepted");
      fetchGigs();
    } catch {
      error("Failed to accept");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(
        `${API_URL}/freelancer/hire-requests/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      success("Gig rejected");
      fetchGigs();
    } catch {
      error("Failed to reject");
    }
  };

  const handleComplete = async (id) => {
    try {
      await axios.put(
        `${API_URL}/freelancer/hire-requests/${id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      success("Marked as completed");
      fetchGigs();
    } catch {
      error("Failed to complete");
    }
  };

  const toggleExpand = (id) => {
    setExpandedGig(expandedGig === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-red-800 rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">

          <h1 className="text-3xl font-bold text-gray-800 mb-6">My Gigs</h1>

          {gigs.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              No gigs found
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {gigs.map((gig) => {
              const paymentStatus = gig.payment?.status || "pending";

              return (
                <div
                  key={gig._id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-5 border border-gray-100"
                >

                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {gig.title}
                  </h2>

                  <p className="text-sm text-gray-500 mb-2">
                    Client: {gig.client?.username || "N/A"}
                  </p>

                  <p className="text-md font-medium text-gray-800 mb-3">
                    Rs {gig.budget}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {gig.requestStatus === "pending" && (
                      <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                        Pending
                      </span>
                    )}

                    {gig.status === "in-progress" && (
                      <span className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                        In Progress
                      </span>
                    )}

                    {gig.status === "completed" && (
                      <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                        Completed
                      </span>
                    )}

                    {gig.requestStatus === "rejected" && (
                      <span className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                        Rejected
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    {gig.status !== "completed" && (
                      <span className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        Not Eligible
                      </span>
                    )}

                    {gig.status === "completed" && paymentStatus === "paid" && (
                      <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                        Paid
                      </span>
                    )}

                    {gig.status === "completed" && paymentStatus === "pending" && (
                      <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                        Pending Payment
                      </span>
                    )}

                    {gig.status === "completed" && paymentStatus === "failed" && (
                      <span className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                        Failed
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">

                    <button
                      onClick={() => toggleExpand(gig._id)}
                      className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-700 rounded-lg hover:bg-red-800 transition"
                    >
                      {expandedGig === gig._id ? "Hide" : "View"}
                    </button>

                    {gig.requestStatus === "pending" && (
                      <>
                        <button
                          onClick={() => handleAccept(gig._id)}
                          className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
                        >
                          Accept
                        </button>

                        <button
                          onClick={() => handleReject(gig._id)}
                          className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {gig.status === "in-progress" && (
                      <button
                        onClick={() => handleComplete(gig._id)}
                        className="w-full px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                      >
                        Complete
                      </button>
                    )}
                  </div>

                  {expandedGig === gig._id && (
                    <div className="mt-4 pt-4 border-t text-sm text-gray-700 space-y-2">

                      <p><b>Description:</b> {gig.description}</p>
                      <p><b>Work Type:</b> {gig.workType}</p>
                      <p><b>Hours:</b> {gig.hours}</p>

                      <p><b>Status:</b> {gig.status}</p>
                      <p><b>Requested:</b> {gig.requestStatus}</p>

                      <p>
                        <b>Payment:</b>{" "}
                        {paymentStatus === "paid"
                          ? "Paid"
                          : paymentStatus === "failed"
                          ? "Failed"
                          : "Pending"}
                      </p>

                      {gig.status === "completed" && paymentStatus === "pending" && (
                        <p className="text-yellow-600 text-xs">
                          Waiting for client payment...
                        </p>
                      )}

                      <p className="text-gray-400 text-xs">
                        Created: {new Date(gig.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}