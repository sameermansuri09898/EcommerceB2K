import { useEffect, useState, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Zap, ShoppingBag, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NO_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%231e293b'/%3E%3Ctext x='200' y='205' text-anchor='middle' font-size='14' fill='%2364748b' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";

const ACCENTS = [
  { from: "from-rose-600/20",   to: "to-orange-500/10",  badge: "bg-rose-600 text-white",     border: "border-rose-500/30",   btn: "bg-rose-600 hover:bg-rose-700 text-white",     glow: "rgba(244,63,94,0.15)",  dots: "bg-rose-600" },
  { from: "from-violet-600/20", to: "to-indigo-500/10",  badge: "bg-violet-600 text-white",   border: "border-violet-500/30", btn: "bg-violet-600 hover:bg-violet-700 text-white", glow: "rgba(139,92,246,0.15)", dots: "bg-violet-600" },
  { from: "from-amber-600/20",  to: "to-yellow-500/10",  badge: "bg-amber-600 text-slate-900",border: "border-amber-500/30",  btn: "bg-amber-500 hover:bg-amber-600 text-slate-900", glow: "rgba(245,158,11,0.15)", dots: "bg-amber-500" },
  { from: "from-cyan-600/20",   to: "to-teal-500/10",    badge: "bg-cyan-600 text-white",     border: "border-cyan-500/30",   btn: "bg-cyan-600 hover:bg-cyan-700 text-white",     glow: "rgba(6,182,212,0.15)",  dots: "bg-cyan-600" },
  { from: "from-emerald-600/20",to: "to-green-500/10",   badge: "bg-emerald-600 text-white",  border: "border-emerald-500/30",btn: "bg-emerald-600 hover:bg-emerald-700 text-white",glow: "rgba(16,185,129,0.15)",dots: "bg-emerald-600" },
];

export default function OfferProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [current, setCurrent]   = useState(0);
  const [paused, setPaused]     = useState(false);
  const [direction, setDirection] = useState("right");
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/productlist/");
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        // Filter out items that have valid variant sets with >= 50% discount
        const validOffers = data.filter(p => 
          p?.variant_set?.some(v => v && typeof v.offer === "number" && v.offer >= 50)
        );
        
        if (isMounted) setProducts(validOffers);
      } catch (err) {
        console.error("Failed to fetch featured offers:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const go = useCallback((dir) => {
    setDirection(dir);
    setCurrent(prev =>
      dir === "right"
        ? prev === products.length - 1 ? 0 : prev + 1
        : prev === 0 ? products.length - 1 : prev - 1
    );
  }, [products.length]);

  useEffect(() => {
    if (!products.length || paused) return;
    timerRef.current = setInterval(() => go("right"), 5000); // 5s is standard for commercial sites
    return () => clearInterval(timerRef.current);
  }, [products, paused, go]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 my-12 animate-pulse">
        <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
        <div className="h-10 w-64 bg-slate-300 rounded mb-8" />
        <div className="h-[450px] md:h-[500px] w-full bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (!products.length) return null;

  const product = products[current];
  // Safe parsing fallback protection for undefined/null objects or strings
  const bestVariant = product?.variant_set?.reduce((m, v) => (v?.offer || 0) > (m?.offer || 0) ? v : m, { offer: 0, price: 0, final_price: 0 }) || {};
  const accent = ACCENTS[current % ACCENTS.length];

  const rawPrice = parseFloat(bestVariant.price) || 0;
  const rawFinalPrice = parseFloat(bestVariant.final_price) || 0;
  
  // Clean fallback if price calculations fail or yield a negative calculation
  const calculationsValid = rawPrice >= rawFinalPrice && rawFinalPrice > 0;
  const savings = calculationsValid ? (rawPrice - rawFinalPrice).toLocaleString("en-IN") : null;

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12 select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .premium-font { font-family: 'Plus Jakarta Sans', sans-serif; }
        
        @keyframes prgWidth { from { width: 0%; } to { width: 100%; } }
        .slide-progress { animation: prgWidth 5s linear forwards; }
        
        @keyframes premiumRight { 
          from { opacity: 0; transform: translate3d(20px, 0, 0); } 
          to { opacity: 1; transform: translate3d(0, 0, 0); } 
        }
        @keyframes premiumLeft { 
          from { opacity: 0; transform: translate3d(-20px, 0, 0); } 
          to { opacity: 1; transform: translate3d(0, 0, 0); } 
        }
        
        .anim-right { animation: premiumRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .anim-left { animation: premiumLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        
        @keyframes floatingEffect {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -8px, 0); }
        }
        .premium-float { animation: floatingEffect 4s ease-in-out infinite; }
        
        /* Hide scrollbars completely across targets */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Header Container */}
      <div className="flex items-end justify-between mb-6 premium-font">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 text-xs font-bold tracking-wider uppercase mb-2">
            <Zap size={12} className="fill-current" /> Limited Time Event
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Featured Deals
          </h2>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          {products.length} live offers remaining
        </div>
      </div>

      {/* Main Showcase Hero Block */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl min-h-[500px] lg:min-h-[460px] flex flex-col justify-between">
        
        {/* Dynamic ambient backgrounds */}
        <div 
          key={`ambient-${current}`}
          className={`absolute inset-0 bg-gradient-to-tr ${accent.from} ${accent.to} transition-all duration-700 ease-out`} 
        />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none transition-all duration-700" style={{ background: accent.glow }} />

        {/* Content Wrapper Grid */}
        <div 
          key={`slide-${current}`}
          className={`relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-14 my-auto premium-font ${direction === "right" ? "anim-right" : "anim-left"}`}
        >
          {/* Information & Actions Block */}
          <div className="lg:col-span-7 flex flex-col order-2 lg:order-1 text-center lg:text-left items-center lg:items-start">
            
            {/* Discount Badge Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
              <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-full ${accent.badge}`}>
                {bestVariant.offer}% SPECIAL DISCOUNT
              </span>
              {savings && (
                <span className="text-slate-400 text-xs font-semibold tracking-wide">
                  INSTANT SAVINGS OF ₹{savings}
                </span>
              )}
            </div>

            {/* Title / Info */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-2 max-w-xl line-clamp-2">
              {product.name}
            </h1>
            
            <p className="text-slate-400 text-sm font-medium mb-6">
              Brand: <span className="text-slate-200 font-semibold">{product.brand}</span>
              {product.categorie_name && (
                <span className="border-l border-slate-700 ml-2.5 pl-2.5 text-slate-400">{product.categorie_name}</span>
              )}
            </p>

            {/* Price Interface */}
            <div className="flex items-baseline justify-center lg:justify-start gap-4 mb-8">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                ₹{rawFinalPrice.toLocaleString("en-IN")}
              </span>
              {calculationsValid && (
                <span className="text-lg sm:text-xl text-slate-500 line-through font-medium">
                  ₹{rawPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* Button Actions */}
            <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-3.5">
              <button
                onClick={() => navigate(`/product/${product.id}`)}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm shadow-xl transition-all duration-200 transform active:scale-95 ${accent.btn}`}
              >
                <ShoppingBag size={16} strokeWidth={2.5} />
                Claim This Offer
              </button>
              <button
                onClick={() => navigate(`/product/${product.id}`)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-slate-700 bg-slate-900/50 backdrop-blur text-slate-300 px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-slate-800 hover:border-slate-500 hover:text-white transition-all duration-200"
              >
                <Eye size={16} />
                Quick View
              </button>
            </div>
          </div>

          {/* Product Media Column */}
          <div className="lg:col-span-5 flex justify-center items-center order-1 lg:order-2">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-white/[0.02] border border-white/[0.05] pointer-events-none scale-110" />
              <img
                src={bestVariant.image_url || NO_IMG}
                alt={product.name}
                onError={e => { e.target.onerror = null; e.target.src = NO_IMG; }}
                className="premium-float max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10"
              />
            </div>
          </div>
        </div>

        {/* Structural Navigation Controls and Indicators */}
        <div className="relative z-20 p-4 sm:p-6 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex items-center justify-between border-t border-white/[0.04]">
          {/* Dot Array layout indicators */}
          <div className="flex items-center gap-2">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > current ? "right" : "left"); setCurrent(i); }}
                className={`h-1.5 transition-all duration-300 rounded-full ${
                  current === i ? `w-6 ${accent.dots}` : "w-1.5 bg-slate-700 hover:bg-slate-500"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Counter and Arrows layout block */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest premium-font">
              {String(current + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => go("left")}
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-800 hover:text-white transition-all active:scale-95"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => go("right")}
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-800 hover:text-white transition-all active:scale-95"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Hardware Accelerated Progress Animation Bar */}
        {!paused && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-900/50 z-30 pointer-events-none">
            <div
              key={`prog-${current}`}
              className={`h-full bg-gradient-to-r ${accent.from.replace('/20', '')} to-white/40 slide-progress`}
            />
          </div>
        )}
      </div>

      {/* Horizontal Premium Live Strip Bar Container */}
      {products.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto py-2 px-1 no-scrollbar items-center snap-x">
          {products.map((p, i) => {
            const v = p?.variant_set?.reduce((m, vv) => (vv?.offer || 0) > (m?.offer || 0) ? vv : m, { offer: 0 }) || {};
            const isActive = current === i;
            return (
              <button
                key={p.id}
                onClick={() => { setDirection(i > current ? "right" : "left"); setCurrent(i); }}
                className={`snap-start shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-200 text-left premium-font
                  ${isActive
                    ? "bg-slate-900 border-slate-700 shadow-md ring-1 ring-white/10"
                    : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50"}`}
              >
                <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-100 p-0.5 flex items-center justify-center overflow-hidden">
                  <img
                    src={v.image_url || NO_IMG}
                    alt={p.name}
                    onError={e => { e.target.onerror = null; e.target.src = NO_IMG; }}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="max-w-[120px]">
                  <p className={`text-xs font-bold truncate ${isActive ? "text-white" : "text-slate-800"}`}>
                    {p.name}
                  </p>
                  <p className={`text-[10px] font-extrabold tracking-wider ${isActive ? "text-amber-400" : "text-emerald-600"}`}>
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