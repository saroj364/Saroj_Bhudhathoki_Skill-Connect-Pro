    import { useState } from "react";

export default function AdminSystemSettings() {
  const [activeTab, setActiveTab] = useState("platform");

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      <div className="w-64 bg-white shadow-lg p-5">
        <h2 className="text-xl font-bold mb-6">Admin Settings</h2>

        <ul className="space-y-3">
          <li onClick={() => setActiveTab("platform")}
              className={`cursor-pointer p-2 rounded ${activeTab === "platform" ? "bg-blue-500 text-white" : "hover:bg-gray-200"}`}>
            Platform Settings
          </li>

          <li onClick={() => setActiveTab("payments")}
              className={`cursor-pointer p-2 rounded ${activeTab === "payments" ? "bg-blue-500 text-white" : "hover:bg-gray-200"}`}>
            Payment History
          </li>

          <li onClick={() => setActiveTab("system")}
              className={`cursor-pointer p-2 rounded ${activeTab === "system" ? "bg-blue-500 text-white" : "hover:bg-gray-200"}`}>
            System Settings
          </li>
        </ul>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        {activeTab === "platform" && <PlatformSettings />}
        {activeTab === "payments" && <PaymentHistory />}
        {activeTab === "system" && <SystemSettings />}
      </div>
    </div>
  );
}

//////////////////////////////////////////////////////////////
// 🔹 PLATFORM SETTINGS
//////////////////////////////////////////////////////////////
function PlatformSettings() {
  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-6">Platform Settings</h2>

      <div className="grid grid-cols-2 gap-6">

        <div>
          <label className="block text-sm font-medium">Site Name</label>
          <input className="w-full border p-2 rounded mt-1" placeholder="My Platform" />
        </div>

        <div>
          <label className="block text-sm font-medium">Support Email</label>
          <input className="w-full border p-2 rounded mt-1" placeholder="support@email.com" />
        </div>

        <div>
          <label className="block text-sm font-medium">Default Currency</label>
          <select className="w-full border p-2 rounded mt-1">
            <option>USD</option>
            <option>NPR</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Maintenance Mode</label>
          <select className="w-full border p-2 rounded mt-1">
            <option>Off</option>
            <option>On</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium">Platform Description</label>
          <textarea className="w-full border p-2 rounded mt-1" rows="3" />
        </div>

      </div>

      <button className="mt-6 bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600">
        Save Changes
      </button>
    </div>
  );
}

//////////////////////////////////////////////////////////////
// 🔹 PAYMENT HISTORY
//////////////////////////////////////////////////////////////
function PaymentHistory() {
  const [tab, setTab] = useState("courses");

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-6">Payment History</h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        <button onClick={() => setTab("courses")}
          className={`px-4 py-2 rounded ${tab === "courses" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
          Course Payments
        </button>

        <button onClick={() => setTab("freelancer")}
          className={`px-4 py-2 rounded ${tab === "freelancer" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
          Freelancer Payments
        </button>
      </div>

      {/* Table */}
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">User</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Type</th>
            <th className="p-2">Date</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>

        <tbody>
          <tr className="text-center border-t">
            <td className="p-2">John Doe</td>
            <td>$120</td>
            <td>{tab === "courses" ? "Course" : "Freelancer"}</td>
            <td>2026-04-12</td>
            <td className="text-green-500">Completed</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

//////////////////////////////////////////////////////////////
// 🔹 SYSTEM SETTINGS
//////////////////////////////////////////////////////////////
function SystemSettings() {
  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-6">System Settings</h2>

      <div className="grid grid-cols-2 gap-6">

        <div>
          <label className="block text-sm font-medium">SMTP Host</label>
          <input className="w-full border p-2 rounded mt-1" placeholder="smtp.mail.com" />
        </div>

        <div>
          <label className="block text-sm font-medium">SMTP Port</label>
          <input className="w-full border p-2 rounded mt-1" placeholder="587" />
        </div>

        <div>
          <label className="block text-sm font-medium">API Key</label>
          <input className="w-full border p-2 rounded mt-1" placeholder="*********" />
        </div>

        <div>
          <label className="block text-sm font-medium">Enable Logging</label>
          <select className="w-full border p-2 rounded mt-1">
            <option>Enabled</option>
            <option>Disabled</option>
          </select>
        </div>

      </div>

      <button className="mt-6 bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600">
        Save Settings
      </button>
    </div>
  );
}