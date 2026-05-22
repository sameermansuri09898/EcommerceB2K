import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─── API CONFIG ────────────────────────────────────────────────────────────────
const API_BASE_URL = "http://127.0.0.1:8000/api";

async function registerUser(payload) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined) formData.append(key, value);
  });
  const res = await fetch(`${API_BASE_URL}/register/`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

// ─── SUCCESS POPUP ─────────────────────────────────────────────────────────────
function SuccessPopup({ username }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,23,42,0.75)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="bg-white rounded-3xl px-10 py-10 text-center shadow-2xl"
        style={{ animation: "popIn .35s cubic-bezier(.175,.885,.32,1.275) forwards", maxWidth: 340 }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl"
          style={{ background: "linear-gradient(135deg,#d1fae5,#a7f3d0)", animation: "bounceIn .5s .1s both" }}
        >
          🎉
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1" style={{ fontFamily: "'Playfair Display',serif" }}>
          Welcome aboard!
        </h2>
        <p className="text-slate-500 text-sm">
          Account created for <span className="font-semibold text-indigo-600">@{username}</span>
        </p>
        <p className="text-slate-400 text-xs mt-3">Redirecting to email verification…</p>
        <div className="mt-4 h-1 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6)", animation: "progressBar 1s linear forwards" }}
          />
        </div>
      </div>
      <style>{`
        @keyframes popIn { from { opacity:0; transform:scale(.85) } to { opacity:1; transform:scale(1) } }
        @keyframes bounceIn { 0% { transform:scale(0) } 60% { transform:scale(1.2) } 100% { transform:scale(1) } }
        @keyframes progressBar { from { width:0% } to { width:100% } }
      `}</style>
    </div>
  );
}

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const ROLES = [
  { value: "", label: "Select your role" },
  { value: "customer", label: "Customer — Shop & buy products" },
  { value: "seller", label: "Seller — List & sell products" },
  { value: "admin", label: "Admin — Manage the platform" },
];

const STEPS = ["Account", "Personal", "Profile"];

// ─── FIELD VALIDATION ──────────────────────────────────────────────────────────
function validate(fields, values) {
  const errs = {};
  if (fields.includes("username")) {
    if (!values.username) errs.username = "Username is required";
    else if (values.username.length < 3) errs.username = "Min 3 characters";
    else if (!/^[a-zA-Z0-9_]+$/.test(values.username))
      errs.username = "Only letters, numbers, underscores";
  }
  if (fields.includes("email")) {
    if (!values.email) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      errs.email = "Enter a valid email";
  }
  if (fields.includes("password")) {
    if (!values.password) errs.password = "Password is required";
    else if (values.password.length < 8) errs.password = "Min 8 characters";
  }
  if (fields.includes("confirm_password")) {
    if (!values.confirm_password) errs.confirm_password = "Please confirm your password";
    else if (values.password !== values.confirm_password)
      errs.confirm_password = "Passwords do not match";
  }
  if (fields.includes("mobile_number")) {
    if (!values.mobile_number) errs.mobile_number = "Mobile number is required";
    else if (!/^\+?[0-9]{7,15}$/.test(values.mobile_number.replace(/\s/g, "")))
      errs.mobile_number = "Enter a valid mobile number";
  }
  if (fields.includes("role")) {
    if (!values.role) errs.role = "Please select a role";
  }
  return errs;
}

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────────
function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i < score ? colors[score - 1] : "#e5e7eb" }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: score > 0 ? colors[score - 1] : "#9ca3af" }}>
        {score > 0 ? labels[score - 1] : ""}
      </p>
    </div>
  );
}

function InputField({ label, name, type = "text", placeholder, value, onChange, error, icon, hint, children }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="mb-5">
      <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#64748b" }}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{ fontSize: 16 }}>
            {icon}
          </span>
        )}
        <input
          type={isPassword ? (show ? "text" : "password") : type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={isPassword ? "new-password" : "off"}
          className={`w-full rounded-xl border text-sm transition-all duration-200 outline-none
            ${icon ? "pl-10" : "pl-4"} ${isPassword ? "pr-12" : "pr-4"} py-3
            ${error
              ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200"
              : "border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1}
          >
            {show ? "🙈" : "👁️"}
          </button>
        )}
      </div>
      {children}
      {hint && !error && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function RegisterForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({
    username: "", email: "", password: "", confirm_password: "",
    mobile_number: "", role: "", bio: "", profile_image: null,
  });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [apiError, setApiError] = useState("");
  const fileRef = useRef();

  const stepFields = [
    ["username", "email", "password", "confirm_password"],
    ["mobile_number", "role"],
    [], // bio + profile_image — no hard required fields
  ];

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: "" }));
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((er) => ({ ...er, profile_image: "Image must be under 5MB" }));
      return;
    }
    setValues((v) => ({ ...v, profile_image: file }));
    setPreview(URL.createObjectURL(file));
    setErrors((er) => ({ ...er, profile_image: "" }));
  }

  function handleRemoveImage() {
    setValues((v) => ({ ...v, profile_image: null }));
    setPreview(null);
    fileRef.current.value = "";
  }

  function nextStep() {
    const errs = validate(stepFields[step], values);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => s + 1);
  }

  function prevStep() { setErrors({}); setStep((s) => s - 1); }

  async function handleSubmit() {
    setLoading(true);
    setApiError("");
    try {
      await registerUser(values);
      setShowPopup(true);
      // After 1 second show popup → redirect to VerifyOTP with email in state
      setTimeout(() => {
        navigate("/verify-otp", { state: { email: values.email } });
      }, 1000);
    } catch (err) {
      const msg =
        typeof err === "string" ? err :
        err?.detail || err?.message ||
        Object.values(err || {}).flat().join(" ") ||
        "Registration failed. Please try again.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }

  // ── FORM ──────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)", fontFamily: "'DM Sans', sans-serif" }}
    >
      {showPopup && <SuccessPopup username={values.username} />}
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute rounded-full opacity-20" style={{ width: 400, height: 400, top: -100, right: -100, background: "radial-gradient(circle, #6366f1, transparent)" }} />
        <div className="absolute rounded-full opacity-10" style={{ width: 300, height: 300, bottom: -50, left: -50, background: "radial-gradient(circle, #ec4899, transparent)" }} />
      </div>

      <div className="relative w-full max-w-lg" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>S</div>
            <span className="text-white text-xl font-bold tracking-tight">ShopNest</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            Create Account
          </h1>
          <p className="text-slate-400 text-sm">Join thousands of shoppers & sellers</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-8 gap-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                  style={{
                    background: i < step ? "#10b981" : i === step ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(255,255,255,0.1)",
                    color: i <= step ? "#fff" : "#94a3b8",
                    border: i > step ? "1.5px solid rgba(255,255,255,0.15)" : "none",
                  }}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span className="text-xs mt-1.5 font-medium" style={{ color: i === step ? "#a5b4fc" : "#475569" }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-16 h-px mx-2 mb-5 transition-all duration-500"
                  style={{ background: i < step ? "#10b981" : "rgba(255,255,255,0.1)" }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 shadow-2xl" style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)" }}>

          {/* ── STEP 0: Account ─────────────────────────────── */}
          {step === 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-6">Account Details</h2>
              <InputField label="Username" name="username" placeholder="e.g. arjun_kumar" value={values.username}
                onChange={handleChange} error={errors.username} icon="👤"
                hint="Only letters, numbers, and underscores" />
              <InputField label="Email Address" name="email" type="email" placeholder="you@example.com"
                value={values.email} onChange={handleChange} error={errors.email} icon="✉️" />
              <InputField label="Password" name="password" type="password" placeholder="Min. 8 characters"
                value={values.password} onChange={handleChange} error={errors.password} icon="🔒">
                <PasswordStrength password={values.password} />
              </InputField>
              <InputField label="Confirm Password" name="confirm_password" type="password" placeholder="Repeat your password"
                value={values.confirm_password} onChange={handleChange} error={errors.confirm_password} icon="🔑" />
            </div>
          )}

          {/* ── STEP 1: Personal ────────────────────────────── */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-6">Personal Info</h2>
              <InputField label="Mobile Number" name="mobile_number" type="tel" placeholder="+91 98765 43210"
                value={values.mobile_number} onChange={handleChange} error={errors.mobile_number} icon="📱"
                hint="Include country code (e.g. +91 for India)" />

              {/* Role Select */}
              <div className="mb-5">
                <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#64748b" }}>
                  Role
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ fontSize: 16 }}>🏷️</span>
                  <select
                    name="role"
                    value={values.role}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all duration-200 appearance-none
                      ${errors.role
                        ? "border-red-400 bg-red-50"
                        : "border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      }`}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value} disabled={r.value === ""}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▾</span>
                </div>
                {errors.role && <p className="text-xs text-red-500 mt-1">⚠ {errors.role}</p>}
              </div>

              {/* Role info cards */}
              {values.role && (
                <div className="rounded-xl p-4 mb-2 text-sm"
                  style={{ background: values.role === "seller" ? "#f0fdf4" : values.role === "admin" ? "#fdf4ff" : "#eff6ff", borderLeft: `3px solid ${values.role === "seller" ? "#10b981" : values.role === "admin" ? "#a855f7" : "#6366f1"}` }}>
                  {values.role === "customer" && "🛒 Browse thousands of products and track your orders with ease."}
                  {values.role === "seller" && "🏪 List unlimited products, manage inventory, and grow your business."}
                  {values.role === "admin" && "⚙️ Full platform access — manage users, products, and analytics."}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Profile ─────────────────────────────── */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-6">Complete Your Profile</h2>

              {/* Profile Image Upload */}
              <div className="mb-6">
                <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#64748b" }}>
                  Profile Photo <span className="normal-case text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="flex items-center gap-5">
                  <div
                    className="w-20 h-20 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-all relative group"
                    style={{ borderColor: preview ? "#6366f1" : "#cbd5e1", background: preview ? "transparent" : "#f8fafc" }}
                    onClick={() => !preview && fileRef.current.click()}
                  >
                    {preview ? (
                      <>
                        <img src={preview} alt="preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                          <span className="text-white text-xs font-semibold">Change</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-3xl">📷</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                    <button type="button" onClick={() => fileRef.current.click()}
                      className="w-full mb-2 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                      style={{ borderColor: "#6366f1", color: "#6366f1", background: "transparent" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#eef2ff"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                      {preview ? "Change Photo" : "Upload Photo"}
                    </button>
                    {preview && (
                      <button type="button" onClick={handleRemoveImage}
                        className="w-full py-2 rounded-xl text-xs font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-all">
                        Remove
                      </button>
                    )}
                    <p className="text-xs text-slate-400 mt-1.5">JPG, PNG or GIF • Max 5MB</p>
                  </div>
                </div>
                {errors.profile_image && <p className="text-xs text-red-500 mt-2">⚠ {errors.profile_image}</p>}
              </div>

              {/* Bio */}
              <div className="mb-4">
                <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#64748b" }}>
                  Bio <span className="normal-case text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  name="bio"
                  rows={4}
                  placeholder="Tell us a little about yourself or your store..."
                  value={values.bio}
                  onChange={handleChange}
                  maxLength={300}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none resize-none transition-all focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
                <p className="text-xs text-slate-400 text-right -mt-1">{values.bio.length}/300</p>
              </div>

              {/* API Error */}
              {apiError && (
                <div className="rounded-xl p-3.5 mb-4 text-sm text-red-700 bg-red-50 border border-red-200">
                  ⚠️ {apiError}
                </div>
              )}

              {/* Summary */}
              <div className="rounded-xl p-4 mb-2" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Account Summary</p>
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  {[
                    ["Username", `@${values.username}`],
                    ["Email", values.email],
                    ["Mobile", values.mobile_number],
                    ["Role", values.role || "—"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <span className="text-slate-400">{k}: </span>
                      <span className="font-semibold text-slate-700">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── NAV BUTTONS ─────────────────────────────────── */}
          <div className={`flex gap-3 mt-8 ${step > 0 ? "justify-between" : "justify-end"}`}>
            {step > 0 && (
              <button type="button" onClick={prevStep}
                className="flex-1 py-3.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
                ← Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={nextStep}
                className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                Continue →
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading}
                className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: loading ? "#94a3b8" : "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="40 20"/>
                    </svg>
                    Creating Account...
                  </span>
                ) : "Create Account 🎉"}
              </button>
            )}
          </div>

          <p className="text-center text-xs text-slate-400 mt-5">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-500 font-semibold hover:underline">Sign in</a>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-5">
          By registering you agree to our{" "}
          <a href="/terms" className="text-indigo-400 hover:underline">Terms</a> &{" "}
          <a href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}