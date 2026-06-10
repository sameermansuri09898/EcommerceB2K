import { useEffect, useState } from "react";
import {
  createAddress,
  updateAddress,
} from "../services/addressService";
import {
  MapPin, User, Phone, Home, Briefcase, MoreHorizontal,
  Star, X, CheckCircle2, AlertCircle, Loader2
} from "lucide-react";

// ── Toast ─────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium min-w-[240px] max-w-xs
        ${type === "success" ? "bg-slate-900 text-white" : "bg-red-600 text-white"}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {type === "success"
        ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
        : <AlertCircle size={16} className="shrink-0" />
      }
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">
        <X size={13} />
      </button>
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────
function Field({ label, required, icon: Icon, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">
        {Icon && <Icon size={11} className="text-slate-400" />}
        {label}
        {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-rose-500 flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

// ── Input styles ──────────────────────────────────────────────
const inputCls = (error) =>
  `w-full px-4 py-3 rounded-xl border text-sm text-slate-900 bg-white outline-none transition-all duration-200
   placeholder:text-slate-300 focus:ring-2
   ${error
    ? "border-rose-300 focus:ring-rose-100 focus:border-rose-400"
    : "border-slate-200 focus:ring-slate-100 focus:border-slate-400"
   }`;

// ── Main Component ────────────────────────────────────────────
export default function AddressForm({ onSuccess, onClose, initialData = null }) {
  const isEdit = !!initialData?.id;

  const [formData, setFormData] = useState({
    full_name: "",
    mobile_number: "",
    address_line: "",
    landmark: "",
    opposite_of: "",
    city: "",
    state: "",
    zip_code: "",
    address_type: "home",
    is_default: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.full_name.trim()) e.full_name = "Full name is required";
    if (!formData.mobile_number.trim()) e.mobile_number = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobile_number.replace(/\s/g, "")))
      e.mobile_number = "Enter a valid 10-digit number";
    if (!formData.address_line.trim()) e.address_line = "Address is required";
    if (!formData.city.trim()) e.city = "City is required";
    if (!formData.state.trim()) e.state = "State is required";
    if (!formData.zip_code.trim()) e.zip_code = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.zip_code)) e.zip_code = "Enter a valid 6-digit pincode";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      setLoading(true);
      if (isEdit) {
        await updateAddress(initialData.id, formData);
        setToast({ message: "Address updated successfully", type: "success" });
      } else {
        await createAddress(formData);
        setToast({ message: "Address saved successfully", type: "success" });
      }
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 800);
    } catch (err) {
      console.error(err);
      setToast({ message: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const addressTypes = [
    { value: "home", label: "Home", icon: Home },
    { value: "work", label: "Work", icon: Briefcase },
    { value: "other", label: "Other", icon: MoreHorizontal },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* ── Header ── */}
        <div className="relative bg-slate-900 px-7 pt-8 pb-7">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                <MapPin size={18} className="text-white" />
              </div>
              <div>
                <h2
                  className="text-xl font-extrabold text-white leading-tight"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {isEdit ? "Update Address" : "Add New Address"}
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  {isEdit ? "Edit your delivery details" : "Where should we deliver?"}
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:bg-white/20 transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* ── Form ── */}
        <div className="px-7 py-7 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Name + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" required icon={User} error={errors.full_name}>
                <input
                  name="full_name"
                  placeholder="Rahul Sharma"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={inputCls(errors.full_name)}
                />
              </Field>
              <Field label="Mobile Number" required icon={Phone} error={errors.mobile_number}>
                <input
                  name="mobile_number"
                  placeholder="9876543210"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  maxLength={10}
                  className={inputCls(errors.mobile_number)}
                />
              </Field>
            </div>

            {/* Address */}
            <Field label="Address" required icon={MapPin} error={errors.address_line}>
              <textarea
                name="address_line"
                placeholder="House no., Street, Area…"
                value={formData.address_line}
                onChange={handleChange}
                rows={3}
                className={`${inputCls(errors.address_line)} resize-none`}
              />
            </Field>

            {/* Landmark + Opposite */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Landmark">
                <input
                  name="landmark"
                  placeholder="Near metro station"
                  value={formData.landmark}
                  onChange={handleChange}
                  className={inputCls(false)}
                />
              </Field>
              <Field label="Opposite Of">
                <input
                  name="opposite_of"
                  placeholder="Opposite City Mall"
                  value={formData.opposite_of}
                  onChange={handleChange}
                  className={inputCls(false)}
                />
              </Field>
            </div>

            {/* City + State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="City" required error={errors.city}>
                <input
                  name="city"
                  placeholder="Mumbai"
                  value={formData.city}
                  onChange={handleChange}
                  className={inputCls(errors.city)}
                />
              </Field>
              <Field label="State" required error={errors.state}>
                <input
                  name="state"
                  placeholder="Maharashtra"
                  value={formData.state}
                  onChange={handleChange}
                  className={inputCls(errors.state)}
                />
              </Field>
            </div>

            {/* Pincode */}
            <Field label="Pincode" required error={errors.zip_code}>
              <input
                name="zip_code"
                placeholder="400001"
                value={formData.zip_code}
                onChange={handleChange}
                maxLength={6}
                className={`${inputCls(errors.zip_code)} w-full sm:w-1/2`}
              />
            </Field>

            {/* Address Type */}
            <Field label="Address Type">
              <div className="flex gap-2 flex-wrap">
                {addressTypes.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, address_type: value }))}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200
                      ${formData.address_type === value
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                      }`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
            </Field>

            {/* Default toggle */}
            <label className="flex items-center gap-3 cursor-pointer group select-none">
              <div
                onClick={() => setFormData((p) => ({ ...p, is_default: !p.is_default }))}
                className={`relative w-10 h-6 rounded-full transition-colors duration-200 shrink-0
                  ${formData.is_default ? "bg-slate-900" : "bg-slate-200"}`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                    ${formData.is_default ? "translate-x-4" : "translate-x-0"}`}
                />
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                  className="sr-only"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <Star size={13} className={formData.is_default ? "text-amber-400" : "text-slate-300"} />
                  Set as default address
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Used automatically at checkout</p>
              </div>
            </label>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-2xl text-sm font-bold
                  hover:bg-slate-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <MapPin size={15} />
                    {isEdit ? "Update Address" : "Save Address"}
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}