import { useEffect, useState, useRef } from "react";

export default function CheckoutRedirect() {
  const [payload, setPayload] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef();
  const API_URL = import.meta.env.VITE_API_URL ;

  useEffect(() => {
    initiatePayment();
  }, []);

  const initiatePayment = async () => {
    try {
      const checkoutCart = JSON.parse(localStorage.getItem("checkout_cart")) || [];
      if (!checkoutCart.length) throw new Error("No courses selected for checkout");
      const courseIds = checkoutCart.map(item => item.course_id);
      const totalAmount = checkoutCart.reduce((sum, item) => sum + (item.price || 0), 0);
      const duration = 1; 
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/payment/esewa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseIds, duration, totalAmount })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Payment initiation failed");
      setPayload(data.payload);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    }
  };

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
        <p className="text-gray-600">Preparing payment, please wait...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <p className="mb-4 text-gray-600">
        Redirecting to eSewa payment gateway...
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