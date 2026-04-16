import { useEffect, useState } from "react";
import Navbar from "../../components/UserComponents/Navbar";
import { useToast } from "../../components/Toast/ToastContext";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error }= useToast();

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }

      setUsers(data.data);
    } catch (err) {
      error("Failed to get Users")
    } finally {
      setLoading(false);
    }
  };

  // ================= APPROVE =================
  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/admin/approve-user/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to approve");

      // update UI instantly
      setUsers((prev) =>
        prev.map((user) =>
          user._id === id ? { ...user, isApproved: true } : user
        )
      );
      success("User Approved")
    } catch (err) {
      console.error(err);
      error("Failed to approve")
    }
  };

  // ================= REJECT =================
  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/admin/reject-user/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to reject");

      // remove from UI
      setUsers((prev) => prev.filter((user) => user._id !== id));
      success("User rejected")
    } catch (err) {
      console.error(err);
      error("Failed to Reject")
    }
  };

  // ================= BADGES =================
  const getRoleBadge = (role) => {
    const styles = {
      admin: "bg-red-100 text-red-600",
      instructor: "bg-blue-100 text-blue-600",
      freelancer: "bg-green-100 text-green-600",
      client: "bg-purple-100 text-purple-600",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          styles[role] || "bg-gray-100 text-gray-600"
        }`}
      >
        {role}
      </span>
    );
  };

  const getApprovalBadge = (user) => {
    if (user.role !== "freelancer") return null;

    return user.isApproved ? (
      <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
        Approved
      </span>
    ) : (
      <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
        Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading users...
      </div>
    );
  }

  

  return (
    <>
      <Navbar />

      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Users Management</h1>

        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Approval</th>
                <th className="p-4">Skills</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={user.profileImage}
                      alt="profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />

                    <div>
                      <p className="font-semibold">{user.username}</p>
                      <p className="text-xs text-gray-500">{user._id}</p>
                    </div>
                  </td>

                  <td className="p-4 text-gray-700">{user.email}</td>

                  <td className="p-4">{getRoleBadge(user.role)}</td>

                  {/* APPROVAL STATUS */}
                  <td className="p-4">{getApprovalBadge(user)}</td>

                  <td className="p-4 text-gray-600">
                    {user.skills?.join(", ") || "—"}
                  </td>

                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-4 text-right space-x-2">
                    {user.role === "freelancer" && !user.isApproved && (
                      <>
                        <button
                          onClick={() => handleApprove(user._id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => handleReject(user._id)}
                          className="px-3 py-1 bg-red-800 text-white rounded text-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}