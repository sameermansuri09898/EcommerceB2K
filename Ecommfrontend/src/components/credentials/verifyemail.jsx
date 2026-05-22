import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ─── API CONFIG ────────────────────────────────────────────────────────────────
const API_BASE = "http://127.0.0.1:8000/api";

async function verifyOTPApi(email, otp) {
  const res = await fetch(`${API_BASE}/otp/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

async function resendOTPApi(email) {
  const res = await fetch(`${API_BASE}/resend-otp/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

// ─── OTP INPUT ─────────────────────────────────────────────────────────────────
function OTPInput({ length = 4, value, onChange, disabled, hasError }) {
  const inputs = useRef([]);

  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  function handleKey(i, e) {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const next = value.slice(0, i) + value.slice(i + 1);
        onChange(next);
      } else if (i > 0) {
        inputs.current[i - 1]?.focus();
        const next = value.slice(0, i - 1) + value.slice(i);
        onChange(next);
      }
      return;
    }
    if (e.key === "ArrowLeft" && i > 0) { inputs.current[i - 1]?.focus(); return; }
    if (e.key === "ArrowRight" && i < length - 1) { inputs.current[i + 1]?.focus(); return; }
  }

  function handleInput(i, e) {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    if (!char) return;
    const arr = digits.map((d) => d);
    arr[i] = char;
    const next = arr.join("").slice(0, length);
    onChange(next);
    if (i < length - 1) inputs.current[i + 1]?.focus();
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pasted) { onChange(pasted); inputs.current[Math.min(pasted.length, length - 1)]?.focus(); }
    e.preventDefault();
  }

  return (
    <div className="flex gap-3 justify-center my-8">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onKeyDown={(e) => handleKey(i, e)}
          onChange={(e) => handleInput(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`
            w-12 h-14 text-center text-xl font-bold rounded-2xl border-2 outline-none
            transition-all duration-200 select-none
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${hasError
              ? "border-red-400 bg-red-50 text-red-600 shake"
              : d
              ? "border-indigo-500 bg-indigo-50 text-indigo-700 scale-105"
              : "border-slate-200 bg-slate-50 text-slate-800 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            }
          `}
        />
      ))}
    </div>
  );
}

// ─── RESEND TIMER ──────────────────────────────────────────────────────────────
function ResendTimer({ onResend, resending }) {
  const [seconds, setSeconds] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (seconds <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  function handleResend() {
    if (!canResend || resending) return;
    onResend();
    setSeconds(60);
    setCanResend(false);
  }

  return (
    <div className="text-center mt-2">
      {canResend ? (
        <button
          onClick={handleResend}
          disabled={resending}
          className="text-indigo-600 font-semibold text-sm hover:text-indigo-800 transition-colors disabled:opacity-50 flex items-center gap-1.5 mx-auto"
        >
          {resending ? (
            <>
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" />
              </svg>
              Sending...
            </>
          ) : (
            <>↺ Resend OTP</>
          )}
        </button>
      ) : (
        <p className="text-slate-400 text-sm">
          Resend code in{" "}
          <span className="font-bold tabular-nums" style={{ color: seconds <= 10 ? "#ef4444" : "#6366f1" }}>
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
          </span>
        </p>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();

  // Email passed via router state from RegisterForm
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [verified, setVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 5;

  // Auto-submit when all 6 digits filled
  useEffect(() => {
    if (otp.length === 4 && !loading && !verified) handleVerify(otp);
  }, [otp]);

  async function handleVerify(code = otp) {
    if (code.length < 4) { setError("Please enter the complete 4-digit OTP"); return; }
    if (attempts >= MAX_ATTEMPTS) { setError("Too many attempts. Please request a new OTP."); return; }

    setLoading(true);
    setError("");
    setResendMsg("");

    try {
      await verifyOTPApi(email, code);
      setVerified(true);
      // Redirect to login (or dashboard) after 2s
      setTimeout(() => navigate("/login", { state: { verified: true, email } }), 2000);
    } catch (err) {
      setAttempts((a) => a + 1);
      const msg =
        err?.detail || err?.message ||
        err?.otp?.[0] || err?.non_field_errors?.[0] ||
        Object.values(err || {}).flat()[0] ||
        "Invalid OTP. Please try again.";
      setError(msg);
      setOtp("");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError("");
    setResendMsg("");
    setOtp("");
    try {
      await resendOTPApi(email);
      setResendMsg("✅ A new OTP has been sent to your email.");
      setAttempts(0);
    } catch (err) {
      const msg = err?.detail || err?.message || "Failed to resend OTP. Try again.";
      setError(msg);
    } finally {
      setResending(false);
    }
  }

  // ── VERIFIED STATE ────────────────────────────────────────────────────────
  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)", fontFamily: "'DM Sans', sans-serif" }}>
        <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-4xl animate-bounce">
              ✅
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Email Verified!
          </h2>
          <p className="text-slate-500 text-sm mb-1">Your account is now active.</p>
          <p className="text-slate-400 text-xs">Redirecting to login...</p>
          <div className="mt-6 h-1 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-emerald-500 animate-[grow_2s_linear_forwards] rounded-full"
              style={{ animation: "grow 2s linear forwards" }} />
          </div>
        </div>
        <style>{`@keyframes grow { from { width: 0% } to { width: 100% } }`}</style>
      </div>
    );
  }

  // ── MAIN UI ───────────────────────────────────────────────────────────────
  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.min(b.length, 4)) + c)
    : "your email";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full opacity-20"
          style={{ width: 380, height: 380, top: -80, right: -80, background: "radial-gradient(circle, #6366f1, transparent)" }} />
        <div className="absolute rounded-full opacity-10"
          style={{ width: 280, height: 280, bottom: -40, left: -40, background: "radial-gradient(circle, #ec4899, transparent)" }} />
      </div>

      <div className="relative w-full max-w-sm z-10">
        {/* Brand */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>S</div>
          <span className="text-white text-xl font-bold tracking-tight">ShopNest</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl"
            style={{ background: "linear-gradient(135deg, #eef2ff, #e0e7ff)" }}>
            📧
          </div>

          <h1 className="text-2xl font-bold text-slate-800 text-center mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Verify Your Email
          </h1>
          <p className="text-slate-500 text-sm text-center leading-relaxed">
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-indigo-600">{maskedEmail}</span>
          </p>

          {/* OTP Input */}
          <OTPInput
            length={4}
            value={otp}
            onChange={(v) => { setOtp(v); setError(""); }}
            disabled={loading}
            hasError={!!error}
          />

          {/* Attempt indicator */}
          {attempts > 0 && attempts < MAX_ATTEMPTS && (
            <p className="text-center text-xs text-amber-600 font-medium mb-3">
              ⚠ {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts !== 1 ? "s" : ""} remaining
            </p>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl px-4 py-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 text-center">
              {error}
            </div>
          )}

          {/* Resend success */}
          {resendMsg && !error && (
            <div className="rounded-xl px-4 py-3 mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 text-center">
              {resendMsg}
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={() => handleVerify()}
            disabled={loading || otp.length < 6}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="40 20" />
                </svg>
                Verifying...
              </>
            ) : (
              "Verify Email →"
            )}
          </button>

          {/* Resend */}
          <ResendTimer onResend={handleResend} resending={resending} />

          {/* Change email */}
          <div className="text-center mt-5 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Wrong email?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-indigo-500 font-semibold hover:underline"
              >
                Go back to register
              </button>
            </p>
          </div>
        </div>

        {/* Security note */}
        <p className="text-center text-xs text-slate-600 mt-5">
          🔒 OTP is valid for <span className="text-slate-400 font-medium">10 minutes</span>
        </p>
      </div>

      <style>{`
        .shake { animation: shake 0.4s ease; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}