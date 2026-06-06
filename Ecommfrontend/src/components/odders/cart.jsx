import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

/* ================= AUTH HELPERS ================= */
function getToken() {
  return localStorage.getItem("access");
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

/* ================= MAIN COMPONENT ================= */
export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponResult, setCouponResult] = useState(null);

  /* ================= FETCH CART ================= */
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/viewcart/`, {
        headers: authHeaders(),
      });

      const data = await res.json();
      console.log(data)
      if (!res.ok) throw new Error(data.message || "Failed to load cart");

      setCart(data?.cart || []);
    } catch (err) {
      setError(err.message);
    }finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  /* ================= DERIVED MATH ================= */
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
  }, [cart]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [cart]);

  const discountAmount = couponResult ? parseFloat(couponResult.discount) : 0;
  const finalAmount = couponResult ? parseFloat(couponResult.final_amount) : cartTotal;

  /* ================= UPDATE QUANTITY (OPTIMISTIC) ================= */
  const updateItem = async (itemId, newQty) => {
    if (newQty < 1) return;

    const prevCart = [...cart];

    // Optimistic Update
    setCart((items) =>
      items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQty,
              total_price: (item.total_price / (item.quantity || 1)) * newQty,
            }
          : item
      )
    );

    try {
      const res = await fetch(`${API_BASE}/api/updatecart/`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          cart_id: itemId,
          quantity: newQty,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
    } catch (err) {
      setError(err.message);
      setCart(prevCart); // Rollback on failure
    }
  };

  /* ================= DELETE ITEM ================= */
const deleteItem = async (itemId) => {
  const prevCart = [...cart];
  // Screen se instantly hatao (Optimistic)
  setCart((items) => items.filter((i) => i.id !== itemId));

  try {
    const res = await fetch(`${API_BASE}/api/deletecart/`, {
      method: "DELETE",
      headers: authHeaders(),
      body: JSON.stringify({ cart_id: itemId }), // 👈 JSON Body bheji backend ke liye
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Delete failed");
  } catch (err) {
    setError(err.message);
    setCart(prevCart); // Fail hone par wapas lao
  }
};

  /* ================= COUPON CODES ================= */
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setCouponResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/Coupon_Apply/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ coupon: couponCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid coupon code");

      setCouponResult(data);
    } catch (err) {
      setCouponError(err.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponResult(null);
    setCouponError("");
  };

  /* ================= LOADING SCREEN ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading your shopping cart...</p>
      </div>
    );
  }

  /* ================= RENDER UI ================= */
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded shadow-sm flex justify-between items-center">
            <p className="text-red-700 text-sm font-medium">{error}</p>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 font-bold">✕</button>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          
          {/* LEFT COLUMN: PRODUCTS LIST */}
          <div className="lg:col-span-8 bg-white rounded-lg shadow-sm p-6 mb-6 lg:mb-0">
            <div className="border-b border-gray-200 pb-4 mb-4 flex justify-between items-end">
              <h2 className="text-xl font-semibold text-gray-800">Items</h2>
              <span className="text-sm text-gray-500">Price</span>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-500 font-medium mb-4">Your Cart is empty.</p>
                <a href="/" className="text-amber-600 hover:text-amber-700 hover:underline font-medium">
                  Continue shopping
                </a>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <div key={item.id} className="py-6 flex flex-col sm:flex-row justify-between first:pt-0 last:pb-0">
                    
                    {/* Product Metadata & Image */}
                    <div className="flex gap-4 sm:gap-6">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-md border border-gray-200 overflow-hidden flex-shrink-0">
                        <img
                          src={item.product_image || "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300&auto=format&fit=crop&q=60"}
                          alt={item.product_name}
                          className="w-full h-full object-contain object-center"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300&auto=format&fit=crop&q=60";
                          }}
                        />
                      </div>

                      <div className="flex flex-col justify-between">
                        <div>
                          <h3 className="text-base sm:text-lg font-medium text-gray-900 hover:text-amber-600 cursor-pointer">
                            {item.product_name}
                          </h3>
                          <p className="text-xs text-green-600 mt-1">In Stock</p>
                          {item.variant && (
                            <p className="text-xs text-gray-500 mt-1">Variant: {item.variant}</p>
                          )}
                        </div>

                        {/* Quantity Counter Buttons & Actions */}
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center border border-gray-300 rounded-md shadow-sm bg-gray-50">
                            <button
                              type="button"
                              disabled={item.quantity <= 1}
                              onClick={() => updateItem(item.id, item.quantity - 1)}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-200 transition rounded-l-md disabled:opacity-40"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 font-semibold text-sm text-gray-800 bg-white border-x border-gray-300">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateItem(item.id, item.quantity + 1)}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-200 transition rounded-r-md"
                            >
                              +
                            </button>
                          </div>

                          <div className="h-4 w-px bg-gray-300"></div>

                          <button
                            type="button"
                            onClick={() => deleteItem(item.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Single Item Total Price Display */}
                    <div className="mt-4 sm:mt-0 text-right">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{(parseFloat(item.total_price) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: SUMMARY & COUPON (STICKY SIDEBAR) */}
          <div className="lg:col-span-4 lg:sticky lg:top-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm text-gray-600 border-b border-gray-200 pb-4">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItemsCount} items):</span>
                  <span className="font-medium text-gray-900">₹{cartTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                
                {couponResult && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount Applied:</span>
                    <span>-₹{discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500">
                  <span>Shipping:</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-4 mb-6">
                <span className="text-base font-medium text-gray-900">Order Total:</span>
                <span className="text-2xl font-bold text-amber-600">
                  ₹{finalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* CHECKOUT BUTTON */}
              <button
                disabled={cart.length === 0}
                className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-medium py-3 px-4 rounded-md shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Proceed to Buy
              </button>

              {/* PROMO / COUPON FIELD */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Promotional Code
                </label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    disabled={couponResult !== null}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                    placeholder="E.g. SAVE20"
                  />
                  
                  {couponResult ? (
                    <button
                      onClick={removeCoupon}
                      className="border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded text-sm font-medium transition"
                    >
                      Clear
                    </button>
                  ) : (
                    <button
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium transition disabled:opacity-50"
                    >
                      {couponLoading ? "Applying..." : "Apply"}
                    </button>
                  )}
                </div>

                {couponError && <p className="text-red-500 text-xs mt-2 font-medium">{couponError}</p>}
                {couponResult && <p className="text-green-600 text-xs mt-2 font-medium">✓ Coupon applied successfully!</p>}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}