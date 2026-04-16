import { useEffect, useState } from "react";
import Navbar from "../../components/UserComponents/Navbar";
import Footer from "../../components/UserComponents/Footer";
import { useToast } from "../../components/Toast/ToastContext";

export default function OrdersPage() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const {success, error} = useToast();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setOrders(data.data || []);
      }

    } catch (err) {
      console.log(err);
      error("Failed to get your orders");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <>
      <Navbar/>
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-2">No Orders Found</h2>
        <p className="text-gray-500">You haven't purchased any courses yet.</p>
      </div>
      <Footer/>
      </>
    );
  }

  return (
    <>
    <Navbar/>
    <div className="max-w-6xl mx-auto p-40">

      <h1 className="text-3xl font-bold mb-8">
        My Orders
      </h1>

      <div className="grid gap-6">

        {orders.map(order => (

          <div
            key={order._id}
            className="flex items-center justify-between bg-white shadow-md rounded-xl p-4"
          >

            <div className="flex items-center gap-4">

              <img
                src={order.course_id?.thumbnail || "/placeholder.jpg"}
                alt="course"
                className="w-24 h-16 object-cover rounded"
              />

              <div>

                <h2 className="font-semibold text-lg">
                  {order.course_id?.title || "Course"}
                </h2>

                <p className="text-gray-500 text-sm">
                  Duration: {order.duration} month
                </p>

                <p className="text-gray-500 text-sm">
                  Payment: {order.payment_method}
                </p>

                <p className="text-gray-400 text-xs">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>

              </div>
            </div>

            <div className="text-right">

              <p className="font-bold text-lg mb-1">
                Rs {order.total_amount}
              </p>

              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  order.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : order.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {order.status}
              </span>

            </div>

          </div>

        ))}

      </div>
    </div>
    <Footer/>
    </>
  );
}