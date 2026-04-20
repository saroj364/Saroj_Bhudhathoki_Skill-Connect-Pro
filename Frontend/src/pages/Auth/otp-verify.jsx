import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp) {
      return setMessage("Please enter OTP");
    }

    try {
      setLoading(true);
      setMessage("");

      await axios.post(`${API_URL}/users/otp-verify`, {
        email,
        otp,
      });

      setMessage("OTP verified successfully");

      // Go to reset password
      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 1000);

    } catch (err) {
      setMessage(
        err.response?.data?.message || "Invalid OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-2">
          Verify OTP
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Enter the OTP sent to your email
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* OTP Input */}
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full border px-4 py-2 rounded-lg text-center tracking-widest"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

        </form>

        {message && (
          <p className="text-center mt-4 text-sm">{message}</p>
        )}
      </div>
    </div>
  );
}