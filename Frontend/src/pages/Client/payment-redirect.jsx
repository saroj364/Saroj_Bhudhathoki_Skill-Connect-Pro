import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function JobPaymentRedirect() {
  const [payload, setPayload] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL;

  const jobId = location.state?.jobId;

  useEffect(() => {
    if (!jobId) {
      setErrorMsg("Invalid job selected for payment");
      return;
    }

    const initiateJobPayment = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/payment/job/esewa`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ jobId }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to initiate job payment");
        }

        setPayload(data.payload);
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message);
      }
    };

    initiateJobPayment();
  }, [jobId]);

  useEffect(() => {
    if (payload && formRef.current) {
      formRef.current.submit();
    }
  }, [payload]);

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 font-medium">{errorMsg}</p>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Preparing job payment, please wait...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <p className="mb-4 text-gray-600">
        Redirecting to eSewa for job payment...
      </p>

      <form
        ref={formRef}
        action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
        method="POST"
      >
      {Object.entries(payload).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
      ))}
      </form>
    </div>
  );
}