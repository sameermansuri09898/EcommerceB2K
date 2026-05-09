import React, { useState } from "react";
import { Menu, X, ShoppingCart, User, Search, Heart } from "lucide-react";
import Asso from "./asso";

const Nav = () => {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="bg-gray-100 min-h-screen w-full overflow-x-hidden">

      {/* Top Bar */}
      <div className="bg-indigo-600 text-white font-semibold text-center py-2 text-sm px-3">
        You Are Away $30 from Free Shipping 🚚
      </div>

      {/* Navbar */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">

          {/* Logo */}
          <div className="brand-logo">
            <h1 className="text-2xl md:text-3xl font-bold cursor-pointer">
              Speed<span className="text-indigo-600">XS</span>
            </h1>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-8">

            <div className="relative group">
              <button className="hover:text-indigo-600 font-medium transition">
                Accessories
              </button>

              <Asso />
            </div>

            <div className="relative group">
              <button className="hover:text-indigo-600 font-medium transition">
                Trending
              </button>

              <Asso />
            </div>

            <div className="relative group">
              <button className="hover:text-indigo-600 font-medium transition">
                Top Deals
              </button>

              <Asso />
            </div>

            <a href="#" className="hover:text-indigo-600 transition">
              Home
            </a>

            <a href="#" className="hover:text-indigo-600 transition">
              Shop
            </a>
          </nav>

          {/* Right Icons */}
          <div className="hidden md:flex items-center gap-5">

            <button className="hover:text-indigo-600 transition cursor-pointer">
              <User size={22} />
            </button>
            <button className="hover:text-red-500 transition cursor-pointer">
              <Heart size={22} />
            </button>

            <button className="relative hover:text-indigo-600 transition cursor-pointer">
              <ShoppingCart size={22} />

              <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                2
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="md:hidden bg-white border-t shadow-lg px-5 py-5 space-y-5">

            <a href="#" className="block font-medium">
              Home
            </a>

            <a href="#" className="block font-medium">
              Accessories
            </a>

            <a href="#" className="block font-medium">
              Trending
            </a>

            <a href="#" className="block font-medium">
              Top Deals
            </a>

            <div className="flex items-center gap-5 pt-3 border-t">

              <button>
                <User size={22} />
              </button>

              <button className="relative">
                <ShoppingCart size={22} />

                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  2
                </span>
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="w-full w-full mx-auto flex items-center border border-gray-300 rounded-full overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 bg-white shadow-lg mt-2">

        <input
          type="text"
          placeholder="Search products, brands and more..."
          className="w-full px-5 py-3 text-sm outline-none"
        />

        <button className="bg-indigo-600 text-white px-6 py-3 hover:bg-indigo-700 transition">
          Search
        </button>

      </div>



    </div>
  );
};

export default Nav;