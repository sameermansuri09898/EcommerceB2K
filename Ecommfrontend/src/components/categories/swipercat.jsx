import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import { useEffect, useState } from "react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

// Emoji map for common category names — fallback to 🛍️
const CATEGORY_ICONS = {
  electronics: "💻", phones: "📱", mobile: "📱", laptop: "💻",
  fashion: "👗", clothing: "👕", shirts: "👔", shoes: "👟",
  beauty: "💄", skincare: "✨", makeup: "💅",
  sports: "⚽", fitness: "🏋️", gym: "🏋️",
  home: "🏠", furniture: "🛋️", kitchen: "🍳",
  books: "📚", stationery: "✏️",
  toys: "🧸", kids: "🧸",
  food: "🍎", grocery: "🛒",
  watches: "⌚", accessories: "👜",
  bags: "👜", jewellery: "💍", jewelry: "💍",
  appliances: "🔌", cameras: "📷",
  gaming: "🎮", default: "🛍️",
};

function getCategoryIcon(name = "") {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return CATEGORY_ICONS.default;
}

// Pastel bg palette cycling
const PALETTES = [
  { bg: "#FFF0F3", active: "#FF4D6D", text: "#c9184a" },
  { bg: "#F0F4FF", active: "#4361EE", text: "#3a0ca3" },
  { bg: "#F0FFF4", active: "#2D6A4F", text: "#1b4332" },
  { bg: "#FFFBEB", active: "#D97706", text: "#92400e" },
  { bg: "#F5F0FF", active: "#7C3AED", text: "#4c1d95" },
  { bg: "#FFF4E6", active: "#EA580C", text: "#7c2d12" },
  { bg: "#F0FFFE", active: "#0891B2", text: "#164e63" },
  { bg: "#F7FFF0", active: "#16A34A", text: "#14532d" },
];

export default function Categories() {
  const [categories, setData] = useState([]);
  const [loading, setLoad] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchCategories = async () => {
      try {
        setLoad(true); setError("");
        const res = await fetch("http://127.0.0.1:8000/api/Categoriesdata/", {
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setData(data);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message || "Something went wrong");
      } finally { setLoad(false); }
    };
    fetchCategories();
    return () => controller.abort();
  }, []);

  return (
    <div style={{ width: "100%", maxWidth: "1400px", margin: "0 auto", padding: "10px 16px 14px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap');
        .cat-chip { transition: transform .18s, box-shadow .18s; font-family: 'DM Sans', sans-serif; }
        .cat-chip:hover { transform: translateY(-3px); box-shadow: 0 6px 18px rgba(0,0,0,.10) !important; }
        .cat-chip:active { transform: scale(.96); }
        .swiper-button-next, .swiper-button-prev {
          width: 30px !important; height: 30px !important;
          background: #fff; border-radius: 50%;
          box-shadow: 0 2px 10px rgba(0,0,0,.14);
          color: #0f172a !important;
        }
        .swiper-button-next::after, .swiper-button-prev::after { font-size: 11px !important; font-weight: 900; }
        .swiper-button-disabled { opacity: 0 !important; }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        .shimmer { background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size: 400px 100%; animation: shimmer 1.2s infinite; }
      `}</style>

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: "flex", gap: "10px", overflowX: "hidden", padding: "4px 0" }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="shimmer" style={{ minWidth: "88px", height: "72px", borderRadius: "14px", flexShrink: 0 }} />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ textAlign: "center", color: "#ef4444", fontSize: "13px", padding: "8px", fontFamily: "'DM Sans', sans-serif" }}>{error}</div>
      )}

      {/* Swiper */}
      {!loading && !error && (
        <Swiper
          modules={[Navigation, FreeMode]}
          freeMode={true}
          navigation={true}
          spaceBetween={10}
          slidesPerView="auto"
          style={{ padding: "6px 2px 8px" }}
        >
          {/* "All" chip */}
          <SwiperSlide style={{ width: "auto" }}>
            <button
              className="cat-chip"
              onClick={() => setActive(null)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: "5px", padding: "10px 14px", borderRadius: "14px", border: "none", cursor: "pointer",
                minWidth: "72px",
                background: active === null ? "#0f172a" : "#f1f5f9",
                color: active === null ? "#fff" : "#475569",
                boxShadow: active === null ? "0 4px 14px rgba(15,23,42,.22)" : "0 1px 3px rgba(0,0,0,.06)",
              }}
            >
              <span style={{ fontSize: "20px", lineHeight: 1 }}>🏪</span>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.01em", whiteSpace: "nowrap" }}>All</span>
            </button>
          </SwiperSlide>

          {categories.map((item, i) => {
            const palette = PALETTES[i % PALETTES.length];
            const isActive = active === item.id;
            const icon = item.icon || getCategoryIcon(item.categorie);
            return (
              <SwiperSlide key={item.id} style={{ width: "auto" }}>
                <button
                  className="cat-chip"
                  onClick={() => setActive(isActive ? null : item.id)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: "5px", padding: "10px 14px", borderRadius: "14px", border: "none", cursor: "pointer",
                    minWidth: "80px", maxWidth: "110px",
                    background: isActive ? palette.active : palette.bg,
                    color: isActive ? "#fff" : palette.text,
                    boxShadow: isActive ? `0 4px 14px ${palette.active}44` : "0 1px 3px rgba(0,0,0,.06)",
                    outline: isActive ? `2px solid ${palette.active}` : "2px solid transparent",
                    outlineOffset: "1px",
                  }}
                >
                  <span style={{ fontSize: "20px", lineHeight: 1 }}>{icon}</span>
                  <span style={{
                    fontSize: "11px", fontWeight: 700, letterSpacing: "0.01em",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    maxWidth: "90px", display: "block",
                  }}>
                    {item.categorie}
                  </span>
                </button>
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
    </div>
  );
}