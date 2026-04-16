import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function JobPaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/client/jobs"); 
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-green-50">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-md">

        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Payment Successful!
        </h1>

        <p className="text-gray-600">
          Your job payment has been completed successfully.
          The freelancer has been credited.
        </p>

        <button
          onClick={() => navigate("/client/jobs")}
          className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg"
        >
          View Jobs
        </button>

      </div>
    </div>
  );
}