import { useState, useEffect, useRef } from "react";

export default function ProductDetails() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://127.0.0.1:8000/api/productlist/", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        if (error.name !== "AbortError") setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, []);

  const handleVariantChange = (productId, variant) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variant }));
  };

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -700 : 700, behavior: "smooth" });
    setTimeout(checkScroll, 350);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="w-full bg-white px-4 py-5">
        <div className="h-5 w-52 bg-gray-200 rounded animate-pulse mb-5" />
        <div className="flex gap-3 overflow-hidden">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-40 space-y-2">
              <div className="w-40 h-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="w-full bg-white px-4 py-10 flex items-center justify-center">
        <div className="text-center max-w-xs">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p className="text-gray-800 font-semibold mb-1">Something went wrong</p>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded bg-[#FFD814] border border-[#FFC200] text-gray-900 text-sm font-semibold hover:bg-[#F7CA00] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ── Main ── */
  return (
    <div className="w-full bg-[#f3f3f3] min-h-screen">

      {/* Top Offer Bar */}
      <div className="w-full bg-[#232f3e] text-white overflow-hidden py-2">
        <div className="flex animate-marquee whitespace-nowrap">
          {[
            "🔥 Bank Offer: 10% off on SBI Cards",
            "🚚 Free Delivery on orders above ₹499",
            "⚡ Flash Sale: Upto 70% OFF — Ends Tonight!",
            "💳 No Cost EMI on orders above ₹3,000",
            "🎁 Buy 2 Get 1 Free on selected items",
          ].flatMap((o, i) => [
            <span key={`a${i}`} className="text-[13px] font-medium mx-10">{o}</span>,
            <span key={`sep${i}`} className="text-gray-500 mx-2">|</span>,
          ]).concat(
            ["🔥 Bank Offer: 10% off on SBI Cards", "🚚 Free Delivery on orders above ₹499", "⚡ Flash Sale: Upto 70% OFF — Ends Tonight!", "💳 No Cost EMI on orders above ₹3,000", "🎁 Buy 2 Get 1 Free on selected items"].flatMap((o, i) => [
              <span key={`b${i}`} className="text-[13px] font-medium mx-10">{o}</span>,
              <span key={`sep2${i}`} className="text-gray-500 mx-2">|</span>,
            ])
          )}
        </div>
        <style>{`
          @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          .animate-marquee { animation: marquee 30s linear infinite; }
          .animate-marquee:hover { animation-play-state: paused; }
        `}</style>
      </div>


      {/* Swiper Section */}
      <div className="w-full bg-white mt-3 relative">

        {/* Section Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
          <h2 className="text-[20px] sm:text-[22px] font-semibold text-gray-900">
            Customers also viewed
          </h2>
          <a href="#" className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline">
            See all
          </a>
        </div>

        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 z-10 bg-white/95 hover:bg-white border-r border-gray-200 shadow-lg flex items-center justify-center transition-all"
            style={{ top: "56px", bottom: "48px", width: "42px" }}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 z-10 bg-white/95 hover:bg-white border-l border-gray-200 shadow-lg flex items-center justify-center transition-all"
            style={{ top: "56px", bottom: "48px", width: "42px" }}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Product Track */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex overflow-x-auto px-5 py-4 gap-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>

          {users.length === 0 ? (
            <div className="w-full py-16 flex flex-col items-center text-gray-400 text-sm">
              <svg className="w-10 h-10 mb-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              No products available
            </div>
          ) : (
            users.map((user, index) => (
              <div
                key={user.id}
                className="flex-shrink-0 w-[160px] sm:w-[175px] md:w-[190px] cursor-pointer group"
                style={{
                  borderRight: index !== users.length - 1 ? "1px solid #e7e7e7" : "none",
                  padding: "0 12px",
                }}
              >
                {/* Image */}
                <div className="w-full aspect-square overflow-hidden bg-gray-50 rounded mb-2 flex items-center justify-center">
                  <img
                    src={user.product_image}
                    alt={user.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Name */}
                <p className="text-[13px] leading-snug text-[#0F1111] line-clamp-2 group-hover:text-[#C7511F] transition-colors mb-1">
                  {user.name}
                </p>

                {/* Category */}
                <p className="text-[12px] text-[#007185]">
                  {user.category}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer Link */}
        <div className="border-t border-gray-100 py-3 text-center">
          <a href="#" className="text-[13px] text-[#007185] hover:text-[#C7511F] hover:underline">
            See all recommendations →
          </a>
        </div>
      </div>

    </div>
  );
}