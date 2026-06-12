import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Menu, X, ShoppingCart, User, Heart, LogOut,
  Home, Search, MapPin, Package, ChevronDown,
  Zap, Tag, TrendingUp, Shield, MapPinCheckInside
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import Asso from "./asso";

const API_BASE = "http://127.0.0.1:8000";

/* ─────────────────────────────────────────
   TOKEN UTILITIES
───────────────────────────────────────── */
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp is in seconds, Date.now() in ms
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function getValidToken() {
  const token = localStorage.getItem("access");
  if (isTokenExpired(token)) {
    // Clear stale tokens silently
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    return null;
  }
  return token;
}

/* ─────────────────────────────────────────
   NAV LINK DATA
───────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Shop", href: "/shop", icon: Tag },
  { label: "Trending", href: "/trending", icon: TrendingUp },
  { label: "Top Deals", href: "/deals", icon: Zap },
];

const DROPDOWN_LINKS = [
  { label: "Accessories", dropdown: true },
];

/* ─────────────────────────────────────────
   USER MENU POPUP
───────────────────────────────────────── */
function UserMenu({ isAuth, onLogout, onClose }) {
  const navigate = useNavigate();

  const go = (path) => { navigate(path); onClose(); };

  return (
    <div className="absolute right-0 top-[calc(100%+12px)] w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[9999] animate-fadeSlideDown">
      {/* Header */}
      <div className={`px-5 py-4 ${isAuth ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white" : "bg-gray-50"}`}>
        {isAuth ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
              S
            </div>
            <div>
              <p className="font-semibold text-base leading-tight">Hello, Sameer 👋</p>
              <p className="text-indigo-200 text-xs">Manage your account</p>
            </div>
          </div>
        ) : (
          <>
            <p className="font-semibold text-gray-800 text-base">Welcome 👋</p>
            <p className="text-gray-500 text-xs mt-0.5">Login to access your account</p>
          </>
        )}
      </div>

      <div className="p-2">
        {isAuth ? (
          <>
            {[
              { icon: User, label: "My Profile", path: "/profile" },
              { icon: Package, label: "My Orders", path: "/orders" },
              { icon: MapPin, label: "Saved Addresses", path: "/address" },
              { icon: Heart, label: "Wishlist", path: "/wishlist" },
            ].map(({ icon: Icon, label, path }) => (
              <button
                key={label}
                onClick={() => go(path)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition text-sm text-gray-700 font-medium group"
              >
                <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition">
                  <Icon size={15} className="text-gray-500 group-hover:text-indigo-600" />
                </span>
                {label}
              </button>
            ))}

            <div className="border-t border-gray-100 my-1" />

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-50 transition text-sm text-red-500 font-medium group"
            >
              <span className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition">
                <LogOut size={15} className="text-red-400" />
              </span>
              Logout
            </button>
          </>
        ) : (
          <div className="p-2 space-y-2">
            <button
              onClick={() => go("/login")}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition font-semibold text-sm"
            >
              Login
            </button>
            <button
              onClick={() => go("/register")}
              className="w-full border border-indigo-200 text-indigo-600 py-2.5 rounded-xl hover:bg-indigo-50 transition font-semibold text-sm"
            >
              Create Account
            </button>
            <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1 pt-1">
              <Shield size={11} /> Secure &amp; Trusted Platform
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   CART BADGE
───────────────────────────────────────── */
function CartBadge({ count, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-xl hover:bg-gray-100 transition text-gray-700 hover:text-indigo-600 group"
      aria-label="Cart"
    >
      <ShoppingCart size={21} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────
   MAIN NAV
───────────────────────────────────────── */
const Nav = () => {
  const navigate = useNavigate();
  const popupRef = useRef(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userPopup, setUserPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount] = useState(2); // replace with real cart count from API/context

  // Check auth on every render + listen for storage changes
  const [isAuth, setIsAuth] = useState(() => !!getValidToken());

  useEffect(() => {
    const syncAuth = () => setIsAuth(!!getValidToken());
    window.addEventListener("storage", syncAuth);
    // Also re-check every 60s in case token expires while page is open
    const interval = setInterval(syncAuth, 60_000);
    return () => { window.removeEventListener("storage", syncAuth); clearInterval(interval); };
  }, []);

  // Close user popup on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!popupRef.current?.contains(e.target)) setUserPopup(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ── Logout ── */
  const handleLogout = useCallback(async () => {
    setUserPopup(false);
    try {
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        await axios.post(`${API_BASE}/api/logout/`, { refresh_token: refresh });
      }
    } catch (err) {
      console.warn("Logout API error:", err?.response?.data);
    } finally {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      setIsAuth(false);
      navigate("/login");
    }
  }, [navigate]);

  /* ── Cart click ── */
  const handleCart = () => navigate(isAuth ? "/Cart" : "/login");

  /* ── Search submit ── */
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <>
      {/* Inject animation keyframes */}
      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeSlideDown { animation: fadeSlideDown 0.18s ease-out both; }
      `}</style>

      <div className="sticky top-0 z-[999] bg-white shadow-sm border-b border-gray-100">

        {/* ── TOP BAR ── */}
        <header className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-1 select-none">
            <span className="text-2xl font-black tracking-tight text-gray-900">Speed</span>
            <span className="text-2xl font-black tracking-tight text-indigo-600">XS</span>
          </Link>

          {/* Desktop Search (center) */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl mx-4 items-center border-2 border-gray-200 focus-within:border-indigo-500 rounded-full overflow-hidden transition-colors bg-white"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands and more..."
              className="flex-1 px-4 py-2.5 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-sm font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0"
            >
              <Search size={15} />
              <span className="hidden lg:block">Search</span>
            </button>
          </form>

          {/* Desktop Right Icons */}
          <div className="hidden md:flex items-center gap-1">

            {/* User */}
            <div className="relative" ref={popupRef}>
              <button
                onClick={() => setUserPopup((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-gray-100 transition text-sm font-medium ${userPopup ? "bg-gray-100 text-indigo-600" : "text-gray-700"}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isAuth ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                  {isAuth ? "S" : <User size={14} />}
                </div>
                <span className="hidden lg:block">{isAuth ? "Account" : "Login"}</span>
                <ChevronDown size={14} className={`hidden lg:block transition-transform ${userPopup ? "rotate-180" : ""}`} />
              </button>

              {userPopup && (
                <UserMenu
                  isAuth={isAuth}
                  onLogout={handleLogout}
                  onClose={() => setUserPopup(false)}
                />
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => navigate(isAuth ? "/Wishlist" : "/login")}
              className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-700 hover:text-red-500 cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart size={21} />
            </button>

             {/* Address pin */}
            <button
              onClick={() => navigate(isAuth ? "/address" : "/login")}
              className="p-2 rounded-xl hover:bg-gray-100 transition text-red-900 hover:text-red-500 cursor-pointer"
              aria-label="Wishlist"
            >
              <MapPinCheckInside size={21} />
            </button>

            {/* Cart */}
            <CartBadge count={isAuth ? cartCount : 0} onClick={handleCart} />
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <CartBadge count={isAuth ? cartCount : 0} onClick={handleCart} />
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-700 cursor-pointer"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </header>

        {/* ── DESKTOP NAV LINKS ── */}
        <nav className="hidden lg:block border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 h-11">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                to={href}
                className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
              >
                {label}
              </Link>
            ))}

            {/* Accessories dropdown */}
            <div className="relative group">
              <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition flex items-center gap-1">
                Accessories
                <ChevronDown size={13} className="group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute top-full left-0 pt-2 hidden group-hover:block z-50">
                <Asso />
              </div>
            </div>
          </div>
        </nav>

        {/* ── MOBILE SEARCH ── */}
        <div className="md:hidden px-4 pb-3 pt-1">
          <form
            onSubmit={handleSearch}
            className="flex items-center border border-gray-200 focus-within:border-indigo-500 rounded-full overflow-hidden transition-colors bg-gray-50"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-2.5 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2.5 flex items-center justify-center"
            >
              <Search size={16} />
            </button>
          </form>
        </div>

        {/* ── MOBILE MENU PANEL ── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1 shadow-lg animate-fadeSlideDown">

            {/* Auth section */}
            {isAuth ? (
              <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-indigo-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-base">S</div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Sameer</p>
                  <p className="text-xs text-gray-500" onClick={() => { navigate("/seller/dashboard"); setMobileOpen(false); }}>
                    View account
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 mb-3">
                <button onClick={() => { navigate("/login"); setMobileOpen(false); }}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold">Login</button>
                <button onClick={() => { navigate("/register"); setMobileOpen(false); }}
                  className="flex-1 border border-indigo-200 text-indigo-600 py-2.5 rounded-xl text-sm font-semibold">Register</button>
              </div>
            )}

            {/* Nav links */}
            {NAV_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                to={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition"
              >
                <Icon size={17} className="text-gray-400" />
                {label}
              </Link>
            ))}
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition">
              <Tag size={17} className="text-gray-400" /> Accessories
            </button>

            {/* Bottom icons */}
            {isAuth && (
              <>
                <div className="border-t border-gray-100 my-2" />
                <button onClick={() => { navigate("/wishlist"); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition w-full">
                  <Heart size={17} className="text-gray-400" /> Wishlist
                </button>
                <button onClick={() => { navigate("/orders"); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition w-full">
                  <Package size={17} className="text-gray-400" /> My Orders
                </button>
                <button onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition w-full">
                  <LogOut size={17} /> Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Nav;