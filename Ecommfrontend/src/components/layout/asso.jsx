import React from "react";

const Asso = () => {
  return (
    <div className="dropdown fixed top-0 left-0 hidden md:group-hover:block w-full bg-white shadow-2xl border-t border-gray-100 mt-[80px] z-50">
      <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-5 gap-8">

        {/* Categories */}
        <div>
          <h3 className="text-lg font-semibold mb-5 text-gray-900">
            Shop Categories
          </h3>

          <ul className="space-y-3 text-sm text-gray-600">
            <li className="hover:text-black cursor-pointer transition">
              Smart Watches
            </li>
            <li className="hover:text-black cursor-pointer transition">
              Wireless Earbuds
            </li>
            <li className="hover:text-black cursor-pointer transition">
              Mobile Accessories
            </li>
            <li className="hover:text-black cursor-pointer transition">
              Gaming Gear
            </li>
            <li className="hover:text-black cursor-pointer transition">
              Laptop Accessories
            </li>
            <li className="hover:text-black cursor-pointer transition">
              Bluetooth Speakers
            </li>
          </ul>
        </div>

        {/* Accessories */}
        <div>
          <h3 className="text-lg font-semibold mb-5 text-gray-900">
            Trending Accessories
          </h3>

          <ul className="space-y-3 text-sm text-gray-600">
            <li className="hover:text-black cursor-pointer transition">
              Premium Headphones
            </li>
            <li className="hover:text-black cursor-pointer transition">
              Power Banks
            </li>
            <li className="hover:text-black cursor-pointer transition">
              Phone Covers
            </li>
            <li className="hover:text-black cursor-pointer transition">
              Smart Home Devices
            </li>
            <li className="hover:text-black cursor-pointer transition">
              USB Hubs
            </li>
            <li className="hover:text-black cursor-pointer transition">
              Charging Cables
            </li>
          </ul>
        </div>

        {/* Featured Product 1 */}
        <div className="group cursor-pointer">
          <div className="overflow-hidden rounded-xl bg-gray-100">
            <img
              src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000&auto=format&fit=crop"
              alt="headphones"
              className="h-56 w-full object-cover group-hover:scale-105 transition duration-500"
            />
          </div>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              New Arrival
            </p>

            <h4 className="font-semibold text-lg mt-1">
              Premium Wireless Headphones
            </h4>

            <p className="text-sm text-gray-500 mt-1">
              Noise cancellation with deep bass sound.
            </p>

            <button className="mt-4 bg-black text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-800 transition">
              Shop Now
            </button>
          </div>
        </div>

        {/* Featured Product 2 */}
        <div className="group cursor-pointer">
          <div className="overflow-hidden rounded-xl bg-gray-100">
            <img
              src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000&auto=format&fit=crop"
              alt="mobile"
              className="h-56 w-full object-cover group-hover:scale-105 transition duration-500"
            />
          </div>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Best Seller
            </p>

            <h4 className="font-semibold text-lg mt-1">
              Mobile Accessories Combo
            </h4>

            <p className="text-sm text-gray-500 mt-1">
              Covers, chargers & cables for daily use.
            </p>

            <button className="mt-4 border border-black px-5 py-2 rounded-lg text-sm hover:bg-black hover:text-white transition">
              Explore
            </button>
          </div>
        </div>

        {/* Promo Banner */}
        <div className="bg-gradient-to-br from-black to-gray-800 text-white rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <p className="uppercase text-xs tracking-widest text-gray-300">
              Limited Offer
            </p>

            <h2 className="text-3xl font-bold mt-3 leading-tight">
              Up To 50% OFF
            </h2>

            <p className="text-sm text-gray-300 mt-4">
              On premium gadgets and accessories collection.
            </p>
          </div>

          <button className="mt-8 bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-200 transition">
            View Deals
          </button>
        </div>

      </div>
    </div>
  );
};

export default Asso;