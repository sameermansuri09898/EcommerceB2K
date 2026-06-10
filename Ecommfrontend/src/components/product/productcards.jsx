import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { addToCart } from "/src/components/services/cartService";
import { addToWishlist, removeFromWishlist } from "../services/wishlistService";

const NO_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f1f5f9'/%3E%3Ctext x='150' y='155' text-anchor='middle' font-size='13' fill='%2394a3b8' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";

// ── Icons ─────────────────────────────────────────────────────
const SlidersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
    <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none" /><circle cx="16" cy="12" r="2" fill="currentColor" stroke="none" /><circle cx="10" cy="18" r="2" fill="currentColor" stroke="none" />
  </svg>
);
const ChevronDownIcon = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{ transition: "transform 0.3s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const XIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const CartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
  </svg>
);
const HeartIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    fill={filled ? "currentColor" : "none"}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);
const GridIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const ListIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── Toast Notification ────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold pointer-events-auto
            transition-all duration-300
            ${t.type === "cart" ? "bg-slate-900 text-white" : ""}
            ${t.type === "wishlist_add" ? "bg-rose-500 text-white" : ""}
            ${t.type === "wishlist_remove" ? "bg-slate-500 text-white" : ""}
          `}
          style={{ fontFamily: "'DM Sans', sans-serif", minWidth: 220 }}
        >
          {t.type === "cart" && (
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <CheckIcon />
            </span>
          )}
          {(t.type === "wishlist_add" || t.type === "wishlist_remove") && (
            <span className="shrink-0">
              <HeartIcon filled={t.type === "wishlist_add"} />
            </span>
          )}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ── Filter Accordion ──────────────────────────────────────────
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-200 pb-4 mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex justify-between items-center bg-transparent border-none cursor-pointer p-0 mb-0"
      >
        <span className="font-bold text-xs tracking-widest uppercase text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>
          {title}
        </span>
        <ChevronDownIcon open={open} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

// ── Price Range ───────────────────────────────────────────────
function PriceRange({ min, max, value, onChange }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-xs text-slate-500">₹{value[0].toLocaleString()}</span>
        <span className="text-xs text-slate-500">₹{value[1].toLocaleString()}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value[1]}
        onChange={e => onChange([value[0], +e.target.value])}
        className="w-full accent-slate-900"
      />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function ProductCards() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});

  // Filter state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState("grid");

  // Wishlist state
  const [wishlist, setWishlist] = useState([]);

  // Toast state
  const [toasts, setToasts] = useState([]);

  // ── Toast helper ──────────────────────────────────────────
  const showToast = useCallback((message, type = "cart") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  // ── Fetch products ────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://127.0.0.1:8000/api/productlist/", {
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
        const defaults = {};
        data.forEach(p => { defaults[p.id] = p.variant_set[0]; });
        setSelectedVariants(defaults);
        const prices = data.flatMap(p => p.variant_set.map(v => +v.final_price)).filter(Boolean);
        if (prices.length) setPriceRange([0, Math.max(...prices)]);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    return () => controller.abort();
  }, []);

  // ── Fetch wishlist ────────────────────────────────────────
  useEffect(() => {
    fetchWishlist();
  }, []);

const fetchWishlist = async () => {
  try {
    const token = localStorage.getItem("access");

    const response = await fetch(
      "http://127.0.0.1:8000/api/view-wishlist/",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log("Wishlist Response:", data);

    if (!response.ok) {
      console.error("Backend Error:", data);
      return;
    }

    if (Array.isArray(data)) {
      setWishlist(data.map(item => item.product_item));
    }
  } catch (err) {
    console.error(err);
  }
};

  // ── Wishlist handler ──────────────────────────────────────
  const handleWishlist = async (productId, variant) => {
    try {
      const alreadyWishlisted = wishlist.includes(productId);
      if (alreadyWishlisted) {
        await removeFromWishlist(productId, variant);
        setWishlist(prev => prev.filter(id => id !== productId));
        showToast("Removed from wishlist", "wishlist_remove");
      } else {
        await addToWishlist(productId, variant);
        setWishlist(prev => [...prev, productId]);
        showToast("Added to wishlist ♥", "wishlist_add");
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };

  // ── Add to cart handler ───────────────────────────────────
  const handleAddToCart = (product, variant) => {
    try {
      addToCart(product, variant);
      showToast(`"${product.name}" added to cart`, "cart");
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  };

  // ── Derived filter values ─────────────────────────────────
  const allBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
  const allCategories = [...new Set(products.map(p => p.categorie_name).filter(Boolean))];
  const maxPrice = products
    .flatMap(p => p.variant_set.map(v => +v.final_price))
    .filter(Boolean)
    .reduce((a, b) => Math.max(a, b), 100000);

  const toggleArr = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setPriceRange([0, maxPrice]);
    setSearchQuery("");
    setSortBy("default");
  };

  const activeFilterCount =
    selectedBrands.length + selectedCategories.length + (sortBy !== "default" ? 1 : 0);

  const filtered = products
    .filter(p => {
      const v = selectedVariants[p.id];
      const price = +(v?.final_price || 0);
      return (
        (!searchQuery ||
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (!selectedBrands.length || selectedBrands.includes(p.brand)) &&
        (!selectedCategories.length || selectedCategories.includes(p.categorie_name)) &&
        price >= priceRange[0] &&
        price <= priceRange[1]
      );
    })
    .sort((a, b) => {
      const va = selectedVariants[a.id], vb = selectedVariants[b.id];
      if (sortBy === "price_asc") return +(va?.final_price || 0) - +(vb?.final_price || 0);
      if (sortBy === "price_desc") return +(vb?.final_price || 0) - +(va?.final_price || 0);
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      return 0;
    });

  // ── Sidebar content (shared desktop + mobile) ─────────────
  const SidebarContent = () => (
    <div className="px-1">
      <input
        type="text"
        placeholder="Search products…"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-slate-900 mb-5 box-border"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />

      <FilterSection title="Sort By">
        {[
          ["default", "Relevance"],
          ["price_asc", "Price: Low to High"],
          ["price_desc", "Price: High to Low"],
          ["name", "Name A–Z"],
        ].map(([val, label]) => (
          <label key={val} className="flex items-center gap-2 mb-2 cursor-pointer">
            <input
              type="radio"
              name="sort"
              checked={sortBy === val}
              onChange={() => setSortBy(val)}
              className="accent-slate-900"
            />
            <span className="text-sm text-slate-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {label}
            </span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Price Range">
        <PriceRange min={0} max={maxPrice} value={priceRange} onChange={setPriceRange} />
      </FilterSection>

      {allBrands.length > 0 && (
        <FilterSection title="Brand">
          <div className="max-h-40 overflow-y-auto">
            {allBrands.map(brand => (
              <label key={brand} className="flex items-center gap-2 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleArr(selectedBrands, setSelectedBrands, brand)}
                  className="accent-slate-900 w-3.5 h-3.5"
                />
                <span className="text-sm text-slate-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {allCategories.length > 0 && (
        <FilterSection title="Category">
          <div className="max-h-40 overflow-y-auto">
            {allCategories.map(cat => (
              <label key={cat} className="flex items-center gap-2 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleArr(selectedCategories, setSelectedCategories, cat)}
                  className="accent-slate-900 w-3.5 h-3.5"
                />
                <span className="text-sm text-slate-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {cat}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold cursor-pointer mt-1 hover:bg-slate-700 transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="bg-slate-50 min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .toast-enter { animation: slideUp 0.25s ease forwards; }
      `}</style>

      {/* ── Toast Container ── */}
      <Toast toasts={toasts} />

      {/* ── Sticky header ── */}
      <div className="bg-white border-b border-slate-200 px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-40 mx-auto">
        <div>
          <h1
            className="text-xl font-extrabold text-slate-900 tracking-tight m-0"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            All Products
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {loading ? "Loading…" : `${filtered.length} products found`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {selectedBrands.map(b => (
            <span
              key={b}
              className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-xs font-semibold px-3 py-1 rounded-full"
            >
              {b}
              <span
                onClick={() => toggleArr(selectedBrands, setSelectedBrands, b)}
                className="cursor-pointer opacity-70 hover:opacity-100"
              >
                <XIcon />
              </span>
            </span>
          ))}
          {selectedCategories.map(c => (
            <span
              key={c}
              className="inline-flex items-center gap-1.5 bg-slate-600 text-white text-xs font-semibold px-3 py-1 rounded-full"
            >
              {c}
              <span
                onClick={() => toggleArr(selectedCategories, setSelectedCategories, c)}
                className="cursor-pointer opacity-70 hover:opacity-100"
              >
                <XIcon />
              </span>
            </span>
          ))}

          {/* View toggle */}
          <div className="flex border border-slate-200 rounded-lg overflow-hidden">
            {[["grid", <GridIcon />], ["list", <ListIcon />]].map(([mode, icon]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-2 border-none cursor-pointer transition-colors ${viewMode === mode ? "bg-slate-900 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile filter bar ── */}
      <div className="flex md:hidden items-center gap-2 px-4 py-2.5 bg-white border-b border-slate-200">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          <SlidersIcon /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white"
        >
          <option value="default">Relevance</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="name">Name A–Z</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} results</span>
      </div>

      {/* ── Mobile drawer ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div onClick={() => setSidebarOpen(false)} className="absolute inset-0 bg-black/40" />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white px-4 py-5 overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <span
                className="font-extrabold text-base text-slate-900"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Filters
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="bg-transparent border-none cursor-pointer text-slate-500 hover:text-slate-900"
              >
                <XIcon />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ── Main layout ── */}
      <div className="mx-auto px-4 md:px-6 py-6 flex gap-6 items-start">

        {/* ── Desktop sidebar ── */}
        <aside className="hidden md:block w-56 shrink-0 bg-white rounded-2xl border border-slate-200 p-5 sticky top-20 max-h-[calc(100vh-96px)] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <span
              className="flex items-center gap-2 font-extrabold text-sm text-slate-900"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <SlidersIcon /> Filters
            </span>
            {activeFilterCount > 0 && (
              <span className="bg-slate-900 text-white rounded-full text-xs font-bold px-2 py-0.5">
                {activeFilterCount}
              </span>
            )}
          </div>
          <SidebarContent />
        </aside>

        {/* ── Product area ── */}
        <div className="flex-1 min-w-0">

          {loading && (
            <div className="flex flex-col items-center justify-center min-h-72 gap-4">
              <div
                className="w-9 h-9 rounded-full border-[3px] border-slate-200 border-t-slate-900"
                style={{ animation: "spin 0.8s linear infinite" }}
              />
              <p className="text-slate-400 text-sm">Loading products…</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-600 text-center text-sm">
              {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-16 px-5">
              <p className="text-5xl mb-3">🔍</p>
              <p
                className="font-bold text-lg text-slate-900 mb-1"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                No products found
              </p>
              <p className="text-slate-400 text-sm mb-4">Try adjusting your filters</p>
              <button
                onClick={clearFilters}
                className="bg-slate-900 text-white border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer hover:bg-slate-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div
              className={
                viewMode === "list"
                  ? "flex flex-col gap-2"
                  : "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              }
            >
              {filtered.map(product => {
                const variant = selectedVariants[product.id];
                const discount =
                  variant?.price && variant?.final_price
                    ? Math.round(100 - (+variant.final_price / +variant.price) * 100)
                    : 0;

                
                const isWished = wishlist.includes(product.id);

                return (
                  <div
                    key={product.id}
                    className={`group bg-white rounded-2xl border border-slate-200 overflow-hidden relative
                      hover:-translate-y-1 hover:shadow-xl transition-all duration-200
                      ${viewMode === "list" ? "flex flex-row" : "flex flex-col"}`}
                  >
                    {/* Discount badge */}
                    {discount > 0 && (
                      <div className="absolute top-2.5 left-2.5 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full tracking-wide">
                        -{discount}%
                      </div>
                    )}

                    {/* Wishlist button — ✅ FIXED: uses per-product isWished */}
                    <button
                      onClick={() => handleWishlist(product.id, selectedVariants[product.id])}
                      className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                        ${isWished
                          ? "bg-red-100 text-red-500"
                          : "bg-white text-gray-400 hover:text-red-500 shadow-sm"
                        }`}
                    >
                      <HeartIcon filled={isWished} />
                    </button>

                    {/* Image */}
                    <div
                      className={`bg-slate-50 flex items-center justify-center overflow-hidden
                        ${viewMode === "list" ? "w-40 h-40 shrink-0" : "w-full aspect-square"}`}
                    >
                      <img
                        src={variant?.image_url || NO_IMG}
                        alt={product.name}
                        onClick={() => navigate(`/ProductPage/${product.id}`)}
                        onError={e => { e.target.onerror = null; e.target.src = NO_IMG; }}
                        className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                      />
                    </div>

                    {/* Info */}
                    <div className="p-3.5 flex flex-col flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                          {product.categorie_name}
                        </span>
                        <span
                          className="text-[10px] text-slate-500 font-medium cursor-pointer hover:underline"
                          onClick={() => navigate(`/ProductPage/${product.id}`)}
                        >
                          {product.brand}
                        </span>
                      </div>

                      <h2
                        className="font-bold text-sm text-slate-900 leading-snug mb-2 line-clamp-2"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        {product.name}
                      </h2>

                      <div className="flex items-baseline gap-2 mb-3">
                        <span
                          className="font-extrabold text-lg text-slate-900"
                          style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                          ₹{variant?.final_price ? (+variant.final_price).toLocaleString("en-IN") : "—"}
                        </span>
                        {variant?.price && variant.price !== variant.final_price && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{(+variant.price).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      {/* Variant chips */}
                      {product.variant_set?.length > 1 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.variant_set.map(v => (
                            <button
                              key={v.id}
                              onClick={() => setSelectedVariants(p => ({ ...p, [product.id]: v }))}
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all cursor-pointer
                                ${variant?.id === v.id
                                  ? "bg-slate-900 text-white border-slate-900"
                                  : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-900"
                                }`}
                            >
                              {v.color_name}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-auto">
                        {/* ✅ FIXED: calls handleAddToCart which shows toast */}
                        <button
                          onClick={() => handleAddToCart(product, variant)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-900 bg-white text-slate-900 text-xs font-bold cursor-pointer hover:bg-slate-900 hover:text-white transition-colors"
                        >
                          <CartIcon /> Add to Cart
                        </button>
                        <button
                          onClick={() => navigate(`/ProductPage/${product.id}`)}
                          className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold border-none cursor-pointer hover:bg-slate-700 transition-colors"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}