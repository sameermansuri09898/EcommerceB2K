import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

/* ================= AUTH ================= */
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

/* ================= COMPONENT ================= */
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

      if (!res.ok) throw new Error(data.message || "Failed to load cart");

      setCart(data?.cart || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  /* ================= DERIVED TOTAL ================= */
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      return sum + (parseFloat(item.total_price) || 0);
    }, 0);
  }, [cart]);

  const finalAmount = couponResult
    ? parseFloat(couponResult.final_amount)
    : cartTotal;

  const discountAmount = couponResult
    ? parseFloat(couponResult.discount)
    : 0;

  /* ================= UPDATE ITEM (OPTIMISTIC) ================= */
  const updateItem = async (itemId, newQty) => {
    if (newQty < 1) return;

    // save previous state for rollback
    const prevCart = [...cart];

    // OPTIMISTIC UPDATE
    setCart((items) =>
      items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQty,
              total_price:
                (item.total_price / (item.quantity || 1)) * newQty,
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
      setCart(prevCart); // rollback
    }
  };

  /* ================= DELETE ITEM ================= */
  const deleteItem = async (itemId) => {
    const prevCart = [...cart];

    setCart((items) => items.filter((i) => i.id !== itemId));

    try {
      const res = await fetch(
        `${API_BASE}/api/deletecart/?id=${itemId}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Delete failed");
    } catch (err) {
      setError(err.message);
      setCart(prevCart); // rollback
    }
  };

  /* ================= APPLY COUPON ================= */
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Enter coupon code");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setCouponResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/Coupon_Apply/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          coupon: couponCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid coupon");
      }

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

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading cart...
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Cart</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 mb-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="col-span-2 space-y-3">
          {cart.length === 0 && (
            <p className="text-gray-500">Cart is empty</p>
          )}

          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded shadow flex justify-between"
            >
              <div>
                <h2 className="font-semibold">
                  {item.product_name}
                </h2>

                <p>₹{item.total_price}</p>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() =>
                      updateItem(item.id, item.quantity - 1)
                    }
                    className="px-2 bg-gray-200"
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      updateItem(item.id, item.quantity + 1)
                    }
                    className="px-2 bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => deleteItem(item.id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* RIGHT */}
        <div className="bg-white p-4 rounded shadow h-fit">
          <h2 className="font-bold mb-2">Summary</h2>

          <p>Subtotal: ₹{cartTotal.toFixed(2)}</p>

          {couponResult && (
            <p className="text-green-600">
              Discount: -₹{discountAmount.toFixed(2)}
            </p>
          )}

          <p className="font-bold mt-2">
            Total: ₹{finalAmount.toFixed(2)}
          </p>

          {/* COUPON */}
          <div className="mt-4">
            <input
              value={couponCode}
              onChange={(e) =>
                setCouponCode(e.target.value.toUpperCase())
              }
              className="border p-2 w-full"
              placeholder="Coupon"
            />

            <button
              onClick={applyCoupon}
              className="bg-black text-white w-full mt-2 p-2"
            >
              Apply
            </button>

            {couponError && (
              <p className="text-red-500 text-sm">
                {couponError}
              </p>
            )}

            {couponResult && (
              <button
                onClick={removeCoupon}
                className="text-sm text-red-500 mt-2"
              >
                Remove Coupon
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}