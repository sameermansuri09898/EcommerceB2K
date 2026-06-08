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

function StarRating({ rating = 4.2, count = 1284 }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg key={s} width="15" height="15" viewBox="0 0 24 24"
            fill={s <= Math.round(rating) ? "#f59e0b" : "none"}
            stroke="#f59e0b" strokeWidth="2">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        ))}
      </div>
      <span className="text-sm font-semibold text-amber-500">{rating}</span>
      {count > 0 && <span className="text-xs text-gray-400">({count.toLocaleString()} reviews)</span>}
    </div>
  );
}

function ImagePlaceholder({ color = "#1a1a1a", label = "Product", className = "" }) {
  const bg = color === "#f0f0f0" ? "#e5e7eb" : `${color}22`;
  return (
    <div className={`w-full flex flex-col items-center justify-center gap-3 rounded-2xl ${className}`}
      style={{ background: `linear-gradient(135deg, ${bg} 0%, ${color}33 100%)` }}>
      <span style={{ fontSize: 72 }}>🎧</span>
      <span className="text-sm text-gray-400 font-medium">{label}</span>
    </div>
  );
}

function ProductImages({ product, selectedVariant, setSelectedVariant, wishlist, setWishlist, imgError, setImgError }) {
  const colorHex = COLOR_MAP[selectedVariant.color_name] || "#6366f1";
  const discount = parseFloat(selectedVariant.offer);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative rounded-2xl overflow-hidden bg-white border border-gray-100">
        {discount >= 10 && (
          <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            -{discount}% OFF
          </div>
        )}
        <button
          onClick={() => setWishlist(!wishlist)}
          className="absolute top-4 right-4 z-10 w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:border-red-200 hover:bg-red-50 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24"
            fill={wishlist ? "#ef4444" : "none"}
            stroke={wishlist ? "#ef4444" : "#9ca3af"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        {selectedVariant.image_url && !imgError[selectedVariant.id] ? (
          <img
            src={selectedVariant.image_url}
            alt={`${product.name} - ${selectedVariant.color_name}`}
            onError={() => setImgError(p => ({ ...p, [selectedVariant.id]: true }))}
            className="w-full object-contain p-6"
            style={{ height: 420 }}
          />
        ) : (
          <ImagePlaceholder color={colorHex} label={`${selectedVariant.color_name} · ${selectedVariant.size_name}`} className="h-96" />
        )}
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${product.variant_set.length}, 1fr)` }}>
        {product.variant_set.map((v) => {
          const vColor = COLOR_MAP[v.color_name] || "#6366f1";
          const isActive = v.id === selectedVariant.id;
          return (
            <button key={v.id} onClick={() => setSelectedVariant(v)}
              className={`rounded-xl overflow-hidden bg-white p-2 transition-all hover:-translate-y-0.5 ${
                isActive ? "border-2 border-indigo-500" : "border-2 border-gray-100"
              }`}>
              {v.image_url && !imgError[v.id] ? (
                <img src={v.image_url} alt={v.color_name}
                  onError={() => setImgError(p => ({ ...p, [v.id]: true }))}
                  className="w-full h-20 object-contain" />
              ) : (
                <div className="h-20 rounded-lg flex items-center justify-center text-3xl"
                  style={{ background: `${vColor}22` }}>🎧</div>
              )}
              <p className={`text-center text-xs mt-1.5 ${isActive ? "text-indigo-600 font-semibold" : "text-gray-400"}`}>
                {v.color_name}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProductInfo({ product, selectedVariant, setSelectedVariant, qty, setQty, added, onAddToCart }) {
  const discount = parseFloat(selectedVariant.offer);
  const originalPrice = parseFloat(selectedVariant.price);
  const finalPrice = selectedVariant.final_price;
  const savings = selectedVariant.offer_price;
  const inStock = selectedVariant.stock > 0;
  const lowStock = selectedVariant.stock <= 5 && inStock;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">{product.brand}</span>
        <span className="w-1 h-1 rounded-full bg-gray-300" />
        <span className="text-xs font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">{product.categorie_name}</span>
        {inStock && !lowStock && <span className="text-xs font-bold uppercase tracking-wide bg-green-50 text-green-700 px-2.5 py-1 rounded-full">● In Stock</span>}
        {!inStock && <span className="text-xs font-bold uppercase tracking-wide bg-red-50 text-red-600 px-2.5 py-1 rounded-full">Out of Stock</span>}
        {lowStock && <span className="text-xs font-bold uppercase tracking-wide bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">⚠ Only {selectedVariant.stock} left</span>}
      </div>

      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
          {product.name}
          <span className="ml-3 text-sm font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg align-middle">
            {selectedVariant.size_name}
          </span>
        </h1>
        <div className="mt-2"><StarRating /></div>
      </div>

      <p className="text-sm text-gray-500 leading-relaxed">
        {product.description}. Experience premium sound quality with advanced Bluetooth 5.3 connectivity,
        up to 40 hours total playback, and an ergonomic fit designed for all-day comfort.
      </p>

      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-4xl font-extrabold text-gray-900">
            ₹{finalPrice.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </span>
          <span className="text-xl text-gray-400 line-through font-normal">
            ₹{originalPrice.toLocaleString("en-IN")}
          </span>
          <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            {discount}% OFF
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-sm text-emerald-600 font-semibold">
            You save ₹{savings.toLocaleString("en-IN", { maximumFractionDigits: 0 })} on this order
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes · Free delivery</p>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Select Edition</p>
        <div className="flex flex-col gap-2.5">
          {product.variant_set.map((v) => {
            const vColor = COLOR_MAP[v.color_name] || "#6366f1";
            const isActive = v.id === selectedVariant.id;
            return (
              <button key={v.id} onClick={() => { setSelectedVariant(v); setQty(1); }}
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all text-left hover:-translate-y-0.5 ${
                  isActive ? "border-indigo-500 border-2 bg-indigo-50" : "border-gray-200 bg-white hover:border-gray-300"
                }`}>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex-shrink-0"
                    style={{
                      background: vColor,
                      border: vColor === "#f0f0f0" ? "2px solid #d1d5db" : "2px solid transparent",
                      outline: isActive ? "2px solid #6366f1" : "none",
                      outlineOffset: 2
                    }} />
                  <div>
                    <p className={`text-sm font-semibold ${isActive ? "text-indigo-700" : "text-gray-800"}`}>
                      {v.color_name} · {v.size_name}
                    </p>
                    <p className="text-xs text-gray-400">{v.stock} units available</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${isActive ? "text-indigo-700" : "text-gray-900"}`}>
                    ₹{v.final_price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-gray-400 line-through">₹{parseFloat(v.price).toLocaleString("en-IN")}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-2 py-1">
          <button onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-lg font-medium hover:bg-gray-100 transition-colors">−</button>
          <span className="w-8 text-center text-base font-bold text-gray-900">{qty}</span>
          <button onClick={() => setQty(q => Math.min(selectedVariant.stock, q + 1))}
            className="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-lg font-medium hover:bg-gray-100 transition-colors">+</button>
        </div>
        <p className="text-xs text-gray-400">Max {selectedVariant.stock} per order</p>
      </div>

      <div className="flex gap-3">
        <button onClick={() => addToCart(product, selectedVariant,qty)}
          className={`flex-1 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2.5 transition-all active:scale-95 hover:opacity-90 hover:-translate-y-0.5 ${
            added ? "bg-emerald-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"
          }`} style={{ height: 52 }}>
          {added ? (
            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Added to Cart!</>
          ) : (
            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>Add to Cart</>
          )}
        </button>
        <button className="flex-1 rounded-2xl text-sm font-bold text-white bg-gray-900 flex items-center justify-center gap-2 hover:bg-gray-800 hover:-translate-y-0.5 transition-all active:scale-95"
          style={{ height: 52 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polyline points="5 12 19 12" /><polyline points="12 5 19 12 12 19" />
          </svg>
          Buy Now
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {[
          { icon: "🚚", label: "Free Delivery", sub: "On orders above ₹499" },
          { icon: "↩️", label: "7-Day Returns", sub: "Easy return policy" },
          { icon: "🛡️", label: "1 Year Warranty", sub: "Brand warranty" },
          { icon: "💳", label: "Secure Payment", sub: "100% safe checkout" },
        ].map((t) => (
          <div key={t.label} className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-gray-100">
            <span className="text-xl">{t.icon}</span>
            <div>
              <p className="text-xs font-semibold text-gray-800">{t.label}</p>
              <p className="text-xs text-gray-400">{t.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewTab({ product, selectedVariant, setSelectedVariant }) {
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {FEATURES.map((f) => (
          <div key={f.label} className="bg-white rounded-2xl p-6 border border-gray-100 text-center hover:-translate-y-1 transition-all">
            <div className="text-4xl mb-3">{f.icon}</div>
            <p className="text-sm font-bold text-gray-900 mb-1">{f.label}</p>
            <p className="text-xs text-gray-400">{f.desc}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Compare Editions</h3>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {["Edition", "Color", "MRP", "Offer", "Final Price", "Savings", "Stock"].map((h) => (
                <th key={h} className="px-5 py-3 text-xs font-bold text-gray-400 text-left uppercase tracking-wide">{h}</th>
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
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900">{v.size_name}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ background: vColor, border: vColor === "#f0f0f0" ? "1px solid #d1d5db" : "none" }} />
                      <span className="text-sm text-gray-700">{v.color_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400 line-through">₹{parseFloat(v.price).toLocaleString("en-IN")}</td>
                  <td className="px-5 py-4">
                    <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 rounded-lg">{v.offer}%</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-indigo-600">₹{v.final_price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-emerald-600">₹{v.offer_price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${v.stock <= 5 ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"}`}>
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
  );
}

function SpecsTab({ product }) {
  const specs = [
    { section: "Audio", items: [["Driver Size", "13mm Dynamic"], ["Frequency Response", "20Hz - 20kHz"], ["Impedance", "32 Ohm"], ["Sensitivity", "103 dB SPL/mW"]] },
    { section: "Connectivity", items: [["Bluetooth", "v5.3"], ["Range", "Up to 10m"], ["Codecs", "SBC, AAC"], ["Connection", "True Wireless"]] },
    { section: "Battery", items: [["Earbuds", "6 hours"], ["Case", "34 hours total"], ["Charge Time", "1.5 hours"], ["Fast Charge", "10 min = 60 min"]] },
    { section: "Physical", items: [["Weight", "5g per earbud"], ["IPX Rating", "IPX5"], ["Colors", product.variant_set.map(v => v.color_name).join(", ")], ["In Box", "Earbuds, Case, Cable, Tips"]] },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {specs.map((s) => (
        <div key={s.section} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-100">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{s.section}</p>
          </div>
          {s.items.map(([k, v]) => (
            <div key={k} className="flex justify-between items-center px-5 py-3 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500">{k}</span>
              <span className="text-sm font-semibold text-gray-900 text-right max-w-[55%]">{v}</span>
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
        <p className="text-6xl font-extrabold text-gray-900 leading-none">4.2</p>
        <div className="flex justify-center mt-2"><StarRating rating={4.2} count={1284} /></div>
        <p className="text-xs text-gray-400 mt-2">Based on 1,284 reviews</p>
        <div className="mt-5 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-3">{star}</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pcts[star]}%` }} />
              </div>
              <span className="text-xs text-gray-400 w-7">{pcts[star]}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-2 flex flex-col gap-4">
        {reviews.map((r) => (
          <div key={r.name} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {r.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                  <StarRating rating={r.rating} count={0} />
                </div>
              </div>
              <span className="text-xs text-gray-400">{r.date}</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
// api for cart add hoga isse 
const addToCart = async (product, variant,qty) => {
  try {
    const token = localStorage.getItem("access");
    console.log("Adding to cart:", { productId: product.id, variantId: variant.id, quantity: qty });

    const response = await fetch(
      "http://127.0.0.1:8000/api/addcart/",
      {
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
      }
    );

    const data = await response.json();
    console.log("Status:", response.status);
console.log("Response:", data);

    if (!response.ok) {
      console.error("API Error:", data);
      return;
    }

    console.log("Added to cart:", data);
  } catch (error) {
    console.error("Request Failed:", error);
  }
};
// ─── Main Page ────────────────────────────────────────────────────

export default function ProductPage() {
  const { id } = useParams();                          // ✅ hook andar hai
  const API_URL = `http://127.0.0.1:8000/api/Retreave_product/${id}`;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
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

  const handleAddToCart = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-2 text-xs text-gray-400">
          <span className="cursor-pointer text-indigo-500 hover:underline">Home</span>
          <span>›</span>
          <span className="cursor-pointer text-indigo-500 hover:underline">{product.categorie_name}</span>
          <span>›</span>
          <span className="cursor-pointer text-indigo-500 hover:underline">{product.brand}</span>
          <span>›</span>
          <span className="text-gray-700 font-medium">{product.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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
            onAddToCart={handleAddToCart}
          />
        </div>

        <div className="mt-14">
          <div className="flex gap-1 border-b-2 border-gray-100 mb-8">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-semibold capitalize transition-all -mb-0.5 ${
                  activeTab === tab
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}>
                {tab}
              </button>
            ))}
          </div>
          {activeTab === "overview" && <OverviewTab product={product} selectedVariant={selectedVariant} setSelectedVariant={setSelectedVariant} />}
          {activeTab === "specs" && <SpecsTab product={product} />}
          {activeTab === "reviews" && <ReviewsTab />}
        </div>
      </div>
    </div>
  );
}