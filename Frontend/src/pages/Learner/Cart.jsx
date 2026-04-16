import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/UserComponents/Navbar';
import { useToast } from '../../components/Toast/ToastContext';
import Footer from '../../components/UserComponents/Footer';

export default function Cart() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const { success, error, warning } = useToast();

  const token = localStorage.getItem("token");

  const fetchCart = async () => {
    try {
      const res = await fetch(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const cart = data.data || [];
      const courseRequests = cart.map(item =>
        fetch(`${API_URL}/courses/${item.course_id}`).then(r => r.json())
      );

      const courses = await Promise.all(courseRequests);

      const merged = cart.map((item, index) => ({
        ...item,
        title: courses[index]?.data?.title || "Course",
        category: courses[index]?.data?.category || "Course",
        originalPrice: courses[index]?.data?.originalPrice || item.price
      }));
      setCartItems(merged);
    } catch (err) {
      error(err.message);
    }
  };

  const removeFromCart = async (courseId) => {
    try {
      const res = await fetch(`${API_URL}/cart/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      success("Removed from cart");
      fetchCart();
    } catch (err) {
      error(err.message);
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch(`${API_URL}/cart/clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      success("Cart cleared");
      fetchCart();
    } catch (err) {
      error(err.message);
    }
  };

  const handleCheckout = () => {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) {
      warning("Please login to proceed");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }
    if (!cartItems.length) {
      warning("Your cart is empty");
      return;
    }
    localStorage.setItem("checkout_cart", JSON.stringify(cartItems));
    navigate("/checkout");
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
  };

  const calculateDiscount = () => {
    return cartItems.reduce((sum, item) => {
      if (item.originalPrice && item.originalPrice > item.price) {
        return sum + (item.originalPrice - item.price);
      }
      return sum;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (!cartItems.length) {
    return (
      <>
      <Navbar/>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
        
        <div className="text-center py-24">
          <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
          <Link to="/courses" className="bg-red-800 text-white px-8 py-3 rounded-lg">
            Browse Courses
          </Link>
        </div>

        
      </div>
      <Footer/>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      <Navbar />
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white shadow rounded-xl p-6">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-semibold">Courses</h2>
              <button onClick={clearCart} className="text-red-600 text-sm">
                Clear Cart
              </button>
            </div>

            <div className="space-y-6">
              {cartItems.map(item => (
                <div key={item._id} className="border-b pb-6">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.category}
                      </p>
                    </div>
                    <button onClick={() => removeFromCart(item._id)} className="text-red-500">
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 font-bold text-red-800">
                    RS {item.price}
                  </div>
                </div>
              ))}
            </div>

          </div>
          <div className="bg-white shadow rounded-xl p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-6">
              Order Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>RS {calculateSubtotal()}</span>
              </div>

              {calculateDiscount() > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-RS {calculateDiscount()}</span>
                </div>
              )}
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-red-800">
                  RS {calculateTotal()}
                </span>
              </div>
            </div>
            <button onClick={handleCheckout} className="w-full bg-red-800 text-white py-3 rounded-lg mt-6">
              Checkout
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}