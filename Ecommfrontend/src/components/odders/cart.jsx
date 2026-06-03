import { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("access");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponResult, setCouponResult] = useState(null); // { discount, final_amount, message }

  // --- Fetch Cart ---
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/viewcart/`, {
        headers: authHeaders(),
      });
      if (res.status === 401) {
        setError("Session expired. Please login again.");
        return;
      }
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setCart(data?.cart || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // --- Update quantity ---
  const updateItem = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      const res = await fetch(`${API_BASE}/api/updatecart/`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ id: itemId, quantity }),
      });
      if (!res.ok) throw new Error("Update failed");
      setCouponResult(null);
      await fetchCart();
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Delete item ---
  const deleteItem = async (itemId) => {
    try {
      // Django REST doesn't parse DELETE body by default — use query param
      const res = await fetch(`${API_BASE}/api/deletecart/?id=${itemId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Delete failed");
      setCouponResult(null);
      await fetchCart();
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Apply Coupon ---
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code.");
      return;
    }
    setCouponLoading(true);
    setCouponError("");
    setCouponResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/applycoupon/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          coupon: couponCode.trim(),
          cart: cartTotal.toFixed(2),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data?.message || "Invalid coupon.");
        return;
      }
      setCouponResult(data);
    } catch (err) {
      setCouponError(err.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponResult(null);
    setCouponCode("");
    setCouponError("");
  };

  // --- Derived totals ---
  const cartTotal = cart.reduce((sum, item) => {
    const price = parseFloat(item.total_price) || 0;
    return sum + price;
  }, 0);

  const finalAmount = couponResult
    ? parseFloat(couponResult.final_amount)
    : cartTotal;

  const discountAmount = couponResult
    ? parseFloat(couponResult.discount)
    : 0;

  // ---- RENDER ----
  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="min-h-screen bg-[#F5F3EE]"
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-stone-900 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
        </div>
        <h1
          style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-xl font-bold text-stone-900 tracking-tight"
        >
          My Cart
        </h1>
        {cart.length > 0 && (
          <span className="ml-1 bg-stone-900 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            {cart.length}
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-72 gap-3">
          <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin" />
          <p className="text-stone-500 text-sm">Loading your cart…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="max-w-xl mx-auto mt-8 px-4">
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Empty cart */}
      {!loading && !error && cart.length === 0 && (
        <div className="flex flex-col items-center justify-center h-72 gap-4">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center">
            <svg className="w-9 h-9 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-stone-500 text-base font-medium">Your cart is empty</p>
          <p className="text-stone-400 text-sm">Add some items to get started</p>
        </div>
      )}

      {/* Cart content */}
      {!loading && !error && cart.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 flex gap-0"
              >
                {/* Image */}
                <div className="w-28 h-28 shrink-0 bg-stone-100 overflow-hidden">
                  <img
                    src={`${API_BASE}${item.image}`}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='112' height='112' viewBox='0 0 112 112'%3E%3Crect width='112' height='112' fill='%23e7e5e4'/%3E%3Ctext x='56' y='60' text-anchor='middle' font-size='11' fill='%23a8a29e' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col justify-between px-4 py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-stone-900 text-sm leading-tight">
                        {item.product_name}
                      </h3>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {item.varient_color && (
                          <span className="text-xs text-stone-500 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-full">
                            {item.varient_color}
                          </span>
                        )}
                        {item.varient_size && (
                          <span className="text-xs text-stone-500 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-full">
                            {item.varient_size}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Delete */}
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-stone-300 hover:text-red-400 transition-colors ml-2 mt-0.5"
                      title="Remove item"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* Price + Qty */}
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-base font-bold text-stone-900">
                      ₹{parseFloat(item.total_price).toLocaleString("en-IN")}
                    </p>
                    {/* Quantity stepper */}
                    <div className="flex items-center gap-0 border border-stone-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateItem(item.id, (item.quantity || 1) - 1)}
                        className="w-7 h-7 bg-stone-50 hover:bg-stone-100 text-stone-600 font-bold text-sm transition-colors flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-stone-800 bg-white">
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() => updateItem(item.id, (item.quantity || 1) + 1)}
                        className="w-7 h-7 bg-stone-50 hover:bg-stone-100 text-stone-600 font-bold text-sm transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Coupon box */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <h2 className="font-semibold text-stone-800 text-sm mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Apply Coupon
              </h2>

              {couponResult ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-green-800 text-sm font-semibold">{couponCode.toUpperCase()}</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-green-600 hover:text-red-500 text-xs font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-green-700 text-xs mt-1">{couponResult.message}</p>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError("");
                      }}
                      placeholder="Enter code"
                      className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm font-mono text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all bg-stone-50"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={couponLoading}
                      className="bg-stone-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {couponLoading ? (
                        <span className="flex items-center gap-1">
                          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          …
                        </span>
                      ) : "Apply"}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium">{couponError}</p>
                  )}
                </>
              )}
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <h2 className="font-semibold text-stone-800 text-sm mb-4">Order Summary</h2>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({cart.length} {cart.length === 1 ? "item" : "items"})</span>
                  <span className="font-medium text-stone-800">₹{cartTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>

                {couponResult && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17A3.001 3.001 0 015 5zm3.5 9.5a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0zm-3-1.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                      </svg>
                      Coupon Discount
                    </span>
                    <span className="font-semibold">− ₹{discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="border-t border-stone-100 pt-2.5 flex justify-between items-center">
                  <span className="font-bold text-stone-900 text-base">Total</span>
                  <div className="text-right">
                    {couponResult && (
                      <p className="text-xs text-stone-400 line-through">
                        ₹{cartTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                    )}
                    <span className="font-bold text-stone-900 text-lg">
                      ₹{finalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {couponResult && (
                <div className="mt-3 bg-green-50 rounded-lg px-3 py-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-700 text-xs font-medium">
                    You're saving ₹{discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} on this order!
                  </p>
                </div>
              )}

              <button className="mt-4 w-full bg-stone-900 hover:bg-stone-700 text-white font-semibold py-3 rounded-xl text-sm tracking-wide transition-colors shadow-sm active:scale-95 transform duration-100">
                Proceed to Checkout →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}