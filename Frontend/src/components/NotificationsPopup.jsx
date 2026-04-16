import { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function NotificationsPopup({ isOpen, onClose, setUnreadCount }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setNotifications(res.data.data || []);
        setUnreadCount(0); // reset counter when popup opens

      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    const socket = io(SOCKET_URL);

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) socket.emit("register-user", userInfo._id);

    socket.on("receive-notification", (notification) => {

      setNotifications((prev) => [notification, ...prev]);

      setUnreadCount((prev) => prev + 1);

    });

    return () => socket.disconnect();

  }, [isOpen, setUnreadCount]);

  const formatTimestamp = (date) => {
    const now = new Date();
    const diff = now - new Date(date);

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

    return new Date(date).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed top-20 right-4 w-full max-w-md bg-white rounded-xl shadow-2xl z-50 border border-gray-200 overflow-hidden">

        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">
            Notifications
          </h1>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[500px] overflow-y-auto">

          {loading ? (
            <div className="py-16 text-center">
              <div className="animate-spin h-8 w-8 border-b-2 border-red-800 rounded-full mx-auto"></div>
            </div>

          ) : notifications.length === 0 ? (

            <div className="py-16 text-center text-gray-500">
              No notifications yet
            </div>

          ) : (

            notifications.map((notification) => (

              <div
                key={notification._id}
                className={`px-6 py-4 border-b hover:bg-gray-50 ${
                  !notification.isRead ? "bg-blue-50/30" : ""
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {formatTimestamp(notification.createdAt)}
                    </span>

                  </div>

                  <p className="text-sm text-gray-600">
                    {notification.message}
                  </p>

                </div>

              </div>

            ))

          )}

        </div>

        {notifications.length > 0 && (
          <div className="border-t px-6 py-3 text-center">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
        )}

      </div>
    </>
  );
}