import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const COLOR_MAP = {
  Black: "#1a1a1a", White: "#f0f0f0", Blue: "#2563eb",
  Red: "#dc2626", Green: "#16a34a", Pink: "#ec4899",
  Grey: "#6b7280", Gray: "#6b7280",
};

const FEATURES = [
  { icon: "🎵", label: "Deep Bass", desc: "Immersive audio experience" },
  { icon: "🔇", label: "ENC Tech", desc: "Environmental Noise Cancellation" },
  { icon: "⚡", label: "Fast Charge", desc: "10 min charge = 60 min play" },
  { icon: "📶", label: "BT 5.3", desc: "Stable wireless connection" },
];

// ─── Cart API ────────────────────────────────────────────────────
const addToCartAPI = async (product, variant, qty) => {
  try {
    const token = localStorage.getItem("access");
    const response = await fetch("http://127.0.0.1:8000/api/addcart/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_item: product.id,
        product_varient: variant.id,
        quantity: qty,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Cart API Error:", data);
      return { success: false, data };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Cart Request Failed:", error);
    return { success: false, error };
  }
};

// ─── Sub-components ────────────────────────────────────────────────────

function StarRating({ rating = 4.2, count = 1284 }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg key={s} width="14" height="14" viewBox="0 0 24 24"
            fill={s <= Math.round(rating) ? "#f59e0b" : "none"}
            stroke="#f59e0b" strokeWidth="2">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        ))}
      </div>
      <span className="text-sm font-semibold text-amber-500">{rating}</span>
      {count > 0 && (
        <span className="text-xs text-gray-400">({count.toLocaleString()} reviews)</span>
      )}
    </div>
  );
}

function ImagePlaceholder({ color = "#1a1a1a", label = "Product", className = "" }) {
  const bg = color === "#f0f0f0" ? "#e5e7eb" : `${color}22`;
  return (
    <div
      className={`w-full flex flex-col items-center justify-center gap-3 rounded-2xl ${className}`}
      style={{ background: `linear-gradient(135deg, ${bg} 0%, ${color}33 100%)` }}
    >
      <span style={{ fontSize: 56 }}>🎧</span>
      <span className="text-xs text-gray-400 font-medium px-4 text-center">{label}</span>
    </div>
  );
}

function Toast({ message, type = "success" }) {
  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white transition-all
      ${type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
      {type === "success" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : "⚠️"}
      {message}
    </div>
  );
}

// ─── Product Images ────────────────────────────────────────────────────

function ProductImages({ product, selectedVariant, setSelectedVariant, wishlist, setWishlist, imgError, setImgError }) {
  const colorHex = COLOR_MAP[selectedVariant.color_name] || "#6366f1";
  const discount = parseFloat(selectedVariant.offer);

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Main image */}
      <div className="relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
        {discount >= 10 && (
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
            -{discount}% OFF
          </div>
        )}
        <button
          onClick={() => setWishlist(!wishlist)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
          aria-label="Toggle wishlist"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"
            fill={wishlist ? "#ef4444" : "none"}
            stroke={wishlist ? "#ef4444" : "#9ca3af"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        {selectedVariant.image_url && !imgError[selectedVariant.id] ? (
          <img
            src={selectedVariant.image_url}
            alt={`${product.name} - ${selectedVariant.color_name}`}
            onError={() => setImgError((p) => ({ ...p, [selectedVariant.id]: true }))}
            className="w-full object-contain p-4 sm:p-6"
            style={{ height: "clamp(240px, 45vw, 420px)" }}
          />
        ) : (
          <ImagePlaceholder
            color={colorHex}
            label={`${selectedVariant.color_name} · ${selectedVariant.size_name}`}
            className="h-56 sm:h-80 lg:h-96"
          />
        )}
      </div>

      {/* Thumbnails */}
      <div
        className="grid gap-2 sm:gap-3"
        style={{ gridTemplateColumns: `repeat(${Math.min(product.variant_set.length, 5)}, 1fr)` }}
      >
        {product.variant_set.map((v) => {
          const vColor = COLOR_MAP[v.color_name] || "#6366f1";
          const isActive = v.id === selectedVariant.id;
          return (
            <button
              key={v.id}
              onClick={() => setSelectedVariant(v)}
              className={`rounded-xl overflow-hidden bg-white p-1.5 sm:p-2 transition-all hover:-translate-y-0.5 ${
                isActive ? "border-2 border-indigo-500 shadow-md" : "border-2 border-gray-100"
              }`}
              aria-label={`Select ${v.color_name}`}
            >
              {v.image_url && !imgError[v.id] ? (
                <img
                  src={v.image_url}
                  alt={v.color_name}
                  onError={() => setImgError((p) => ({ ...p, [v.id]: true }))}
                  className="w-full h-12 sm:h-16 md:h-20 object-contain"
                />
              ) : (
                <div
                  className="h-12 sm:h-16 md:h-20 rounded-lg flex items-center justify-center text-2xl sm:text-3xl"
                  style={{ background: `${vColor}22` }}
                >
                  🎧
                </div>
              )}
              <p className={`text-center text-xs mt-1 truncate ${isActive ? "text-indigo-600 font-semibold" : "text-gray-400"}`}>
                {v.color_name}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Product Info ────────────────────────────────────────────────────

function ProductInfo({ product, selectedVariant, setSelectedVariant, qty, setQty, added, cartLoading, onAddToCart }) {
  const discount = parseFloat(selectedVariant.offer);
  const originalPrice = parseFloat(selectedVariant.price);
  const finalPrice = selectedVariant.final_price;
  const savings = selectedVariant.offer_price;
  const inStock = selectedVariant.stock > 0;
  const lowStock = selectedVariant.stock <= 5 && inStock;

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* Badges */}
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">{product.brand}</span>
        <span className="w-1 h-1 rounded-full bg-gray-300" />
        <span className="text-xs font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
          {product.categorie_name}
        </span>
        {inStock && !lowStock && (
          <span className="text-xs font-bold uppercase tracking-wide bg-green-50 text-green-700 px-2.5 py-1 rounded-full">● In Stock</span>
        )}
        {!inStock && (
          <span className="text-xs font-bold uppercase tracking-wide bg-red-50 text-red-600 px-2.5 py-1 rounded-full">Out of Stock</span>
        )}
        {lowStock && (
          <span className="text-xs font-bold uppercase tracking-wide bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">
            ⚠ Only {selectedVariant.stock} left
          </span>
        )}
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
          {product.name}
          <span className="ml-2 text-xs sm:text-sm font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg align-middle">
            {selectedVariant.size_name}
          </span>
        </h1>
        <div className="mt-2">
          <StarRating />
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed">
        {product.description}. Experience premium sound quality with advanced Bluetooth 5.3 connectivity,
        up to 40 hours total playback, and an ergonomic fit designed for all-day comfort.
      </p>

      {/* Price box */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 sm:p-5">
        <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
          <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            ₹{finalPrice.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </span>
          <span className="text-lg sm:text-xl text-gray-400 line-through font-normal">
            ₹{originalPrice.toLocaleString("en-IN")}
          </span>
          <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            {discount}% OFF
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-sm text-emerald-600 font-semibold">
            You save ₹{savings.toLocaleString("en-IN", { maximumFractionDigits: 0 })} on this order
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes · Free delivery</p>
      </div>

      {/* Variant selector */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Select Edition</p>
        <div className="flex flex-col gap-2 sm:gap-2.5">
          {product.variant_set.map((v) => {
            const vColor = COLOR_MAP[v.color_name] || "#6366f1";
            const isActive = v.id === selectedVariant.id;
            return (
              <button
                key={v.id}
                onClick={() => { setSelectedVariant(v); setQty(1); }}
                className={`flex items-center justify-between px-3 sm:px-4 py-3 rounded-2xl border transition-all text-left hover:-translate-y-0.5 ${
                  isActive ? "border-indigo-500 border-2 bg-indigo-50" : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex-shrink-0"
                    style={{
                      background: vColor,
                      border: vColor === "#f0f0f0" ? "2px solid #d1d5db" : "2px solid transparent",
                      outline: isActive ? "2px solid #6366f1" : "none",
                      outlineOffset: 2,
                    }}
                  />
                  <div className="min-w-0">
                    <p className={`text-xs sm:text-sm font-semibold truncate ${isActive ? "text-indigo-700" : "text-gray-800"}`}>
                      {v.color_name} · {v.size_name}
                    </p>
                    <p className="text-xs text-gray-400">{v.stock} units available</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className={`text-xs sm:text-sm font-bold ${isActive ? "text-indigo-700" : "text-gray-900"}`}>
                    ₹{v.final_price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-gray-400 line-through">₹{parseFloat(v.price).toLocaleString("en-IN")}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Qty */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-2 py-1">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-lg font-medium hover:bg-gray-100 transition-colors"
            aria-label="Decrease quantity"
          >−</button>
          <span className="w-7 text-center text-base font-bold text-gray-900">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(selectedVariant.stock, q + 1))}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-lg font-medium hover:bg-gray-100 transition-colors"
            aria-label="Increase quantity"
          >+</button>
        </div>
        <p className="text-xs text-gray-400">Max {selectedVariant.stock} per order</p>
      </div>

      {/* CTA buttons */}
      <div className="flex gap-2 sm:gap-3">
        <button
          onClick={onAddToCart}
          disabled={!inStock || cartLoading}
          className={`flex-1 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none ${
            added ? "bg-emerald-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"
          }`}
          style={{ height: 48 }}
        >
          {cartLoading ? (
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : added ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Added!
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="hidden xs:inline">Add to Cart</span>
              <span className="xs:hidden">Add</span>
            </>
          )}
        </button>
        <button
          disabled={!inStock}
          className="flex-1 rounded-2xl text-sm font-bold text-white bg-gray-900 flex items-center justify-center gap-2 hover:bg-gray-800 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ height: 48 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polyline points="5 12 19 12" /><polyline points="12 5 19 12 12 19" />
          </svg>
          Buy Now
        </button>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: "🚚", label: "Free Delivery", sub: "On orders above ₹499" },
          { icon: "↩️", label: "7-Day Returns", sub: "Easy return policy" },
          { icon: "🛡️", label: "1 Year Warranty", sub: "Brand warranty" },
          { icon: "💳", label: "Secure Payment", sub: "100% safe checkout" },
        ].map((t) => (
          <div key={t.label} className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 bg-white rounded-xl border border-gray-100">
            <span className="text-lg sm:text-xl flex-shrink-0">{t.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{t.label}</p>
              <p className="text-xs text-gray-400 truncate">{t.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tabs ────────────────────────────────────────────────────

function OverviewTab({ product, selectedVariant, setSelectedVariant }) {
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
        {FEATURES.map((f) => (
          <div key={f.label} className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 text-center hover:-translate-y-1 transition-all">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{f.icon}</div>
            <p className="text-xs sm:text-sm font-bold text-gray-900 mb-1">{f.label}</p>
            <p className="text-xs text-gray-400">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Compare table — scrollable on mobile */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Compare Editions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {["Edition", "Color", "MRP", "Offer", "Final Price", "Savings", "Stock"].map((h) => (
                  <th key={h} className="px-3 sm:px-5 py-3 text-xs font-bold text-gray-400 text-left uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {product.variant_set.map((v) => {
                const vColor = COLOR_MAP[v.color_name] || "#6366f1";
                const isActive = v.id === selectedVariant.id;
                return (
                  <tr key={v.id} onClick={() => setSelectedVariant(v)}
                    className={`border-t border-gray-50 cursor-pointer transition-colors ${isActive ? "bg-indigo-50" : "hover:bg-gray-50"}`}>
                    <td className="px-3 sm:px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">{v.size_name}</td>
                    <td className="px-3 sm:px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: vColor, border: vColor === "#f0f0f0" ? "1px solid #d1d5db" : "none" }} />
                        <span className="text-sm text-gray-700 whitespace-nowrap">{v.color_name}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-sm text-gray-400 line-through whitespace-nowrap">₹{parseFloat(v.price).toLocaleString("en-IN")}</td>
                    <td className="px-3 sm:px-5 py-3">
                      <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 rounded-lg">{v.offer}%</span>
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-sm font-bold text-indigo-600 whitespace-nowrap">₹{v.final_price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                    <td className="px-3 sm:px-5 py-3 text-sm font-semibold text-emerald-600 whitespace-nowrap">₹{v.offer_price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                    <td className="px-3 sm:px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap ${v.stock <= 5 ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"}`}>
                        {v.stock} units
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SpecsTab({ product }) {
  const specs = [
    { section: "Audio", items: [["Driver Size", "13mm Dynamic"], ["Frequency Response", "20Hz - 20kHz"], ["Impedance", "32 Ohm"], ["Sensitivity", "103 dB SPL/mW"]] },
    { section: "Connectivity", items: [["Bluetooth", "v5.3"], ["Range", "Up to 10m"], ["Codecs", "SBC, AAC"], ["Connection", "True Wireless"]] },
    { section: "Battery", items: [["Earbuds", "6 hours"], ["Case", "34 hours total"], ["Charge Time", "1.5 hours"], ["Fast Charge", "10 min = 60 min"]] },
    { section: "Physical", items: [["Weight", "5g per earbud"], ["IPX Rating", "IPX5"], ["Colors", product.variant_set.map((v) => v.color_name).join(", ")], ["In Box", "Earbuds, Case, Cable, Tips"]] },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {specs.map((s) => (
        <div key={s.section} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-5 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{s.section}</p>
          </div>
          {s.items.map(([k, v]) => (
            <div key={k} className="flex justify-between items-start sm:items-center px-4 sm:px-5 py-3 border-b border-gray-50 last:border-0 gap-2">
              <span className="text-sm text-gray-500 flex-shrink-0">{k}</span>
              <span className="text-sm font-semibold text-gray-900 text-right">{v}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ReviewsTab() {
  const reviews = [
    { name: "Arjun K.", rating: 5, date: "2 days ago", text: "Absolutely love these! The bass is punchy and ENC works great in office. Battery life is solid. Highly recommend for the price." },
    { name: "Priya M.", rating: 4, date: "1 week ago", text: "Great value for money. Sound quality is impressive for this price range. The Gaming Edition has slightly better soundstage." },
    { name: "Rahul S.", rating: 4, date: "2 weeks ago", text: "Comfort is excellent. Wore them for 4+ hours without any ear fatigue. Mic quality could be better though." },
  ];
  const pcts = { 5: 58, 4: 24, 3: 10, 2: 5, 1: 3 };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
      {/* Rating summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 text-center">
        <p className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-none">4.2</p>
        <div className="flex justify-center mt-2">
          <StarRating rating={4.2} count={1284} />
        </div>
        <p className="text-xs text-gray-400 mt-2">Based on 1,284 reviews</p>
        <div className="mt-4 sm:mt-5 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-3">{star}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pcts[star]}%` }} />
              </div>
              <span className="text-xs text-gray-400 w-7 text-right">{pcts[star]}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div className="col-span-1 lg:col-span-2 flex flex-col gap-3 sm:gap-4">
        {reviews.map((r) => (
          <div key={r.name} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
            <div className="flex items-start sm:items-center justify-between mb-3 gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {r.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                  <StarRating rating={r.rating} count={0} />
                </div>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{r.date}</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────

export default function ProductPage() {
  const { id } = useParams();
  const API_URL = `http://127.0.0.1:8000/api/Retreave_product/${id}`;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [wishlist, setWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [imgError, setImgError] = useState({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetch(API_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setProduct(data);
        setSelectedVariant(data.variant_set?.[0] || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || cartLoading) return;
    setCartLoading(true);
    const result = await addToCartAPI(product, selectedVariant, qty);
    setCartLoading(false);
    if (result.success) {
      setAdded(true);
      showToast("Added to cart successfully!");
      setTimeout(() => setAdded(false), 2500);
    } else {
      showToast("Failed to add to cart. Please try again.", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-4xl mb-4">😕</p>
          <p className="text-lg font-bold text-gray-800 mb-1">Product not found</p>
          <p className="text-sm text-gray-400">Could not load product #{id} — {error}</p>
        </div>
      </div>
    );
  }

  if (!product || !selectedVariant) return null;

  const TABS = ["overview", "specs", "reviews"];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 sm:gap-2 text-xs text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-none">
          <span className="cursor-pointer text-indigo-500 hover:underline flex-shrink-0">Home</span>
          <span>›</span>
          <span className="cursor-pointer text-indigo-500 hover:underline flex-shrink-0">{product.categorie_name}</span>
          <span>›</span>
          <span className="cursor-pointer text-indigo-500 hover:underline flex-shrink-0">{product.brand}</span>
          <span>›</span>
          <span className="text-gray-700 font-medium truncate max-w-[140px] sm:max-w-none">{product.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Product grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-12">
          <ProductImages
            product={product}
            selectedVariant={selectedVariant}
            setSelectedVariant={setSelectedVariant}
            wishlist={wishlist}
            setWishlist={setWishlist}
            imgError={imgError}
            setImgError={setImgError}
          />
          <ProductInfo
            product={product}
            selectedVariant={selectedVariant}
            setSelectedVariant={setSelectedVariant}
            qty={qty}
            setQty={setQty}
            added={added}
            cartLoading={cartLoading}
            onAddToCart={handleAddToCart}
          />
        </div>

        {/* Tabs */}
        <div className="mt-10 sm:mt-14">
          <div className="flex gap-0 sm:gap-1 border-b-2 border-gray-100 mb-6 sm:mb-8 overflow-x-auto scrollbar-none">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-3 text-sm font-semibold capitalize transition-all -mb-0.5 whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {activeTab === "overview" && (
            <OverviewTab product={product} selectedVariant={selectedVariant} setSelectedVariant={setSelectedVariant} />
          )}
          {activeTab === "specs" && <SpecsTab product={product} />}
          {activeTab === "reviews" && <ReviewsTab />}
        </div>
      </div>

      {/* Mobile sticky bottom CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 px-4 py-3 shadow-lg">
        <div className="flex gap-2 max-w-lg mx-auto">
          <button
            onClick={handleAddToCart}
            disabled={selectedVariant?.stock === 0 || cartLoading}
            className={`flex-1 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
              added ? "bg-emerald-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"
            }`}
            style={{ height: 46 }}
          >
            {cartLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : added ? (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Added!</>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Add to Cart
              </>
            )}
          </button>
          <button
            disabled={selectedVariant?.stock === 0}
            className="flex-1 rounded-xl text-sm font-bold text-white bg-gray-900 flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-60"
            style={{ height: 46 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polyline points="5 12 19 12" /><polyline points="12 5 19 12 12 19" />
            </svg>
            Buy Now
          </button>
        </div>
      </div>

      {/* Bottom padding for mobile sticky bar */}
      <div className="lg:hidden h-20" />
    </div>
  );
}