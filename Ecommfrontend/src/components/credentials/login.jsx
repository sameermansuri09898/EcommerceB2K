import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

async function loginApi(username, password) {
  const res = await fetch(`${API_BASE}/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const verified = location.state?.verified;

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const data = await loginApi(
        formData.username,
        formData.password
      );

      console.log(data);

      // Save JWT Tokens
      if (data.access_token) {
  localStorage.setItem("access", data.access_token);

}
if (data.role) localStorage.setItem("role", data.role);

if (data.refresh_token) {
  localStorage.setItem("refresh", data.refresh_token);
}

      // Optional user data
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Redirect after login
      navigate("/");

    } catch (err) {
      const msg =
        err?.detail ||
        err?.message ||
        err?.non_field_errors?.[0] ||
        "Invalid username or password";

      setError(msg);

    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative"
      style={{
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >

      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        <div
          className="absolute rounded-full opacity-20 blur-3xl"
          style={{
            width: "400px",
            height: "400px",
            background: "#6366f1",
            top: "-120px",
            right: "-100px",
          }}
        />

        <div
          className="absolute rounded-full opacity-10 blur-3xl"
          style={{
            width: "300px",
            height: "300px",
            background: "#ec4899",
            bottom: "-100px",
            left: "-80px",
          }}
        />

      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">

          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
            style={{
              background:
                "linear-gradient(135deg, #6366f1, #8b5cf6)",
            }}
          >
            S
          </div>

          <h1 className="text-white text-3xl font-bold tracking-tight">
            ShopNest
          </h1>

        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">

          {/* Icon */}
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl"
            style={{
              background:
                "linear-gradient(135deg, #eef2ff, #e0e7ff)",
            }}
          >
            🔐
          </div>

          <h2
            className="text-3xl font-bold text-center text-slate-800 mb-2"
            style={{
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Welcome Back
          </h2>

          <p className="text-center text-slate-500 mb-6 text-sm">
            Login to continue your shopping journey
          </p>

          {/* Verified Message */}
          {verified && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-sm text-center">
              ✅ Email verified successfully. Please login.
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm text-center animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Username
              </label>

              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pl-12 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 focus:bg-white"
                />

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  👤
                </span>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pl-12 pr-12 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 focus:bg-white"
                />

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  🔒
                </span>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-600"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-60 shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="white"
                      strokeWidth="3"
                      strokeDasharray="40 20"
                    />
                  </svg>

                  Logging in...
                </div>
              ) : (
                "Login →"
              )}
            </button>

          </form>

          {/* Register */}
          <div className="mt-7 pt-5 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}

              <button
                onClick={() => navigate('/register')}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Register Now
              </button>

            </p>
          </div>

        </div>

        {/* Bottom Text */}
        <p className="text-center text-slate-500 text-xs mt-6">
          🔒 Secure Login Protected by ShopNest Security
        </p>

      </div>
    </div>
  );
}
