import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Zap, ShoppingBag, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NO_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%231e293b'/%3E%3Ctext x='200' y='205' text-anchor='middle' font-size='14' fill='%2364748b' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";

// Accent color sets per slide (cycles)
const ACCENTS = [
  { from: "from-rose-500",   to: "to-orange-400",  badge: "bg-rose-500",   ring: "ring-rose-400",  glow: "rgba(244,63,94,0.25)"  },
  { from: "from-violet-500", to: "to-indigo-400",  badge: "bg-violet-500", ring: "ring-violet-400",glow: "rgba(139,92,246,0.25)" },
  { from: "from-amber-500",  to: "to-yellow-400",  badge: "bg-amber-500",  ring: "ring-amber-400", glow: "rgba(245,158,11,0.25)" },
  { from: "from-cyan-500",   to: "to-teal-400",    badge: "bg-cyan-500",   ring: "ring-cyan-400",  glow: "rgba(6,182,212,0.25)"  },
  { from: "from-emerald-500",to: "to-green-400",   badge: "bg-emerald-500",ring: "ring-emerald-400",glow:"rgba(16,185,129,0.25)" },
];

export default function OfferProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [current, setCurrent]   = useState(0);
  const [paused, setPaused]     = useState(false);
  const [direction, setDirection] = useState("right"); // for slide direction hint
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("http://127.0.0.1:8000/api/productlist/");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProducts(data.filter(p => p.variant_set?.some(v => v.offer >= 50)));
      } catch { /* silent */ }
      finally  { setLoading(false); }
    })();
  }, []);

  const go = useCallback((dir) => {
    setDirection(dir);
    setCurrent(prev =>
      dir === "right"
        ? prev === products.length - 1 ? 0 : prev + 1
        : prev === 0 ? products.length - 1 : prev - 1
    );
  }, [products.length]);

  // auto-advance
  useEffect(() => {
    if (!products.length || paused) return;
    const t = setInterval(() => go("right"), 4000);
    return () => clearInterval(t);
  }, [products, paused, go]);

  // ── Loading skeleton ──────────────────────────────────────────
  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 mt-10 mb-10">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>
      <div className="h-12 w-64 bg-slate-200 animate-pulse rounded-xl mb-3" />
      <div className="h-5 w-48 bg-slate-100 animate-pulse rounded-lg mb-6" />
      <div className="h-[480px] md:h-[540px] rounded-3xl bg-slate-200 animate-pulse" />
    </div>
  );

  if (!products.length) return null;

  const product     = products[current];
  const bestVariant = product.variant_set.reduce((m, v) => v.offer > m.offer ? v : m);
  const accent      = ACCENTS[current % ACCENTS.length];

  const savings     = (+bestVariant.price - +bestVariant.final_price).toLocaleString("en-IN");

  return (
    <section
      className="max-w-7xl mx-auto px-3 sm:px-4 mt-10 mb-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeSlideIn  { from { opacity:0; transform:translateX(32px);  } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeSlideInL { from { opacity:0; transform:translateX(-32px); } to { opacity:1; transform:translateX(0); } }
        @keyframes floatImg     { 0%,100% { transform:translateY(0px) scale(1); } 50% { transform:translateY(-10px) scale(1.02); } }
        @keyframes pulseBadge   { 0%,100% { box-shadow:0 0 0 0 rgba(255,255,255,.4); } 70% { box-shadow:0 0 0 8px rgba(255,255,255,0); } }
        .slide-in   { animation: fadeSlideIn  .55s cubic-bezier(.22,1,.36,1) both; }
        .slide-in-l { animation: fadeSlideInL .55s cubic-bezier(.22,1,.36,1) both; }
        .float-img  { animation: floatImg 5s ease-in-out infinite; }
        .badge-pulse { animation: pulseBadge 2s infinite; }
        .progress-bar { transition: width 4s linear; }
      `}</style>

      {/* ── Section header ── */}
      <div className="flex items-end justify-between mb-5 px-1">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400 mb-1"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>Limited Time Offers</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-none tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            Featured Deals
          </h2>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium"
          style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          {products.length} live deals
        </div>
      </div>

      {/* ── Slider card ── */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 shadow-2xl min-h-[420px] md:min-h-[520px]">

        {/* Dynamic background gradient */}
        <div
          key={`bg-${current}`}
          className={`absolute inset-0 bg-gradient-to-br ${accent.from} ${accent.to} opacity-10 transition-all duration-700`}
        />
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "180px" }} />

        {/* Glow orbs */}
        <div key={`orb1-${current}`} className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[80px] opacity-20 transition-all duration-700"
          style={{ background: accent.glow }} />
        <div key={`orb2-${current}`} className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-[60px] opacity-15 transition-all duration-700"
          style={{ background: accent.glow }} />

        {/* Slide content */}
        <div
          key={`${product.id}-${current}`}
          className={`relative z-10 grid lg:grid-cols-2 items-center min-h-[420px] md:min-h-[520px] ${direction === "right" ? "slide-in" : "slide-in-l"}`}
        >
          {/* ── LEFT TEXT ── */}
          <div className="px-6 pt-10 pb-6 md:px-12 md:py-14 lg:px-16 flex flex-col gap-0">

            {/* Offer badge */}
            <div className="flex items-center gap-2 mb-5">
              <span className={`badge-pulse inline-flex items-center gap-1.5 ${accent.badge} text-white text-xs font-bold px-3.5 py-1.5 rounded-full`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <Zap size={11} strokeWidth={3} />
                {bestVariant.offer}% OFF
              </span>
              <span className="text-slate-400 text-xs font-medium"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Save ₹{savings}
              </span>
            </div>

            {/* Product name */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.05] tracking-tight mb-3"
              style={{ fontFamily: "'Syne', sans-serif" }}>
              {product.name}
            </h1>

            {/* Brand */}
            <p className="text-slate-400 text-sm font-medium mb-6 tracking-wide"
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              by <span className="text-slate-300 font-semibold">{product.brand}</span>
              {product.categorie_name && (
                <> &nbsp;·&nbsp; <span className="text-slate-400">{product.categorie_name}</span></>
              )}
            </p>

            {/* Price block */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-4xl md:text-5xl font-black text-white tracking-tight"
                style={{ fontFamily: "'Syne', sans-serif" }}>
                ₹{(+bestVariant.final_price).toLocaleString("en-IN")}
              </span>
              <span className="text-xl text-slate-500 line-through font-medium">
                ₹{(+bestVariant.price).toLocaleString("en-IN")}
              </span>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/OfferProducts")}
                className={`inline-flex items-center gap-2 bg-gradient-to-r ${accent.from} ${accent.to} text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 hover:scale-[1.03] active:scale-[0.97] transition-all duration-150`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <ShoppingBag size={15} strokeWidth={2.5} />
                Shop Now
              </button>
              <button
                className="inline-flex items-center gap-2 border border-slate-600 text-slate-300 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-slate-800 hover:border-slate-400 hover:text-white active:scale-[0.97] transition-all duration-150"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <Eye size={14} strokeWidth={2} />
                View Details
              </button>
            </div>

            {/* Slide counter */}
            <p className="mt-8 text-slate-600 text-xs font-medium tracking-widest"
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {String(current + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
            </p>
          </div>

          {/* ── RIGHT IMAGE ── */}
          <div className="flex justify-center items-center px-8 pb-10 pt-0 lg:py-10">
            <div className="relative">
              {/* Glow behind image */}
              <div className="absolute inset-8 rounded-full blur-2xl opacity-30"
                style={{ background: accent.glow, transform: "scale(1.2)" }} />
              <img
                src={bestVariant.image_url || NO_IMG}
                alt={product.name}
                onError={e => { e.target.onerror = null; e.target.src = NO_IMG; }}
                className="float-img relative z-10 h-52 sm:h-64 md:h-80 lg:h-[360px] w-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* ── Progress bar ── */}
        {!paused && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-20">
            <div
              key={`prog-${current}`}
              className={`h-full bg-gradient-to-r ${accent.from} ${accent.to} progress-bar`}
              style={{ width: "100%" }}
            />
          </div>
        )}

        {/* ── Arrow buttons ── */}
        <button
          onClick={() => go("left")}
          className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all duration-150"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => go("right")}
          className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all duration-150"
        >
          <ChevronRight size={18} />
        </button>

        {/* ── Dot indicators ── */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? "right" : "left"); setCurrent(i); }}
              className={`rounded-full transition-all duration-300 ${
                current === i
                  ? `w-6 h-2 ${accent.badge}`
                  : "w-2 h-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Thumbnail strip ── */}
      {products.length > 1 && (
        <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1 px-0.5 scrollbar-none">
          {products.map((p, i) => {
            const v = p.variant_set.reduce((m, vv) => vv.offer > m.offer ? vv : m);
            const a = ACCENTS[i % ACCENTS.length];
            return (
              <button
                key={p.id}
                onClick={() => { setDirection(i > current ? "right" : "left"); setCurrent(i); }}
                className={`shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all duration-200
                  ${current === i
                    ? "bg-slate-900 border-slate-700 shadow-lg"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"}`}
              >
                <img
                  src={v.image_url || NO_IMG}
                  alt={p.name}
                  onError={e => { e.target.onerror = null; e.target.src = NO_IMG; }}
                  className="w-9 h-9 object-contain rounded-lg"
                />
                <div className="text-left hidden sm:block">
                  <p className={`text-xs font-bold truncate max-w-[100px] ${current === i ? "text-white" : "text-slate-800"}`}
                    style={{ fontFamily: "'Syne', sans-serif" }}>
                    {p.name}
                  </p>
                  <p className={`text-xs font-semibold ${a.badge.replace("bg-", "text-")}`}
                    style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {v.offer}% OFF
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}