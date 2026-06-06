import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Package, Palette, CheckCircle, AlertCircle,
  Plus, Trash2, ChevronRight, ChevronLeft,
  Tag, Layers, ShieldX, Loader2, X,
  Sparkles, Image as ImageIcon, LayoutGrid,
} from "lucide-react";

const API = "http://127.0.0.1:8000/api";

/* ─────────────────── TOKEN UTILS ─────────────────── */
function getToken() {
  const token = localStorage.getItem("access");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      return null;
    }
    return token;
  } catch { return null; }
}

function authHeaders() {
  const t = getToken();
  return { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

function getUserRole() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || payload.user_role || null;
  } catch { return null; }
}

/* ─────────────────── SUCCESS POPUP ─────────────────── */
function SuccessPopup({ message, subtitle, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-popIn">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-200">
          <CheckCircle size={40} className="text-white" strokeWidth={2.5} />
        </div>
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 transition text-gray-400">
          <X size={16} />
        </button>
        <h3 className="text-2xl font-black text-gray-900 mb-1">{message}</h3>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
        <div className="mt-5 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-shrinkBar" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── ERROR BANNER ─────────────────── */
function ErrorBanner({ message, onClose }) {
  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 animate-fadeIn">
      <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-700 flex-1">{message}</p>
      <button onClick={onClose} className="text-red-300 hover:text-red-500 transition flex-shrink-0"><X size={15} /></button>
    </div>
  );
}

/* ─────────────────── STEP INDICATOR ─────────────────── */
function StepIndicator({ currentStep }) {
  const steps = [
    { num: 1, label: "Product Info", icon: Package },
    { num: 2, label: "Add Variants", icon: Layers },
    { num: 3, label: "Done", icon: Sparkles },
  ];
  return (
    <div className="flex items-center justify-center mb-10">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const done = currentStep > step.num;
        const active = currentStep === step.num;
        return (
          <React.Fragment key={step.num}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm
                ${done ? "bg-emerald-500 text-white shadow-emerald-200"
                  : active ? "bg-slate-900 text-white shadow-slate-200"
                  : "bg-gray-100 text-gray-400"}`}>
                {done ? <CheckCircle size={20} strokeWidth={2.5} /> : <Icon size={18} />}
              </div>
              <span className={`text-xs font-semibold transition-colors ${active ? "text-slate-900" : done ? "text-emerald-600" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-16 sm:w-24 mx-2 mb-5 rounded-full transition-all duration-500 ${currentStep > step.num ? "bg-emerald-400" : "bg-gray-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─────────────────── FIELD COMPONENT ─────────────────── */
function Field({ label, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition bg-gray-50 focus:bg-white";
const selectCls = inputCls + " cursor-pointer appearance-none";

/* ─────────────────── VARIANT CARD ─────────────────── */
function VariantCard({ variant, index, colors, sizes, onChange, onRemove, errors }) {
  const update = (key, val) => onChange(index, key, val);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
            <span className="text-xs font-black text-slate-600">{index + 1}</span>
          </div>
          <span className="font-semibold text-sm text-gray-800">Variant #{index + 1}</span>
        </div>
        <button
          onClick={() => onRemove(index)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
          title="Remove variant"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Color */}
        <Field label="Color" required>
          <div className="relative">
            <select
              value={variant.color_name}
              onChange={(e) => update("color_name", e.target.value)}
              className={selectCls + (errors?.color_name ? " !border-red-400 ring-2 ring-red-100" : "")}
            >
              <option value="">Select color</option>
              {colors.map((c) => (
                <option key={c.id} value={c.id}>{c.color_name || c.name}</option>
              ))}
            </select>
            <Palette size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {errors?.color_name && <p className="text-xs text-red-500">{errors.color_name}</p>}
        </Field>

        {/* Size */}
        <Field label="Size" required>
          <div className="relative">
            <select
              value={variant.size_name}
              onChange={(e) => update("size_name", e.target.value)}
              className={selectCls + (errors?.size_name ? " !border-red-400 ring-2 ring-red-100" : "")}
            >
              <option value="">Select size</option>
              {sizes.map((s) => (
                <option key={s.id} value={s.id}>{s.size_name || s.name}</option>
              ))}
            </select>
            <Tag size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {errors?.size_name && <p className="text-xs text-red-500">{errors.size_name}</p>}
        </Field>

        {/* Final Price */}
        <Field label="Original Price (₹)" required>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">₹</span>
            <input
              type="number"
              min="0"
              placeholder="999"
              value={variant.final_price}
              onChange={(e) => update("final_price", e.target.value)}
              className={"pl-7 " + inputCls + (errors?.final_price ? " !border-red-400 ring-2 ring-red-100" : "")}
            />
          </div>
          {errors?.final_price && <p className="text-xs text-red-500">{errors.final_price}</p>}
        </Field>

        {/* Offer Price */}
        <Field label="Offer Price (₹)" hint="Leave empty if no discount">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">₹</span>
            <input
              type="number"
              min="0"
              placeholder="799"
              value={variant.offer_price}
              onChange={(e) => update("offer_price", e.target.value)}
              className={"pl-7 " + inputCls}
            />
          </div>
          {variant.offer_price && variant.final_price &&
            parseFloat(variant.offer_price) >= parseFloat(variant.final_price) && (
            <p className="text-xs text-amber-500">⚠ Offer price should be less than original</p>
          )}
        </Field>

        {/* Image URL — full width */}
        <div className="sm:col-span-2">
          <Field label="Image URL" required hint="Direct public link to product image (https://...)">
            <div className="relative">
              <ImageIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={variant.image_url}
                onChange={(e) => update("image_url", e.target.value)}
                className={"pl-9 " + inputCls + (errors?.image_url ? " !border-red-400 ring-2 ring-red-100" : "")}
              />
            </div>
            {errors?.image_url && <p className="text-xs text-red-500">{errors.image_url}</p>}
          </Field>
        </div>

        {/* Image Preview */}
        {variant.image_url && (
          <div className="sm:col-span-2">
            <p className="text-xs text-gray-400 mb-1.5">Preview</p>
            <img
              src={variant.image_url}
              alt="Preview"
              className="h-24 w-24 object-cover rounded-xl border border-gray-200 shadow-sm"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────── STEP 1: PRODUCT INFO ─────────────────── */
function Step1({ data, onChange, onNext, loading, error, onErrorClose, categories }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.name.trim())        e.name        = "Product name is required";
    if (!data.brand.trim())       e.brand       = "Brand is required";
    if (!data.category)           e.category    = "Category is required";
    if (!data.description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) onNext(); };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 mb-1">Product Details</h2>
        <p className="text-gray-500 text-sm">Fill in the core information about your product</p>
      </div>

      {error && <ErrorBanner message={error} onClose={onErrorClose} />}

      <div className="space-y-5">
        {/* Product Name */}
        <Field label="Product Name" required>
          <input
            type="text"
            placeholder="e.g. Premium Cotton Shirt"
            value={data.name}
            onChange={(e) => onChange("name", e.target.value)}
            className={inputCls + (errors.name ? " !border-red-400 ring-2 ring-red-100" : "")}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </Field>

        {/* Brand */}
        <Field label="Brand" required>
          <input
            type="text"
            placeholder="e.g. Puma, Nike, H&M"
            value={data.brand}
            onChange={(e) => onChange("brand", e.target.value)}
            className={inputCls + (errors.brand ? " !border-red-400 ring-2 ring-red-100" : "")}
          />
          {errors.brand && <p className="text-xs text-red-500">{errors.brand}</p>}
        </Field>

        {/* Category — fetched from API */}
        <Field label="Category" required>
          <div className="relative">
            <select
              value={data.category}
              onChange={(e) => onChange("category", e.target.value)}
              className={selectCls + (errors.category ? " !border-red-400 ring-2 ring-red-100" : "")}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.categorie || cat.categorie_name || cat.name}
                </option>
              ))}
            </select>
            <LayoutGrid size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
        </Field>

        {/* Description */}
        <Field label="Description" required>
          <textarea
            rows={4}
            placeholder="Describe your product in detail — materials, features, benefits..."
            value={data.description}
            onChange={(e) => onChange("description", e.target.value)}
            className={inputCls + " resize-none" + (errors.description ? " !border-red-400 ring-2 ring-red-100" : "")}
          />
          <div className="flex items-center justify-between">
            {errors.description
              ? <p className="text-xs text-red-500">{errors.description}</p>
              : <span />}
            <span className={`text-xs ${data.description.length > 500 ? "text-red-400" : "text-gray-400"}`}>
              {data.description.length}/500
            </span>
          </div>
        </Field>
      </div>

      <button
        onClick={handleNext}
        disabled={loading}
        className="mt-8 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-slate-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
      >
        {loading
          ? <><Loader2 size={18} className="animate-spin" /> Creating product...</>
          : <>Continue to Variants <ChevronRight size={18} /></>}
      </button>
    </div>
  );
}

/* ─────────────────── STEP 2: VARIANTS ─────────────────── */
function Step2({ productId, colors, sizes, onDone, onBack }) {
  const emptyVariant = { color_name: "", size_name: "", image_url: "", final_price: "", offer_price: "" };

  const [variants, setVariants]           = useState([{ ...emptyVariant }]);
  const [variantErrors, setVariantErrors] = useState([{}]);
  const [submitting, setSubmitting]       = useState(false);
  const [submitted, setSubmitted]         = useState([]);
  const [error, setError]                 = useState("");
  const [successPopup, setSuccessPopup]   = useState(null);

  const updateVariant = (idx, key, val) => {
    setVariants((v) => v.map((vr, i) => i === idx ? { ...vr, [key]: val } : vr));
    setVariantErrors((e) => e.map((er, i) => i === idx ? { ...er, [key]: "" } : er));
  };

  const addVariant = () => {
    setVariants((v) => [...v, { ...emptyVariant }]);
    setVariantErrors((e) => [...e, {}]);
  };

  const removeVariant = (idx) => {
    if (variants.length === 1) return;
    setVariants((v) => v.filter((_, i) => i !== idx));
    setVariantErrors((e) => e.filter((_, i) => i !== idx));
  };

  const validateAll = () => {
    const allErrors = variants.map((v) => {
      const e = {};
      if (!v.color_name)      e.color_name  = "Required";
      if (!v.size_name)       e.size_name   = "Required";
      if (!v.final_price)     e.final_price = "Required";
      if (!v.image_url.trim()) e.image_url  = "Required";
      return e;
    });
    setVariantErrors(allErrors);
    return allErrors.every((e) => Object.keys(e).length === 0);
  };

const submitVariants = async () => {
  if (!validateAll()) return;

  setSubmitting(true);
  setError("");

  try {
    const payload = {
      product_id: productId,
      variants: variants.map((v) => ({
        colors: Number(v.color_name),
        sizes: Number(v.size_name),
        price: Number(v.final_price),
        offer: v.offer_price ? Number(v.offer_price) : 0,
        stock: 5, // ya apna stock field use karo
      })),
    };

    console.log("Sending Payload:", payload);

    await axios.post(
      `${API}/variant/`,
      payload,
      {
        headers: authHeaders(),
      }
    );

    setSuccessPopup({
      message: "All Variants Added!",
      subtitle: `${variants.length} variant${
        variants.length > 1 ? "s" : ""
      } created successfully`,
    });

    setTimeout(() => onDone(), 3600);

  } catch (err) {
    console.error(err);

    const msg =
      err?.response?.data
        ? JSON.stringify(err.response.data)
        : "Failed to add variants";

    setError(msg);
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div>
      {successPopup && (
        <SuccessPopup
          message={successPopup.message}
          subtitle={successPopup.subtitle}
          onClose={() => setSuccessPopup(null)}
        />
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900 mb-1">Product Variants</h2>
        <p className="text-gray-500 text-sm">Add color, size and pricing options for your product</p>
      </div>

      {error && <ErrorBanner message={error} onClose={() => setError("")} />}

      {submitted.length > 0 && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 mb-4 text-sm text-emerald-700 font-medium">
          <CheckCircle size={15} />
          {submitted.length} variant{submitted.length > 1 ? "s" : ""} saved successfully
        </div>
      )}

      <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1 custom-scroll">
        {variants.map((variant, i) => (
          <VariantCard
            key={i}
            index={i}
            variant={variant}
            colors={colors}
            sizes={sizes}
            onChange={updateVariant}
            onRemove={removeVariant}
            errors={variantErrors[i]}
          />
        ))}
      </div>

      <button
        onClick={addVariant}
        className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-slate-900 text-gray-500 hover:text-slate-900 py-3.5 rounded-2xl transition text-sm font-semibold group"
      >
        <Plus size={18} className="group-hover:scale-110 transition-transform" />
        Add Another Variant
      </button>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={submitVariants}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-2xl transition shadow-lg shadow-slate-200 disabled:opacity-60 text-sm"
        >
          {submitting
            ? <><Loader2 size={18} className="animate-spin" /> Submitting...</>
            : <><CheckCircle size={16} /> Submit All Variants</>}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────── STEP 3: DONE ─────────────────── */
function Step3({ onAddAnother }) {
  return (
    <div className="text-center py-8">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200">
        <Sparkles size={44} className="text-white" />
      </div>
      <h2 className="text-3xl font-black text-gray-900 mb-2">Product Live! 🎉</h2>
      <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">
        Your product and all its variants have been successfully published to the store.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onAddAnother}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-slate-800 transition shadow-lg shadow-slate-200"
        >
          <Plus size={16} /> Add Another Product
        </button>
        <a
          href="/dashboard"
          className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-gray-50 transition"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

/* ─────────────────── ACCESS DENIED ─────────────────── */
function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center border border-gray-100">
        <div className="w-20 h-20 rounded-3xl bg-red-100 flex items-center justify-center mx-auto mb-5">
          <ShieldX size={40} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-500 text-sm mb-6">
          Only <span className="font-semibold text-slate-900">Seller</span> accounts can add products.
          Please login with a seller account.
        </p>
        <a
          href="/login"
          className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-slate-800 transition w-full"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}

/* ─────────────────── MAIN COMPONENT ─────────────────── */
export default function AddProduct() {
  const [step, setStep]           = useState(1);
  const [productId, setProductId] = useState(null);

  // Step 1 state — category is now part of productData
  const [productData, setProductData] = useState({
    name: "", brand: "", category: "", description: "",
  });
  const [step1Loading, setStep1Loading] = useState(false);
  const [step1Error, setStep1Error]     = useState("");
  const [step1Success, setStep1Success] = useState(false);

  // Dropdown data
  const [colors, setColors]       = useState([]);
  const [sizes, setSizes]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError]     = useState("");

  // Role guard — must come after all hooks
  const token = getToken();
  const role  = getUserRole();
  if (!token)                                    return <AccessDenied />;
  if (role && role.toLowerCase() !== "seller")   return <AccessDenied />;

  // Fetch colors, sizes, categories
  useEffect(() => {
    const fetchMeta = async () => {
      setMetaLoading(true);
      setMetaError("");
      try {
        const [colRes, sizeRes, catRes] = await Promise.all([
          axios.get(`${API}/VariantColorView/`,  { headers: authHeaders() }),
          axios.get(`${API}/VariantSizeView/`,   { headers: authHeaders() }),
          axios.get(`${API}/Categoriesdata/`,    { headers: authHeaders() }),
        ]);
        setColors(colRes.data      || []);
        setSizes(sizeRes.data      || []);
        setCategories(catRes.data  || []);
      } catch (e) {
        console.error("Failed to load metadata", e);
        setMetaError("Failed to load categories / colors / sizes. Please refresh.");
      } finally {
        setMetaLoading(false);
      }
    };
    fetchMeta();
  }, []);

  const handleProductChange = (key, val) =>
    setProductData((d) => ({ ...d, [key]: val }));

  const submitProduct = async () => {
    setStep1Loading(true);
    setStep1Error("");
    try {
      const res = await axios.post(
        `${API}/product/`,
        {
          name:        productData.name.trim(),
          brand:       productData.brand.trim(),
          category:    productData.category,        // FK id sent to backend
          description: productData.description.trim(),
        },
        { headers: authHeaders() }
      );
      const id = res.data?.id || res.data?.product_id;
      setProductId(id);
      setStep1Success(true);
      setTimeout(() => { setStep1Success(false); setStep(2); }, 2000);
    } catch (err) {
      const data = err?.response?.data;
      const msg  = data
        ? Object.values(data).flat().join(", ")
        : "Failed to create product. Please try again.";
      setStep1Error(msg);
    } finally {
      setStep1Loading(false);
    }
  };

  const resetAll = () => {
    setStep(1);
    setProductId(null);
    setProductData({ name: "", brand: "", category: "", description: "" });
    setStep1Error("");
  };

  return (
    <>
      <style>{`
        @keyframes popIn {
          0%   { opacity:0; transform:scale(0.85) translateY(20px); }
          70%  { transform:scale(1.03) translateY(-2px); }
          100% { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes shrinkBar {
          from { width:100%; }
          to   { width:0%; }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .animate-popIn      { animation: popIn      0.35s cubic-bezier(0.34,1.56,0.64,1) both; }
        .animate-shrinkBar  { animation: shrinkBar  3.5s linear both; }
        .animate-fadeIn     { animation: fadeIn     0.2s ease-out both; }
        .custom-scroll::-webkit-scrollbar       { width:4px; }
        .custom-scroll::-webkit-scrollbar-track { background:transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:99px; }
      `}</style>

      {/* Step 1 success popup */}
      {step1Success && (
        <SuccessPopup
          message="Product Created!"
          subtitle={`"${productData.name}" is ready. Now add variants.`}
          onClose={() => setStep1Success(false)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-xl">

          {/* Page header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm mb-4">
              <Package size={13} />
              Seller Dashboard
            </div>
            <h1 className="text-3xl font-black text-gray-900">Add New Product</h1>
            <p className="text-gray-500 text-sm mt-1">Complete all steps to publish your product</p>
          </div>

          <StepIndicator currentStep={step} />

          {/* Meta fetch error */}
          {metaError && (
            <div className="mb-4">
              <ErrorBanner message={metaError} onClose={() => setMetaError("")} />
            </div>
          )}

          {/* Main card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
            {/* Show loader only on step 2 while meta is loading */}
            {metaLoading && step === 2 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 size={28} className="animate-spin text-slate-400" />
                <p className="text-sm text-gray-400">Loading options...</p>
              </div>
            ) : step === 1 ? (
              <Step1
                data={productData}
                onChange={handleProductChange}
                onNext={submitProduct}
                loading={step1Loading}
                error={step1Error}
                onErrorClose={() => setStep1Error("")}
                categories={categories}       
              />
            ) : step === 2 ? (
              <Step2
                productId={productId}
                colors={colors}
                sizes={sizes}
                onDone={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            ) : (
              <Step3 onAddAnother={resetAll} />
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            All products are reviewed before going live · SpeedXS Seller Portal
          </p>
        </div>
      </div>
    </>
  );
}