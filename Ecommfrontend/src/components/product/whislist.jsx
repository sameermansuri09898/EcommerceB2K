import { useEffect, useState, useCallback } from "react";
import { Trash2, ShoppingCart, Heart, ArrowLeft, ShoppingBag, CheckCircle2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { removeFromWishlist } from "../services/wishlistService";
import { addToCart } from "../services/cartService";

// ── Toast System ───────────────────────────────────────────────────────────────
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium pointer-events-auto
            transition-all duration-300 min-w-[260px] max-w-xs
            ${t.type === "success" ? "bg-slate-900 text-white" : ""}
            ${t.type === "error" ? "bg-red-600 text-white" : ""}
            ${t.type === "remove" ? "bg-white text-slate-800 border border-slate-200" : ""}
          `}
        >
          {t.type === "success" && <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />}
          {t.type === "error" && <X size={16} className="shrink-0" />}
          {t.type === "remove" && <Trash2 size={16} className="shrink-0 text-red-400" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="opacity-50 hover:opacity-100 transition-opacity">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  return { toasts, addToast, removeToast };
}

// ── Skeleton Card ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
      <div className="h-64 bg-slate-100" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-100 rounded-full w-3/4" />
        <div className="h-3 bg-slate-100 rounded-full w-1/2" />
        <div className="h-3 bg-slate-100 rounded-full w-1/3" />
        <div className="h-8 bg-slate-100 rounded-full w-1/3 mt-2" />
        <div className="flex gap-2 mt-4">
          <div className="flex-1 h-11 bg-slate-100 rounded-xl" />
          <div className="w-11 h-11 bg-slate-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────
function EmptyWishlist({ onShop }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6">
        <Heart size={40} className="text-rose-300" strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
        Your wishlist is empty
      </h2>
      <p className="text-slate-400 text-sm mb-8 max-w-xs">
        Save items you love and come back to them anytime. Start exploring.
      </p>
      <button
        onClick={onShop}
        className="inline-flex items-center gap-2 bg-slate-900 text-white px-7 py-3.5 rounded-2xl text-sm font-semibold hover:bg-slate-700 transition-colors"
      >
        <ShoppingBag size={16} />
        Browse Products
      </button>
    </div>
  );
}

// ── Wishlist Item Card ─────────────────────────────────────────────────────────
function WishlistCard({ item, onRemove, onAddToCart, removing, adding }) {
  const discountedPrice = item.price && item.offer
    ? Math.round(item.price * (1 - item.offer / 100))
    : null;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-slate-200 hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden bg-slate-50 h-64">
        <img
          src={`http://127.0.0.1:8000${item.image}`}
          alt={item.product_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Ctext x='200' y='155' text-anchor='middle' font-size='14' fill='%2394a3b8' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";
          }}
        />

        {/* Offer badge */}
        {item.offer > 0 && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide">
            {item.offer}% OFF
          </div>
        )}

        {/* Remove button — top right */}
        <button
          onClick={() => onRemove(item)}
          disabled={removing}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md
            hover:bg-red-50 hover:text-red-500 text-slate-400 transition-all duration-200 disabled:opacity-50"
          title="Remove from wishlist"
        >
          {removing ? (
            <span className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
          ) : (
            <Trash2 size={15} />
          )}
        </button>
      </div>

      {/* Details */}
      <div className="p-5 flex flex-col flex-1">
        <h2
          className="font-bold text-slate-900 text-base leading-snug line-clamp-2 mb-3"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {item.product_name}
        </h2>

        {/* Attributes */}
        <div className="flex flex-wrap gap-2 mb-4">
          {item.color && (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full font-medium">
              <span
                className="w-2.5 h-2.5 rounded-full border border-slate-200"
                style={{ backgroundColor: item.color_hex || "#ccc" }}
              />
              {item.color}
            </span>
          )}
          {item.size && (
            <span className="inline-flex items-center text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full font-medium">
              Size: {item.size}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-5 mt-auto">
          <span className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>
            ₹{discountedPrice ? discountedPrice.toLocaleString("en-IN") : (+item.price).toLocaleString("en-IN")}
          </span>
          {discountedPrice && (
            <span className="text-sm text-slate-400 line-through">
              ₹{(+item.price).toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Actions */}
        <button
          onClick={() => onAddToCart(item)}
          disabled={adding}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl text-sm font-semibold
            hover:bg-slate-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {adding ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Adding…
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main Wishlist Page ─────────────────────────────────────────────────────────
export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState(new Set());
  const [addingIds, setAddingIds] = useState(new Set());
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem("access");
      const response = await fetch("http://127.0.0.1:8000/api/view-wishlist/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (Array.isArray(data)) setWishlist(data);
    } catch (err) {
      console.error(err);
      addToast("Failed to load wishlist", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (item) => {
    setRemovingIds((prev) => new Set([...prev, item.id]));
    try {
      await removeFromWishlist(item.product_item, item.product_varient);
      setWishlist((prev) => prev.filter((w) => w.id !== item.id));
      addToast("Removed from wishlist", "remove");
    } catch (err) {
      console.error(err);
      addToast("Could not remove item", "error");
    } finally {
      setRemovingIds((prev) => { const n = new Set(prev); n.delete(item.id); return n; });
    }
  };

  const handleAddToCart = async (item) => {
    setAddingIds((prev) => new Set([...prev, item.id]));
    try {
      await addToCart(item.product_item, item.product_varient);
      addToast(`"${item.product_name}" added to cart`, "success");
    } catch (err) {
      console.error(err);
      addToast("Could not add to cart", "error");
    } finally {
      setAddingIds((prev) => { const n = new Set(prev); n.delete(item.id); return n; });
    }
  };

  const totalSavings = wishlist.reduce((acc, item) => {
    if (item.price && item.offer) {
      return acc + Math.round((+item.price * item.offer) / 100);
    }
    return acc;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 0.7s linear infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .animate-pulse { animation: pulse 1.8s ease-in-out infinite; }
      `}</style>

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1
                className="text-xl font-extrabold text-slate-900 leading-tight"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                My Wishlist
              </h1>
              {!loading && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
                </p>
              )}
            </div>
          </div>

          {/* Savings badge */}
          {!loading && wishlist.length > 0 && totalSavings > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <span>🎉</span>
              <span>You save ₹{totalSavings.toLocaleString("en-IN")} total</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && wishlist.length === 0 && (
          <EmptyWishlist onShop={() => navigate("/products")} />
        )}

        {/* Grid */}
        {!loading && wishlist.length > 0 && (
          <>
            {/* Mobile savings banner */}
            {totalSavings > 0 && (
              <div className="sm:hidden mb-5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-3 rounded-2xl text-center">
                🎉 You save ₹{totalSavings.toLocaleString("en-IN")} on these items
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {wishlist.map((item) => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  onRemove={handleRemove}
                  onAddToCart={handleAddToCart}
                  removing={removingIds.has(item.id)}
                  adding={addingIds.has(item.id)}
                />
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-slate-400 text-sm">
                {wishlist.length} saved {wishlist.length === 1 ? "item" : "items"} · Items are not reserved
              </p>
              <button
                onClick={() => navigate("/products")}
                className="inline-flex items-center gap-2 text-slate-900 font-semibold text-sm hover:underline underline-offset-4 transition-all"
              >
                <ShoppingBag size={15} />
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}