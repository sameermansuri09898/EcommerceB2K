import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─── API CONFIG ────────────────────────────────────────────────────────────────
const API_BASE = "http://127.0.0.1:8000/api";

async function createSellerProfileApi(formData, token) {
  const res = await fetch(`${API_BASE}/selleraccount/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli",
  "Daman and Diu","Delhi","Lakshadweep","Puducherry","Ladakh","Jammu & Kashmir",
];

const BANKS = [
  "State Bank of India","HDFC Bank","ICICI Bank","Axis Bank",
  "Punjab National Bank","Bank of Baroda","Canara Bank","Kotak Mahindra Bank",
  "Yes Bank","IndusInd Bank","Union Bank of India","Bank of India",
  "Central Bank of India","Indian Bank","UCO Bank","Other",
];

// ─── AUTH GUARD ────────────────────────────────────────────────────────────────
// Login API response:
// { message, role, access_token, refresh_token }
// We save: localStorage.setItem("access", data.access_token)
//          localStorage.setItem("role", data.role)
function useAuthGuard() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access");
    const role = localStorage.getItem("role");

    if (!token) {
      setAuthError("not_logged_in");
      setAuthChecked(true);
      return;
    }

    // role is saved as plain string: "seller"
    if (!role || role.toLowerCase() !== "seller") {
      setAuthError("not_seller");
    }

    setAuthChecked(true);
  }, []);

  return { authChecked, authError };
}

// ─── STEP INDICATOR ────────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  const steps = [
    { label: "Shop Details" },
    { label: "Bank & Payment" },
    { label: "KYC & Docs" },
  ];

  return (
    <div className="flex items-center justify-center mb-8 px-2">
      {steps.map((s, i) => {
        const idx = i + 1;
        const isDone = idx < current;
        const isActive = idx === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                  ${isDone
                    ? "bg-green-500 text-white shadow-md"
                    : isActive
                    ? "bg-orange-500 text-white shadow-lg scale-110"
                    : "bg-white/10 text-gray-500 border border-white/10"}`}
              >
                {isDone ? "✓" : idx}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium whitespace-nowrap
                  ${isActive ? "text-orange-400" : isDone ? "text-green-400" : "text-gray-600"}`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 w-12 sm:w-20 mx-2 mb-4 rounded-full transition-all duration-500
                  ${isDone ? "bg-green-400" : "bg-white/10"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── FIELD WRAPPER ─────────────────────────────────────────────────────────────
function Field({ label, required, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          {label} {required && <span className="text-orange-400">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <span className="text-xs text-gray-600">{hint}</span>}
      {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
    </div>
  );
}

// ─── INPUT ─────────────────────────────────────────────────────────────────────
function Input({ error, className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all outline-none text-white placeholder-gray-600
        ${error
          ? "border-red-500/50 bg-red-900/20 focus:ring-2 focus:ring-red-500/20"
          : "border-white/10 bg-white/5 focus:border-orange-500/60 focus:bg-white/8 focus:ring-2 focus:ring-orange-500/10"}
        disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    />
  );
}

function Select({ error, className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all outline-none appearance-none cursor-pointer
        text-white bg-no-repeat pr-8
        ${error
          ? "border-red-500/50 bg-[#1e293b]"
          : "border-white/10 bg-[#1e293b] focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10"}
        disabled:opacity-50 ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundPosition: "right 12px center",
      }}
    >
      {children}
    </select>
  );
}

function Textarea({ error, ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all outline-none resize-none text-white placeholder-gray-600
        ${error
          ? "border-red-500/50 bg-red-900/20"
          : "border-white/10 bg-white/5 focus:border-orange-500/60 focus:bg-white/8 focus:ring-2 focus:ring-orange-500/10"}`}
    />
  );
}

// ─── FILE UPLOAD ───────────────────────────────────────────────────────────────
function FileUpload({ label, hint, file, onChange, required, error }) {
  const ref = useRef();
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
        {label} {required && <span className="text-orange-400">*</span>}
      </label>
      <div
        onClick={() => ref.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all
          ${file
            ? "border-green-500/40 bg-green-900/20"
            : error
            ? "border-red-500/40 bg-red-900/10"
            : "border-white/10 bg-white/5 hover:border-orange-500/40 hover:bg-orange-500/5"}`}
      >
        <input
          ref={ref}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
          onChange={(e) => onChange(e.target.files[0] || null)}
        />
        {file ? (
          <div className="flex flex-col items-center gap-1">
            <span className="text-green-400 text-2xl">✅</span>
            <span className="text-xs font-medium text-green-400 truncate max-w-full px-2">{file.name}</span>
            <span className="text-xs text-green-600">({(file.size / 1024).toFixed(0)} KB)</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-2xl text-gray-600">📄</span>
            <span className="text-xs font-medium text-gray-400">Click to upload</span>
            <span className="text-xs text-gray-600">{hint || "JPG, PNG or PDF · Max 5 MB"}</span>
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
    </div>
  );
}

// ─── INFO BOX ──────────────────────────────────────────────────────────────────
function InfoBox({ icon, children }) {
  return (
    <div className="flex items-start gap-3 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3 mb-6 text-sm text-orange-300">
      <span className="text-base mt-0.5 shrink-0">{icon || "ℹ️"}</span>
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}

// ─── SECTION CARD ──────────────────────────────────────────────────────────────
function SectionCard({ icon, title, subtitle, children }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-5">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl bg-white/5 border border-white/10">
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          {subtitle && <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── STEP 1: SHOP DETAILS ──────────────────────────────────────────────────────
function ShopDetailsStep({ data, onChange, errors }) {
  return (
    <div>
      <InfoBox icon="🏪">
        Fill in your shop details exactly as you want them to appear to customers. Your shop name must be unique and professional.
      </InfoBox>

      <SectionCard icon="🛍️" title="Shop Information" subtitle="Basic details visible to customers">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Shop Name" required error={errors.shop_name} hint={`${data.shop_name.length}/100 characters`}>
              <Input
                value={data.shop_name}
                onChange={(e) => onChange("shop_name", e.target.value.slice(0, 100))}
                placeholder="e.g. Priya's Boutique"
                error={errors.shop_name}
              />
            </Field>
          </div>

          <Field label="Shop Phone" required error={errors.shop_phone} hint="For order & customer notifications">
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-white/10 bg-white/5 text-gray-400 text-sm shrink-0">
                🇮🇳 +91
              </span>
              <Input
                value={data.shop_phone}
                onChange={(e) => onChange("shop_phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                error={errors.shop_phone}
                className="rounded-l-none"
              />
            </div>
          </Field>

          <Field label="Shop Email" required error={errors.shop_email} hint="Visible on your seller profile">
            <Input
              type="email"
              value={data.shop_email}
              onChange={(e) => onChange("shop_email", e.target.value)}
              placeholder="shop@example.com"
              error={errors.shop_email}
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Shop Description" hint={`${data.shop_description.length}/500 characters — Optional`}>
              <Textarea
                value={data.shop_description}
                onChange={(e) => onChange("shop_description", e.target.value.slice(0, 500))}
                placeholder="Tell customers what you sell and what makes your shop special..."
                rows={3}
              />
            </Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon="📍" title="Pickup & Return Address" subtitle="Where orders will be collected from">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Street Address" required error={errors.address}>
              <Input
                value={data.address}
                onChange={(e) => onChange("address", e.target.value)}
                placeholder="House / flat no., street, area, landmark"
                error={errors.address}
              />
            </Field>
          </div>
          <Field label="City" required error={errors.shop_city}>
            <Input
              value={data.shop_city}
              onChange={(e) => onChange("shop_city", e.target.value)}
              placeholder="e.g. Mumbai"
              error={errors.shop_city}
            />
          </Field>
          <Field label="State" required error={errors.shop_state}>
            <Select
              value={data.shop_state}
              onChange={(e) => onChange("shop_state", e.target.value)}
              error={errors.shop_state}
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="PIN Code" required error={errors.shop_zip_code}>
            <Input
              value={data.shop_zip_code}
              onChange={(e) => onChange("shop_zip_code", e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit PIN code"
              error={errors.shop_zip_code}
            />
          </Field>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── STEP 2: BANK DETAILS ──────────────────────────────────────────────────────
function BankDetailsStep({ data, onChange, errors }) {
  return (
    <div>
      <InfoBox icon="🔒">
        Your bank details are encrypted and used only to transfer your earnings. Payouts are processed every 7 working days.
      </InfoBox>

      <SectionCard icon="🏦" title="Bank Account Details" subtitle="Must match your KYC documents">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field
              label="Account Holder Name"
              required
              error={errors.bank_account_holder_name}
              hint="Exactly as printed on your PAN card and bank passbook"
            >
              <Input
                value={data.bank_account_holder_name}
                onChange={(e) => onChange("bank_account_holder_name", e.target.value)}
                placeholder="Full name as on bank records"
                error={errors.bank_account_holder_name}
              />
            </Field>
          </div>

          <Field label="Account Number" required error={errors.bank_account_number}>
            <Input
              type="password"
              value={data.bank_account_number}
              onChange={(e) => onChange("bank_account_number", e.target.value.replace(/\D/g, "").slice(0, 20))}
              placeholder="Enter account number"
              error={errors.bank_account_number}
              autoComplete="off"
            />
          </Field>

          <Field label="Confirm Account Number" required error={errors.bank_account_number_confirm} hint="Re-enter to verify">
            <Input
              value={data.bank_account_number_confirm}
              onChange={(e) => onChange("bank_account_number_confirm", e.target.value.replace(/\D/g, "").slice(0, 20))}
              placeholder="Re-enter account number"
              error={errors.bank_account_number_confirm}
              autoComplete="off"
            />
          </Field>

          <Field label="IFSC Code" required error={errors.bank_ifsc_code} hint="11-character code on your cheque leaf">
            <Input
              value={data.bank_ifsc_code}
              onChange={(e) => onChange("bank_ifsc_code", e.target.value.toUpperCase().slice(0, 11))}
              placeholder="e.g. SBIN0001234"
              error={errors.bank_ifsc_code}
            />
          </Field>

          <Field label="Bank Name" required error={errors.bank_name}>
            <Select
              value={data.bank_name}
              onChange={(e) => onChange("bank_name", e.target.value)}
              error={errors.bank_name}
            >
              <option value="">Select bank</option>
              {BANKS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </Select>
          </Field>

          <div className="sm:col-span-2">
            <Field label="Branch Name" required error={errors.bank_branch} hint="City / area of your branch">
              <Input
                value={data.bank_branch}
                onChange={(e) => onChange("bank_branch", e.target.value)}
                placeholder="e.g. Connaught Place, New Delhi"
                error={errors.bank_branch}
              />
            </Field>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── STEP 3: KYC ──────────────────────────────────────────────────────────────
function KycStep({ data, onChange, errors }) {
  return (
    <div>
      <InfoBox icon="🛡️">
        KYC is required by law for all sellers in India. Documents are reviewed within 24 hours and stored securely.
      </InfoBox>

      <SectionCard icon="🪪" title="Identity & Tax Numbers" subtitle="As per Government of India requirements">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="PAN Number" required error={errors.pan_number} hint="10-character · e.g. ABCDE1234F">
            <Input
              value={data.pan_number}
              onChange={(e) => onChange("pan_number", e.target.value.toUpperCase().slice(0, 10))}
              placeholder="ABCDE1234F"
              error={errors.pan_number}
            />
          </Field>

          <Field label="GST Number" required error={errors.gst_number} hint="15-character GSTIN · e.g. 22ABCDE1234F1Z5">
            <Input
              value={data.gst_number}
              onChange={(e) => onChange("gst_number", e.target.value.toUpperCase().slice(0, 15))}
              placeholder="22ABCDE1234F1Z5"
              error={errors.gst_number}
            />
          </Field>

          <Field label="Aadhaar Number" required error={errors.aadhaar_number} hint="12-digit UID number">
            <Input
              value={data.aadhaar_number}
              onChange={(e) => onChange("aadhaar_number", e.target.value.replace(/\D/g, "").slice(0, 12))}
              placeholder="xxxx xxxx xxxx"
              error={errors.aadhaar_number}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard icon="📁" title="Document Upload" subtitle="JPG, PNG or PDF · Max 5 MB each">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FileUpload
            label="PAN Card"
            required
            hint="Front side of PAN card"
            file={data.pan_document}
            onChange={(f) => onChange("pan_document", f)}
            error={errors.pan_document}
          />
          <FileUpload
            label="Aadhaar Card"
            required
            hint="Front & back (combined PDF/image)"
            file={data.aadhaar_document}
            onChange={(f) => onChange("aadhaar_document", f)}
            error={errors.aadhaar_document}
          />
          <FileUpload
            label="GST Certificate"
            required
            hint="Registration certificate from GST portal"
            file={data.gst_document}
            onChange={(f) => onChange("gst_document", f)}
            error={errors.gst_document}
          />
          <FileUpload
            label="Bank Passbook / Cancelled Cheque"
            hint="First page or cancelled cheque (optional)"
            file={data.bank_document}
            onChange={(f) => onChange("bank_document", f)}
            error={errors.bank_document}
          />
        </div>
      </SectionCard>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.agreed}
            onChange={(e) => onChange("agreed", e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-orange-500 shrink-0"
          />
          <span className="text-sm text-gray-400 leading-relaxed">
            I confirm all information provided is accurate and complete. I agree to ShopNest's{" "}
            <span className="text-orange-400 font-medium cursor-pointer hover:underline">Terms of Service</span>{" "}
            and{" "}
            <span className="text-orange-400 font-medium cursor-pointer hover:underline">Privacy Policy</span>.
            I understand that false information may result in permanent account suspension.
          </span>
        </label>
        {errors.agreed && (
          <p className="text-xs text-red-400 font-medium mt-2 ml-7">{errors.agreed}</p>
        )}
      </div>
    </div>
  );
}

// ─── SUCCESS SCREEN ────────────────────────────────────────────────────────────
function SuccessScreen() {
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}
    >
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6 animate-bounce">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Profile Submitted!</h2>
        <p className="text-gray-400 text-sm mb-1">Your seller profile is under review.</p>
        <p className="text-gray-500 text-xs mb-8">Our team will verify your documents within 24 hours.</p>

        <div className="bg-white/5 rounded-xl p-4 text-left mb-6 space-y-3 border border-white/10">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">What happens next?</p>
          {[
            { icon: "📄", step: "Document review", time: "Within 24 hours" },
            { icon: "🏦", step: "Bank account verification", time: "1–2 business days" },
            { icon: "✅", step: "Account activation email", time: "After verification" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <div>
                <p className="text-sm font-medium text-white">{item.step}</p>
                <p className="text-xs text-gray-500">{item.time}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full py-3 rounded-xl text-sm font-bold text-black bg-orange-500 hover:bg-orange-400 active:scale-95 transition-all"
        >
          Go to Dashboard →
        </button>
      </div>
    </div>
  );
}

// ─── ACCESS DENIED SCREEN ──────────────────────────────────────────────────────
function AccessDenied({ reason }) {
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}
    >
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-10 max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
          <span className="text-3xl">🔒</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          {reason === "not_logged_in"
            ? "You must be logged in to access this page."
            : "Only accounts with the Seller role can set up a seller profile. Please contact support if this is an error."}
        </p>
        <button
          onClick={() => navigate(reason === "not_logged_in" ? "/login" : "/")}
          className="w-full py-3 rounded-xl text-sm font-bold text-black bg-orange-500 hover:bg-orange-400 transition-all"
        >
          {reason === "not_logged_in" ? "Go to Login" : "Back to Home"}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SellerProfileSetup() {
  const navigate = useNavigate();
  const { authChecked, authError } = useAuthGuard();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    // Step 1 — aligned with Django model
    shop_name: "",
    shop_description: "",
    shop_phone: "",
    shop_email: "",
    address: "",
    shop_city: "",
    shop_state: "",
    shop_zip_code: "",
    // Step 2 — aligned with Django model
    bank_account_holder_name: "",
    bank_account_number: "",
    bank_account_number_confirm: "", // client-side only, NOT sent to API
    bank_ifsc_code: "",
    bank_name: "",
    bank_branch: "",
    // Step 3 — aligned with Django model
    pan_number: "",
    gst_number: "",
    aadhaar_number: "",
    pan_document: null,
    aadhaar_document: null,
    gst_document: null,
    bank_document: null,
    agreed: false,
  });

  const handleChange = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setApiError("");
  }, []);

  function validateStep1() {
    const e = {};
    if (!formData.shop_name.trim()) e.shop_name = "Shop name is required";
    if (!formData.shop_phone || formData.shop_phone.length !== 10)
      e.shop_phone = "Enter a valid 10-digit phone number";
    if (!formData.shop_email.trim()) e.shop_email = "Shop email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.shop_email))
      e.shop_email = "Enter a valid email address";
    if (!formData.address.trim()) e.address = "Address is required";
    if (!formData.shop_city.trim()) e.shop_city = "City is required";
    if (!formData.shop_state) e.shop_state = "Please select a state";
    if (!formData.shop_zip_code || formData.shop_zip_code.length !== 6)
      e.shop_zip_code = "Enter a valid 6-digit PIN code";
    return e;
  }

  function validateStep2() {
    const e = {};
    if (!formData.bank_account_holder_name.trim())
      e.bank_account_holder_name = "Account holder name is required";
    if (!formData.bank_account_number)
      e.bank_account_number = "Account number is required";
    if (formData.bank_account_number !== formData.bank_account_number_confirm)
      e.bank_account_number_confirm = "Account numbers do not match";
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!formData.bank_ifsc_code)
      e.bank_ifsc_code = "IFSC code is required";
    else if (!ifscRegex.test(formData.bank_ifsc_code))
      e.bank_ifsc_code = "Invalid IFSC format (e.g. SBIN0001234)";
    if (!formData.bank_name) e.bank_name = "Please select your bank";
    if (!formData.bank_branch.trim()) e.bank_branch = "Branch name is required";
    return e;
  }

  function validateStep3() {
    const e = {};
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (!formData.pan_number) e.pan_number = "PAN number is required";
    else if (!panRegex.test(formData.pan_number))
      e.pan_number = "Invalid PAN format (e.g. ABCDE1234F)";
    if (!formData.gst_number) e.gst_number = "GST number is required";
    else if (formData.gst_number.length !== 15) e.gst_number = "GSTIN must be 15 characters";
    if (!formData.aadhaar_number) e.aadhaar_number = "Aadhaar number is required";
    else if (formData.aadhaar_number.length !== 12)
      e.aadhaar_number = "Aadhaar must be 12 digits";
    if (!formData.pan_document) e.pan_document = "PAN card document is required";
    if (!formData.aadhaar_document) e.aadhaar_document = "Aadhaar card document is required";
    if (!formData.gst_document) e.gst_document = "GST certificate is required";
    if (!formData.agreed) e.agreed = "You must agree to the terms to continue";
    return e;
  }

  function handleNext() {
    const validationMap = { 1: validateStep1, 2: validateStep2 };
    const errs = validationMap[step]?.() || {};
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    setErrors({});
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    const errs = validateStep3();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError("");

    try {
      const payload = new FormData();

      // Text fields — exactly matching Django model field names
      const textFields = [
        "shop_name", "shop_description", "shop_phone", "shop_email",
        "address", "shop_city", "shop_state", "shop_zip_code",
        "bank_account_holder_name", "bank_account_number", // confirm excluded
        "bank_ifsc_code", "bank_name", "bank_branch",
        "pan_number", "gst_number", "aadhaar_number",
      ];
      textFields.forEach((k) => payload.append(k, formData[k]));

      // File fields — matching Django ImageField names
      if (formData.pan_document) payload.append("pan_document", formData.pan_document);
      if (formData.aadhaar_document) payload.append("aadhaar_document", formData.aadhaar_document);
      if (formData.gst_document) payload.append("gst_document", formData.gst_document);
      if (formData.bank_document) payload.append("bank_document", formData.bank_document);

      // Token from localStorage — saved as "access" by login page
      const token = localStorage.getItem("access");
      await createSellerProfileApi(payload, token);
      setSubmitted(true);
    } catch (err) {
      const msg =
        err?.detail ||
        err?.message ||
        err?.non_field_errors?.[0] ||
        Object.values(err || {}).flat()[0] ||
        "Something went wrong. Please try again.";
      setApiError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  }

  // ── RENDER GUARDS ─────────────────────────────────────────────────────────────
  if (!authChecked) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-orange-500" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" />
          </svg>
          <span className="text-gray-500 text-sm">Checking access…</span>
        </div>
      </div>
    );
  }

  if (authError) return <AccessDenied reason={authError} />;
  if (submitted) return <SuccessScreen />;

  const progressPercent = ((step - 1) / 3) * 100 + 16;

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}
    >
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full opacity-10" style={{ width: 450, height: 450, top: -120, right: -120, background: "radial-gradient(circle, #f97316, transparent)" }} />
        <div className="absolute rounded-full opacity-10" style={{ width: 300, height: 300, bottom: -60, left: -60, background: "radial-gradient(circle, #6366f1, transparent)" }} />
      </div>

      <div className="relative max-w-2xl mx-auto z-10">
        {/* Brand */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-black text-lg shadow-lg shadow-orange-500/30">S</div>
          <span className="text-white text-xl font-bold tracking-tight">
            ShopNest <span className="text-gray-500 font-normal text-sm">Seller Central</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <StepIndicator current={step} />

        {/* API Error */}
        {apiError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5 text-sm text-red-400 flex items-center gap-2">
            <span>⚠️</span> {apiError}
          </div>
        )}

        {/* Steps */}
        {step === 1 && <ShopDetailsStep data={formData} onChange={handleChange} errors={errors} />}
        {step === 2 && <BankDetailsStep data={formData} onChange={handleChange} errors={errors} />}
        {step === 3 && <KycStep data={formData} onChange={handleChange} errors={errors} />}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-2 mb-10">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white border border-white/20 hover:bg-white/10 transition-all"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-7 py-2.5 rounded-xl text-sm font-bold text-black bg-orange-500 hover:bg-orange-400 active:scale-95 transition-all shadow-lg shadow-orange-500/20"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-7 py-2.5 rounded-xl text-sm font-bold text-black bg-orange-500 hover:bg-orange-400 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-orange-500/20"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="3" strokeDasharray="40 20" />
                  </svg>
                  Submitting…
                </>
              ) : (
                "🛡️ Submit for Verification"
              )}
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-600 pb-6">
          🔒 Your data is encrypted with 256-bit SSL. ShopNest never shares your information with third parties.
        </p>
      </div>
    </div>
  );
}