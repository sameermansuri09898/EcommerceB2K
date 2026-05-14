
{/* Swiper Section */ }
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
