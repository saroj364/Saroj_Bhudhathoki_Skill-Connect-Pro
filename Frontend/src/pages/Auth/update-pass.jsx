import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email; // passed from previous step
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      return setMessage("All fields are required");
    }

    if (password !== confirmPassword) {
      return setMessage("Passwords do not match");
    }

    try {
      setLoading(true);
      setMessage("");

      await axios.post(`${API_URL}/users/reset-password`, {
        email,
        newPassword: password,
      });

      setMessage("Password updated successfully");

      // redirect after 2 sec
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-2">
          Reset Password
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Enter your new password
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* New Password */}
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-4 py-2 rounded-lg"
          />

          {/* Confirm Password */}
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border px-4 py-2 rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-800 text-white py-2 rounded-lg hover:bg-red    -700"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

        </form>

        {message && (
          <p className="text-center mt-4 text-sm">{message}</p>
        )}
      </div>
    </div>
  );
}