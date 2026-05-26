import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Heart,
  LogOut,
  Home,
  Search,
} from "lucide-react";
import { useNavigate, useLocation,Link } from "react-router-dom";

import Asso from "./asso";

const Nav = () => {

  const access = localStorage.getItem("access");
  console.log(access)
  
 
  const [mobileMenu, setMobileMenu] = useState(false);
  const [userPopup, setUserPopup] = useState(false);

  // auth demo
    const navigate = useNavigate();
  const isAuthenticated = true;

  const popupRef = useRef();

  // close popup outside click
  useEffect(() => {
    const handler = (e) => {
      if (!popupRef.current?.contains(e.target)) {
        setUserPopup(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  // logout api 
const handleLogout = async () => {

  try {

    const refresh = localStorage.getItem("refresh");

    await axios.post(
      "http://127.0.0.1:8000/api/logout/",
      {
        refresh_token: refresh,
      }
    );

  } catch (error) {

    console.log(error.response?.data);

  } finally {

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    navigate("/login");

    window.location.reload();
  }
};

  return (
    <div className="bg-gray-100  relative">

      {/* NAVBAR */}
      <header className="bg-white shadow-md sticky top-0 z-[999] overflow-visible">

        <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 flex items-center justify-between">

          {/* LOGO */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold cursor-pointer">
              Speed<span className="text-indigo-600">XS</span>
            </h1>
          </div>

          {/* DESKTOP MENU */}
          <nav className="hidden lg:flex items-center gap-8">

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

            <a
              href="#"
              className="hover:text-indigo-600 transition font-medium"
            >
              Home
            </a>

            <a
              href="#"
              className="hover:text-indigo-600 transition font-medium"
            >
              Shop
            </a>
          </nav>

          {/* RIGHT ICONS */}
          <div className="hidden md:flex items-center gap-5">

            {/* USER POPUP */}
            <div className="relative isolate" ref={popupRef}>

              <button
                onClick={() => setUserPopup(!userPopup)}
                className="hover:text-indigo-600 transition cursor-pointer"
              >
                <User size={22} />
              </button>

              {userPopup && (
                <div
                  className="
                    absolute right-0 top-14
                    w-72
                    bg-white
                    rounded-2xl
                    shadow-[0_10px_40px_rgba(0,0,0,0.15)]
                    border
                    overflow-hidden
                    z-[9999]
                  "
                >

                  {/* TOP */}
                  <div className="p-5 border-b bg-gray-50">

                    {isAuthenticated ? (
                      <>
                        <h2 className="font-semibold text-lg">
                          Hello, Sameer 👋
                        </h2>

                        <p className="text-sm text-gray-500">
                          Manage your account
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 className="font-semibold text-lg">
                          Welcome 👋
                        </h2>

                        <p className="text-sm text-gray-500">
                          Login to access your account
                        </p>
                      </>
                    )}

                  </div>

                  {/* MENU */}
                  <div className="p-2 flex flex-col">

                  {access ? (
  <>
    <button
      className="
        flex items-center gap-3
        px-4 py-3 rounded-xl
        hover:bg-gray-100
        transition
      "
    >
      <User size={18} />
      My Profile
    </button>

    <button
      onClick={() => navigate('/')}
      className="
        flex items-center gap-3
        px-4 py-3 rounded-xl
        hover:bg-gray-100
        transition
      "
    >
      <Home size={18} />
      Add Address
    </button>

    <button
      className="
        flex items-center gap-3
        px-4 py-3 rounded-xl
        hover:bg-gray-100
        transition
      "
    >
      <Heart size={18} />
      Wishlist
    </button>

    <button
      onClick={handleLogout}
      className="
        flex items-center gap-3
        px-4 py-3 rounded-xl
        hover:bg-red-50
        text-red-500
        transition
      "
    >
      <LogOut size={18} />
      Logout
    </button>
  </>
) : (
  <>
    <button
      onClick={() => navigate('/login')}
      className="
        w-full bg-indigo-600
        text-white py-3
        rounded-xl
        hover:bg-indigo-700
        transition font-medium
      "
    >
      Login
    </button>

    <button
      onClick={() => navigate('/register')}
      className="
        mt-3 w-full
        border border-indigo-600
        text-indigo-600
        py-3 rounded-xl
        hover:bg-indigo-50
        transition font-medium
      "
    >
      Register
    </button>
  </>
)}

                  </div>
                </div>
              )}
            </div>

            {/* WISHLIST */}
            <button className="hover:text-red-500 transition cursor-pointer">
              <Heart size={22} />
            </button>

            {/* CART */}
          {access ?(  <button  onClick={() => navigate('/Cart')}
            className="relative hover:text-indigo-600 transition cursor-pointer">

              <ShoppingCart size={22} />

              <span
                className="
                  absolute -top-2 -right-2
                  bg-indigo-600 text-white
                  text-xs w-5 h-5
                  rounded-full
                  flex items-center justify-center
                "
              >
                2
              </span>

            </button>):(  <button  onClick={() => navigate('/login')}
            className="relative hover:text-indigo-600 transition cursor-pointer">

              <ShoppingCart size={22} />

              <span
                className="
                  absolute -top-2 -right-2
                  bg-indigo-600 text-white
                  text-xs w-5 h-5
                  rounded-full
                  flex items-center justify-center
                "
              >
                2
              </span>

            </button>)}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X size={28} /> : <Menu size={28} />}
          </button>

        </div>

        {/* MOBILE MENU */}
        {mobileMenu && (
          <div
            className="
              md:hidden
              bg-white
              border-t
              shadow-lg
              px-5 py-5
              space-y-5
              z-[999]
              relative
            "
          >

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

            <a href="#" className="block font-medium">
              Shop
            </a>

            {/* MOBILE ICONS */}
            <div className="flex items-center gap-6 pt-4 border-t">

              <button>
                <User size={22} />
              </button>

              <button>
                <Heart size={22} />
              </button>

              <button className="relative">

                <ShoppingCart size={22} />

                <span
                  className="
                    absolute -top-2 -right-2
                    bg-indigo-600 text-white
                    text-xs w-5 h-5
                    rounded-full
                    flex items-center justify-center
                  "
                >
                  2
                </span>

              </button>
            </div>

          </div>
        )}
      </header>

      {/* SEARCH BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-5 mt-2 pb-1">

        <div
          className="
            flex items-center
            border border-gray-300
            rounded-full
            overflow-hidden
            bg-white
            shadow-md
          "
        >

          <input
            type="text"
            placeholder="Search products, brands and more..."
            className="
              w-full px-4 sm:px-5
              py-3 text-sm
              outline-none
            "
          />

          <button
            className="
              bg-indigo-600 text-white
              px-4 sm:px-6 py-3
              hover:bg-indigo-700
              transition
              flex items-center gap-2
            "
          >
            <Search size={18} />

            <span className="hidden sm:block">
              Search
            </span>
          </button>

        </div>
      </div>

    </div>
    
  );
};

export default Nav;