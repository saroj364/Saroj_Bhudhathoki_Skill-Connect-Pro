import { useState, useEffect } from "react";

export default function HireDialog({
  isOpen,
  onClose,
  onSendHireRequest,
  ratePerHour ,
}) {
  const [title, setTitle] = useState("");
  const [hours, setHours] = useState("");
  const [budget, setBudget] = useState(0);
  const [workType, setWorkType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const h = parseFloat(hours);
    if (!isNaN(h)) {
      setBudget(h * ratePerHour);
    } else {
      setBudget(0);
    }
  }, [hours, ratePerHour]);

  const handleHire = async () => {
    if (loading) return;

    setLoading(true);

    await onSendHireRequest({
      title,
      hours,
      budget,
      workType,
      description,
    });

    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">

        <h2 className="text-xl font-bold mb-4">Hire Freelancer</h2>

        <div className="space-y-4">
          <input
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            placeholder="Job Title"
            className="w-full border p-3 rounded"
          />

          <input
            value={hours}
            onChange={(e)=>setHours(e.target.value)}
            placeholder="Hours"
            type="number"
            className="w-full border p-3 rounded"
          />

          <input
            value={budget}
            readOnly
            className="w-full border p-3 rounded bg-gray-100"
          />

          <p className="text-sm text-gray-500">
            Rate: Rs. {ratePerHour}/hr
          </p>

          <select
            value={workType}
            onChange={(e)=>setWorkType(e.target.value)}
            className="w-full border p-3 rounded"
          >
            <option >Select Work Type</option>
            <option value="UI/UX design">UI/UX Design</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Mobile Development">Mobile Development</option>
          </select>

          <textarea
            value={description}
            onChange={(e)=>setDescription(e.target.value)}
            className="w-full border p-3 rounded"
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleHire}
            disabled={loading}
            className="bg-red-800 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Hire Request"}
          </button>
        </div>
      </div>
    </div>
  );
}