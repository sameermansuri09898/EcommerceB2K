import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ─── API CONFIG ────────────────────────────────────────────────────────────────
const API_BASE = "http://127.0.0.1:8000/api";

async function createSellerProfileApi(formData, token) {
  const res = await fetch(`${API_BASE}/selleraccount/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData, // multipart/form-data for file uploads
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

const SHOP_CATEGORIES = [
  "Fashion & Clothing","Electronics & Gadgets","Home & Kitchen",
  "Beauty & Personal Care","Books & Stationery","Sports & Fitness",
  "Toys & Games","Jewellery & Accessories","Health & Wellness",
  "Food & Grocery","Automotive","Art & Crafts","Other",
];

const BANKS = [
  "State Bank of India","HDFC Bank","ICICI Bank","Axis Bank",
  "Punjab National Bank","Bank of Baroda","Canara Bank","Kotak Mahindra Bank",
  "Yes Bank","IndusInd Bank","Union Bank of India","Bank of India",
  "Central Bank of India","Indian Bank","UCO Bank","Other",
];

// ─── STEP INDICATOR ────────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  const steps = [
    { label: "Shop Details", icon: "🏪" },
    { label: "Bank & Payment", icon: "🏦" },
    { label: "KYC & Documents", icon: "🪪" },
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
                  ${isDone ? "bg-green-500 text-white shadow-md" :
                    isActive ? "bg-orange-500 text-white shadow-lg scale-110" :
                    "bg-gray-100 text-gray-400 border-2 border-gray-200"}`}
              >
                {isDone ? "✓" : idx}
              </div>
              <span className={`text-xs mt-1.5 font-medium whitespace-nowrap
                ${isActive ? "text-orange-600" : isDone ? "text-green-600" : "text-gray-400"}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-16 sm:w-24 mx-1 mb-4 transition-all duration-500
                ${isDone ? "bg-green-400" : "bg-gray-200"}`} />
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
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <span className="text-xs text-gray-400">{hint}</span>}
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
}

// ─── INPUT ─────────────────────────────────────────────────────────────────────
function Input({ error, className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 text-sm rounded-lg border transition-all outline-none
        ${error
          ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100"
          : "border-gray-200 bg-gray-50 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"}
        disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    />
  );
}

function Select({ error, className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2.5 text-sm rounded-lg border transition-all outline-none appearance-none
        bg-no-repeat bg-right pr-8 cursor-pointer
        ${error
          ? "border-red-400 bg-red-50"
          : "border-gray-200 bg-gray-50 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"}
        disabled:opacity-50 ${className}`}
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: "right 10px center" }}
    >
      {children}
    </select>
  );
}

function Textarea({ error, ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2.5 text-sm rounded-lg border transition-all outline-none resize-none
        ${error
          ? "border-red-400 bg-red-50"
          : "border-gray-200 bg-gray-50 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"}`}
    />
  );
}

// ─── FILE UPLOAD ───────────────────────────────────────────────────────────────
function FileUpload({ label, hint, file, onChange, required, error }) {
  const ref = useRef();
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        onClick={() => ref.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all
          ${file
            ? "border-green-400 bg-green-50"
            : error
            ? "border-red-300 bg-red-50"
            : "border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50"}`}
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
            <span className="text-green-500 text-xl">✅</span>
            <span className="text-xs font-medium text-green-700 truncate max-w-full px-2">{file.name}</span>
            <span className="text-xs text-green-500">({(file.size / 1024).toFixed(0)} KB)</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl text-gray-300">📄</span>
            <span className="text-xs font-medium text-gray-500">Click to upload</span>
            <span className="text-xs text-gray-400">{hint || "JPG, PNG or PDF · Max 5 MB"}</span>
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
}

// ─── INFO BOX ──────────────────────────────────────────────────────────────────
function InfoBox({ icon, children }) {
  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800">
      <span className="text-base mt-0.5 shrink-0">{icon || "ℹ️"}</span>
      <span>{children}</span>
    </div>
  );
}

// ─── SECTION CARD ──────────────────────────────────────────────────────────────
function SectionCard({ icon, title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl bg-gray-50">{icon}</div>
        <div>
          <div className="text-sm font-semibold text-gray-800">{title}</div>
          {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
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
        Fill in your shop details as they will appear to customers. Make sure your shop name is unique and professional.
      </InfoBox>

      <SectionCard icon="🛍️" title="Shop information" subtitle="Basic details visible to customers">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Shop name" required error={errors.shop_name}
              hint={`${data.shop_name.length}/60 characters`}>
              <Input
                value={data.shop_name}
                onChange={(e) => onChange("shop_name", e.target.value.slice(0, 60))}
                placeholder="e.g. Priya's Boutique"
                error={errors.shop_name}
              />
            </Field>
          </div>

          <Field label="Shop category" required error={errors.shop_category}>
            <Select
              value={data.shop_category}
              onChange={(e) => onChange("shop_category", e.target.value)}
              error={errors.shop_category}
            >
              <option value="">Select category</option>
              {SHOP_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>

          <Field label="Shop phone" required error={errors.shop_phone} hint="For order & customer notifications">
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-100 text-gray-500 text-sm">🇮🇳 +91</span>
              <Input
                value={data.shop_phone}
                onChange={(e) => onChange("shop_phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                error={errors.shop_phone}
                className="rounded-l-none"
              />
            </div>
          </Field>

          <div className="sm:col-span-2">
            <Field label="Shop description" hint={`${data.shop_description.length}/300 characters — Optional but helps customers find you`}>
              <Textarea
                value={data.shop_description}
                onChange={(e) => onChange("shop_description", e.target.value.slice(0, 300))}
                placeholder="Tell customers what you sell and what makes your shop special..."
                rows={3}
              />
            </Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon="📍" title="Pickup & return address" subtitle="Where orders will be collected from">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Street address" required error={errors.address}>
              <Input
                value={data.address}
                onChange={(e) => onChange("address", e.target.value)}
                placeholder="House / flat no., street, area, landmark"
                error={errors.address}
              />
            </Field>
          </div>
          <Field label="City" required error={errors.city}>
            <Input
              value={data.city}
              onChange={(e) => onChange("city", e.target.value)}
              placeholder="e.g. Mumbai"
              error={errors.city}
            />
          </Field>
          <Field label="State" required error={errors.state}>
            <Select
              value={data.state}
              onChange={(e) => onChange("state", e.target.value)}
              error={errors.state}
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="PIN code" required error={errors.pin_code}>
            <Input
              value={data.pin_code}
              onChange={(e) => onChange("pin_code", e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit PIN code"
              error={errors.pin_code}
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

      <SectionCard icon="🏦" title="Bank account details" subtitle="Must match your KYC documents">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Account holder name" required error={errors.bank_account_holder_name}
              hint="Exactly as printed on your PAN card and bank passbook">
              <Input
                value={data.bank_account_holder_name}
                onChange={(e) => onChange("bank_account_holder_name", e.target.value)}
                placeholder="Full name as on bank records"
                error={errors.bank_account_holder_name}
              />
            </Field>
          </div>

          <Field label="Account number" required error={errors.bank_account_number}>
            <Input
              type="password"
              value={data.bank_account_number}
              onChange={(e) => onChange("bank_account_number", e.target.value.replace(/\D/g, "").slice(0, 18))}
              placeholder="Enter account number"
              error={errors.bank_account_number}
              autoComplete="off"
            />
          </Field>

          <Field label="Confirm account number" required error={errors.bank_account_number_confirm}
            hint="Re-enter to confirm">
            <Input
              value={data.bank_account_number_confirm}
              onChange={(e) => onChange("bank_account_number_confirm", e.target.value.replace(/\D/g, "").slice(0, 18))}
              placeholder="Re-enter account number"
              error={errors.bank_account_number_confirm}
              autoComplete="off"
            />
          </Field>

          <Field label="IFSC code" required error={errors.bank_ifsc_code}
            hint="11-character code printed on your cheque leaf">
            <Input
              value={data.bank_ifsc_code}
              onChange={(e) => onChange("bank_ifsc_code", e.target.value.toUpperCase().slice(0, 11))}
              placeholder="e.g. SBIN0001234"
              error={errors.bank_ifsc_code}
            />
          </Field>

          <Field label="Account type" required error={errors.bank_account_type}>
            <Select
              value={data.bank_account_type}
              onChange={(e) => onChange("bank_account_type", e.target.value)}
              error={errors.bank_account_type}
            >
              <option value="">Select type</option>
              <option value="savings">Savings</option>
              <option value="current">Current</option>
            </Select>
          </Field>

          <Field label="Bank name" required error={errors.bank_name}>
            <Select
              value={data.bank_name}
              onChange={(e) => onChange("bank_name", e.target.value)}
              error={errors.bank_name}
            >
              <option value="">Select bank</option>
              {BANKS.map((b) => <option key={b}>{b}</option>)}
            </Select>
          </Field>

          <Field label="Branch name" required error={errors.bank_branch}
            hint="City / area of your bank branch">
            <Input
              value={data.bank_branch}
              onChange={(e) => onChange("bank_branch", e.target.value)}
              placeholder="e.g. Connaught Place, New Delhi"
              error={errors.bank_branch}
            />
          </Field>
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
        KYC verification is required by law for all sellers in India. Documents are reviewed within 24 hours and stored securely.
      </InfoBox>

      <SectionCard icon="🪪" title="Identity & tax numbers" subtitle="As per Government of India requirements">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="PAN number" required error={errors.pan_number}
            hint="10-character alphanumeric · e.g. ABCDE1234F">
            <Input
              value={data.pan_number}
              onChange={(e) => onChange("pan_number", e.target.value.toUpperCase().slice(0, 10))}
              placeholder="ABCDE1234F"
              error={errors.pan_number}
            />
          </Field>

          <Field label="GST number" required error={errors.gst_number}
            hint="15-character GSTIN · e.g. 22ABCDE1234F1Z5">
            <Input
              value={data.gst_number}
              onChange={(e) => onChange("gst_number", e.target.value.toUpperCase().slice(0, 15))}
              placeholder="22ABCDE1234F1Z5"
              error={errors.gst_number}
            />
          </Field>

          <Field label="Aadhaar number" required error={errors.aadhaar_number}
            hint="12-digit UID number">
            <Input
              value={data.aadhaar_number}
              onChange={(e) => onChange("aadhaar_number", e.target.value.replace(/\D/g, "").slice(0, 12))}
              placeholder="xxxx xxxx xxxx"
              error={errors.aadhaar_number}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard icon="📁" title="Document upload" subtitle="JPG, PNG or PDF · Max 5 MB each">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FileUpload
            label="PAN card"
            required
            hint="Front side of PAN card"
            file={data.pan_document}
            onChange={(f) => onChange("pan_document", f)}
            error={errors.pan_document}
          />
          <FileUpload
            label="Aadhaar card"
            required
            hint="Front & back (combined PDF/image)"
            file={data.aadhaar_document}
            onChange={(f) => onChange("aadhaar_document", f)}
            error={errors.aadhaar_document}
          />
          <FileUpload
            label="GST certificate"
            required
            hint="Registration certificate from GST portal"
            file={data.gst_document}
            onChange={(f) => onChange("gst_document", f)}
            error={errors.gst_document}
          />
          <FileUpload
            label="Bank passbook / cancelled cheque"
            hint="First page or cancelled cheque leaf"
            file={data.bank_document}
            onChange={(f) => onChange("bank_document", f)}
            error={errors.bank_document}
          />
        </div>
      </SectionCard>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.agreed}
            onChange={(e) => onChange("agreed", e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-green-600 shrink-0"
          />
          <span className="text-sm text-gray-600 leading-relaxed">
            I confirm all information provided is accurate and complete. I agree to ShopNest's{" "}
            <span className="text-orange-500 font-medium cursor-pointer hover:underline">Terms of Service</span>{" "}
            and{" "}
            <span className="text-orange-500 font-medium cursor-pointer hover:underline">Privacy Policy</span>.
            I understand that false information may result in permanent account suspension.
          </span>
        </label>
        {errors.agreed && <p className="text-xs text-red-500 font-medium mt-2 ml-7">{errors.agreed}</p>}
      </div>
    </div>
  );
}

// ─── SUCCESS SCREEN ────────────────────────────────────────────────────────────
function SuccessScreen() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>
      <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-bounce">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Submitted!</h2>
        <p className="text-gray-500 text-sm mb-1">Your seller profile is under review.</p>
        <p className="text-gray-400 text-xs mb-6">Our team will verify your documents within 24 hours.</p>

        <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">What happens next?</p>
          {[
            { icon: "📄", step: "Document review", time: "Within 24 hours" },
            { icon: "🏦", step: "Bank account verification", time: "1–2 business days" },
            { icon: "✅", step: "Account activation email", time: "After verification" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-700">{item.step}</p>
                <p className="text-xs text-gray-400">{item.time}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full py-3 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
        >
          Go to Dashboard →
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SellerProfileSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    // Step 1 — Shop
    shop_name: "",
    shop_category: "",
    shop_phone: "",
    shop_description: "",
    address: "",
    city: "",
    state: "",
    pin_code: "",

    // Step 2 — Bank
    bank_account_holder_name: "",
    bank_account_number: "",
    bank_account_number_confirm: "",
    bank_ifsc_code: "",
    bank_name: "",
    bank_branch: "",
    bank_account_type: "",

    // Step 3 — KYC
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

  // ── VALIDATION PER STEP ──────────────────────────────────────────────────────
  function validateStep1() {
    const e = {};
    if (!formData.shop_name.trim()) e.shop_name = "Shop name is required";
    if (!formData.shop_category) e.shop_category = "Please select a category";
    if (!formData.shop_phone || formData.shop_phone.length !== 10)
      e.shop_phone = "Enter a valid 10-digit phone number";
    if (!formData.address.trim()) e.address = "Address is required";
    if (!formData.city.trim()) e.city = "City is required";
    if (!formData.state) e.state = "Please select a state";
    if (!formData.pin_code || formData.pin_code.length !== 6)
      e.pin_code = "Enter a valid 6-digit PIN code";
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
    if (!formData.bank_ifsc_code || formData.bank_ifsc_code.length !== 11)
      e.bank_ifsc_code = "IFSC code must be 11 characters";
    if (!formData.bank_name) e.bank_name = "Please select your bank";
    if (!formData.bank_branch.trim()) e.bank_branch = "Branch name is required";
    if (!formData.bank_account_type) e.bank_account_type = "Please select account type";
    return e;
  }

  function validateStep3() {
    const e = {};
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

    if (!formData.pan_number) e.pan_number = "PAN number is required";
    else if (!panRegex.test(formData.pan_number)) e.pan_number = "Invalid PAN format (e.g. ABCDE1234F)";

    if (!formData.gst_number) e.gst_number = "GST number is required";
    else if (formData.gst_number.length !== 15) e.gst_number = "GSTIN must be 15 characters";

    if (!formData.aadhaar_number) e.aadhaar_number = "Aadhaar number is required";
    else if (formData.aadhaar_number.length !== 12) e.aadhaar_number = "Aadhaar must be 12 digits";

    if (!formData.pan_document) e.pan_document = "PAN card document is required";
    if (!formData.aadhaar_document) e.aadhaar_document = "Aadhaar card document is required";
    if (!formData.gst_document) e.gst_document = "GST certificate is required";
    if (!formData.agreed) e.agreed = "You must agree to the terms to continue";
    return e;
  }

  function handleNext() {
    const validationMap = { 1: validateStep1, 2: validateStep2 };
    const errs = validationMap[step]?.() || {};
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
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
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      // Build multipart FormData for file uploads
      const payload = new FormData();
      const textFields = [
        "shop_name","shop_category","shop_phone","shop_description",
        "address","city","state","pin_code",
        "bank_account_holder_name","bank_account_number","bank_ifsc_code",
        "bank_name","bank_branch","bank_account_type",
        "pan_number","gst_number","aadhaar_number",
      ];
      textFields.forEach((k) => payload.append(k, formData[k]));

      if (formData.pan_document) payload.append("pan_document", formData.pan_document);
      if (formData.aadhaar_document) payload.append("aadhaar_document", formData.aadhaar_document);
      if (formData.gst_document) payload.append("gst_document", formData.gst_document);
      if (formData.bank_document) payload.append("bank_document", formData.bank_document);

      // Get auth token from localStorage (adjust to your auth method)
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
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) return <SuccessScreen />;

  const progressPercent = ((step - 1) / 3) * 100 + 16;

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}
    >
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full opacity-10"
          style={{ width: 400, height: 400, top: -100, right: -100, background: "radial-gradient(circle, #f97316, transparent)" }} />
        <div className="absolute rounded-full opacity-10"
          style={{ width: 300, height: 300, bottom: -60, left: -60, background: "radial-gradient(circle, #6366f1, transparent)" }} />
      </div>

      <div className="relative max-w-2xl mx-auto z-10">
        {/* Brand */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-black text-lg">S</div>
          <span className="text-white text-xl font-bold tracking-tight">
            ShopNest <span className="text-gray-400 font-normal text-sm">Seller Central</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step indicator */}
        <StepIndicator current={step} />

        {/* API Error */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-700 flex items-center gap-2">
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
              className="px-7 py-2.5 rounded-xl text-sm font-bold text-black bg-orange-500 hover:bg-orange-400 active:scale-95 transition-all flex items-center gap-2"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-7 py-2.5 rounded-xl text-sm font-bold text-black bg-orange-500 hover:bg-orange-400 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="3" strokeDasharray="40 20" />
                  </svg>
                  Submitting...
                </>
              ) : (
                "🛡️ Submit for Verification"
              )}
            </button>
          )}
        </div>

        {/* Security note */}
        <p className="text-center text-xs text-gray-500 pb-6">
          🔒 Your data is encrypted with 256-bit SSL. ShopNest never shares your information with third parties.
        </p>
      </div>
    </div>
  );
}