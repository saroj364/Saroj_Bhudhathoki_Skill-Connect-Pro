import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      return setMessage("Please enter your email");
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(`${API_URL}/users/forgot-password`, {
        email,
      });

      setMessage("OTP sent to your email");
      navigate('/otp-verify',{state: {email}})
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
         <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-800 rounded-2xl mb-4 shadow-lg">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">
          Forgot Password
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Enter your email to receive an OTP
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-800 text-white py-2 rounded-lg hover:bg-red-700 transition"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>

        </form>

        {message && (
          <p className="text-center mt-4 text-sm text-gray-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}