import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentFailed() {

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/cart");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-red-50">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-md">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Payment Failed 
        </h1>
        <p className="text-gray-600">
          Something went wrong during payment.
          You will be redirected shortly.
        </p>
        <button onClick={() => navigate("/cart")} className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg">
          Back to Cart
        </button>
      </div>
    </div>
  );
}