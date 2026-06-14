import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  Package, Palette, CheckCircle, AlertCircle,
  Plus, Trash2, ChevronLeft,
  Tag, Layers, ShieldX, Loader2, X,
  Sparkles, LayoutGrid, Store,
  ArrowRight, BadgeCheck, Upload, ImagePlus, Trash,
  Camera,
} from "lucide-react";

const API = "http://127.0.0.1:8000/api";

/* ═══════════════════════════════════════════
   TOKEN UTILITIES
═══════════════════════════════════════════ */
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
  return t ? { Authorization: `Bearer ${t}` } : {};
}
function getUserRole() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || payload.user_role || null;
  } catch { return null; }
}

/* ═══════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  * { font-family: 'Inter', sans-serif; box-sizing: border-box; }

  @keyframes slideUp {
    from { opacity:0; transform:translateY(20px) scale(0.98); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes popIn {
    0%  { opacity:0; transform:scale(0.82) translateY(14px); }
    65% { transform:scale(1.04) translateY(-2px); }
    100%{ opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes shrinkBar { from{width:100%} to{width:0%} }
  @keyframes fadeDown  {
    from { opacity:0; transform:translateY(-6px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes spin      { to { transform:rotate(360deg); } }
  @keyframes shimmer   {
    0%   { background-position:-200% 0; }
    100% { background-position:200% 0; }
  }
  @keyframes pulseSoft { 0%,100%{opacity:1} 50%{opacity:.55} }

  .anim-slide-up  { animation: slideUp  0.4s cubic-bezier(0.22,1,0.36,1) both; }
  .anim-pop-in    { animation: popIn    0.38s cubic-bezier(0.34,1.56,0.64,1) both; }
  .anim-shrink    { animation: shrinkBar 3.5s linear both; }
  .anim-fade-down { animation: fadeDown 0.22s ease-out both; }
  .anim-spin      { animation: spin 0.85s linear infinite; }
  .anim-pulse     { animation: pulseSoft 1.8s ease-in-out infinite; }

  .shimmer-bg {
    background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
    background-size:200% 100%;
    animation: shimmer 1.4s infinite;
  }
  .scroll-thin::-webkit-scrollbar       { width:5px; }
  .scroll-thin::-webkit-scrollbar-track { background:transparent; }
  .scroll-thin::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:99px; }
  select { background-image:none !important; }

  .drop-zone-active {
    border-color: #6366f1 !important;
    background-color: #eef2ff !important;
  }
`;

/* ═══════════════════════════════════════════
   SHARED INPUT CLASSES
═══════════════════════════════════════════ */
const ib = "w-full border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white";
const iN = ib + " border-slate-200 focus:ring-indigo-400/30 focus:border-indigo-400";
const iE = ib + " border-red-300 ring-2 ring-red-100 bg-red-50/30 focus:ring-red-300";
const sN = iN + " cursor-pointer pr-10 appearance-none";
const sE = iE + " cursor-pointer pr-10 appearance-none";

/* ═══════════════════════════════════════════
   FIELD WRAPPER
═══════════════════════════════════════════ */
function Field({ label, required, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase flex items-center gap-1">
        {label}{required && <span className="text-rose-400 text-sm leading-none">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && (
        <p className="text-xs text-rose-500 flex items-center gap-1 anim-fade-down">
          <AlertCircle size={11} className="flex-shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   ERROR BANNER
═══════════════════════════════════════════ */
function ErrorBanner({ message, onClose }) {
  return (
    <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3.5 mb-5 anim-fade-down">
      <AlertCircle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-rose-700 flex-1 leading-relaxed">{message}</p>
      <button onClick={onClose} className="text-rose-300 hover:text-rose-500 transition flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SUCCESS POPUP
═══════════════════════════════════════════ */
function SuccessPopup({ message, subtitle, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-xs w-full text-center anim-pop-in">
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100 transition text-slate-400">
          <X size={14} />
        </button>
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-200">
          <BadgeCheck size={38} className="text-white" strokeWidth={2} />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-1">{message}</h3>
        {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
        <div className="mt-5 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full anim-shrink" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STEP INDICATOR
═══════════════════════════════════════════ */
function StepIndicator({ current }) {
  const steps = [
    { n: 1, label: "Details",  Icon: Package  },
    { n: 2, label: "Variants", Icon: Layers   },
    { n: 3, label: "Done",     Icon: Sparkles },
  ];
  return (
    <div className="flex items-center justify-center mb-10">
      {steps.map((s, i) => {
        const done = current > s.n, active = current === s.n;
        return (
          <React.Fragment key={s.n}>
            <div className="flex flex-col items-center gap-2 min-w-[68px]">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 shadow-sm
                ${done ? "bg-emerald-500 text-white shadow-emerald-200"
                  : active ? "bg-indigo-600 text-white shadow-indigo-200"
                  : "bg-slate-100 text-slate-400"}`}>
                {done ? <CheckCircle size={18} strokeWidth={2.5} /> : <s.Icon size={16} />}
              </div>
              <span className={`text-[11px] font-semibold tracking-wide transition-colors
                ${active ? "text-indigo-600" : done ? "text-emerald-600" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 mx-1 mb-5">
                <div className={`h-[2px] rounded-full transition-all duration-500 ${current > s.n ? "bg-emerald-400" : "bg-slate-100"}`} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════
   IMAGE PICKER  — reusable for both product & variant
═══════════════════════════════════════════ */
function ImagePicker({ file, preview, onChange, error, label = "Image", aspectClass = "h-48" }) {
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    onChange(f, URL.createObjectURL(f));
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const removeImage = (e) => {
    e.stopPropagation();
    onChange(null, null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <label className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase flex items-center gap-1 mb-1.5">
        {label} <span className="text-rose-400 text-sm leading-none">*</span>
      </label>

      {preview ? (
        <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm group ${aspectClass}`}>
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all duration-200 flex items-center justify-center">
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <button onClick={() => inputRef.current?.click()}
                className="bg-white text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md hover:bg-indigo-50 hover:text-indigo-600 transition">
                <Upload size={12} /> Change
              </button>
              <button onClick={removeImage}
                className="bg-white text-rose-500 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md hover:bg-rose-50 transition">
                <Trash size={12} /> Remove
              </button>
            </div>
          </div>
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1 text-xs text-slate-600 font-medium flex items-center gap-1.5 max-w-[80%] truncate shadow-sm">
            <CheckCircle size={11} className="text-emerald-500 flex-shrink-0" />
            {file?.name}
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`w-full rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 transition-all duration-200 ${aspectClass}
            ${drag ? "drop-zone-active" : error ? "border-red-300 bg-red-50/30" : "border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/40"}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
            ${drag ? "bg-indigo-100 text-indigo-500" : error ? "bg-red-100 text-red-400" : "bg-slate-100 text-slate-400"}`}>
            <ImagePlus size={20} />
          </div>
          <div className="text-center">
            <p className={`text-sm font-semibold ${drag ? "text-indigo-600" : error ? "text-red-500" : "text-slate-600"}`}>
              {drag ? "Drop to upload" : "Click or drag image here"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP · max 5 MB</p>
          </div>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => handleFile(e.target.files[0])} />

      {error && (
        <p className="text-xs text-rose-500 flex items-center gap-1 mt-1.5 anim-fade-down">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   VARIANT CARD
═══════════════════════════════════════════ */
function VariantCard({ variant, index, colors, sizes, onChange, onRemove, errors = {} }) {
  const upd = (k, v) => onChange(index, k, v);

  const priceWarn =
    variant.offer_price && variant.final_price &&
    parseFloat(variant.offer_price) >= parseFloat(variant.final_price);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 anim-slide-up">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <span className="text-xs font-black text-indigo-500">{index + 1}</span>
          </div>
          <span className="text-sm font-bold text-slate-700">Variant #{index + 1}</span>
        </div>
        <button onClick={() => onRemove(index)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all" title="Remove">
          <Trash2 size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Color */}
        <Field label="Colour" required error={errors.color_name}>
          <div className="relative">
            <select value={variant.color_name} onChange={(e) => upd("color_name", e.target.value)}
              className={errors.color_name ? sE : sN}>
              <option value="">Select colour</option>
              {colors.map((c) => <option key={c.id} value={c.id}>{c.color_name ?? c.color}</option>)}
            </select>
            <Palette size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </Field>

        {/* Size */}
        <Field label="Size" required error={errors.size_name}>
          <div className="relative">
            <select value={variant.size_name} onChange={(e) => upd("size_name", e.target.value)}
              className={errors.size_name ? sE : sN}>
              <option value="">Select size</option>
              {sizes.map((s) => <option key={s.id} value={s.id}>{s.size_name ?? s.size}</option>)}
            </select>
            <Tag size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </Field>

        {/* Original price */}
        <Field label="Original Price (₹)" required error={errors.final_price}>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm select-none">₹</span>
            <input type="number" min="0" placeholder="1299"
              value={variant.final_price}
              onChange={(e) => upd("final_price", e.target.value)}
              className={`pl-8 ${errors.final_price ? iE : iN}`} />
          </div>
        </Field>

        {/* Offer price */}
        <Field label="Offer Price (₹)" hint="Leave blank if no discount"
          error={priceWarn ? "Must be less than original" : ""}>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm select-none">₹</span>
            <input type="number" min="0" placeholder="999"
              value={variant.offer_price}
              onChange={(e) => upd("offer_price", e.target.value)}
              className={`pl-8 ${priceWarn ? iE : iN}`} />
          </div>
        </Field>

        {/* Stock */}
        <Field label="Stock" required error={errors.stock}>
          <input type="number" min="0" placeholder="50"
            value={variant.stock}
            onChange={(e) => upd("stock", e.target.value)}
            className={errors.stock ? iE : iN} />
        </Field>

        <div className="hidden sm:block" />

        {/* Variant Image — full width */}
        <div className="sm:col-span-2">
          <ImagePicker
            file={variant.imageFile}
            preview={variant.imagePreview}
            label="Variant Image"
            aspectClass="h-40"
            onChange={(file, preview) => {
              upd("imageFile", file);
              upd("imagePreview", preview);
            }}
            error={errors.imageFile}
          />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PROGRESS BAR
═══════════════════════════════════════════ */
function UploadProgress({ done, total }) {
  const pct = Math.round((done / total) * 100);
  return (
    <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-indigo-700">Uploading variants…</span>
        <span className="text-sm font-bold text-indigo-600">{done}/{total}</span>
      </div>
      <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-indigo-400 mt-1.5">{pct}% complete</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STEP 1 — PRODUCT INFO  (NOW WITH IMAGE)
   FIX: send multipart/form-data so product_image
        is accepted by the Django serializer.
═══════════════════════════════════════════ */
function Step1({ data, onChange, onImageChange, onNext, loading, error, onErrorClose, categories }) {
  const [errs, setErrs] = useState({});

  const validate = () => {
    const e = {};
    if (!data.name.trim() || data.name.trim().length < 5)
      e.name = "At least 5 characters required";
    if (!data.brand.trim() || data.brand.trim().length < 3)
      e.brand = "At least 3 characters required";
    if (!data.category)
      e.category = "Please select a category";
    if (!data.description.trim() || data.description.trim().length < 10)
      e.description = "At least 10 characters required";
    if (!data.imageFile)
      e.imageFile = "Product image is required";
    setErrs(e);
    return !Object.keys(e).length;
  };

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Product Details</h2>
        <p className="text-slate-400 text-sm mt-1">Core information about your listing</p>
      </div>

      {error && <ErrorBanner message={error} onClose={onErrorClose} />}

      <div className="space-y-5">

        {/* ── PRODUCT IMAGE (new) ── */}
        <ImagePicker
          file={data.imageFile}
          preview={data.imagePreview}
          label="Product Cover Image"
          aspectClass="h-52"
          onChange={onImageChange}
          error={errs.imageFile}
        />

        <Field label="Product Name" required error={errs.name} hint="Min. 5 characters">
          <input type="text" placeholder="e.g. Premium Cotton Oversized T-Shirt"
            value={data.name} onChange={(e) => onChange("name", e.target.value)}
            className={errs.name ? iE : iN} />
        </Field>

        <Field label="Brand" required error={errs.brand} hint="Min. 3 characters">
          <input type="text" placeholder="e.g. Nike, Puma, H&M"
            value={data.brand} onChange={(e) => onChange("brand", e.target.value)}
            className={errs.brand ? iE : iN} />
        </Field>

        <Field label="Category" required error={errs.category}>
          <div className="relative">
            <select value={data.category} onChange={(e) => onChange("category", e.target.value)}
              className={errs.category ? sE : sN}>
              <option value="">Choose a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.categorie}</option>
              ))}
            </select>
            <LayoutGrid size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </Field>

        <Field label="Description" required error={errs.description} hint="Min. 10 chars · max 500">
          <textarea rows={4} placeholder="Describe your product — materials, features, fit…"
            value={data.description}
            onChange={(e) => onChange("description", e.target.value)}
            className={`${errs.description ? iE : iN} resize-none leading-relaxed`}
            maxLength={500} />
          <div className="flex justify-end">
            <span className={`text-xs font-medium ${data.description.length > 470 ? "text-rose-400" : "text-slate-400"}`}>
              {data.description.length} / 500
            </span>
          </div>
        </Field>
      </div>

      <button onClick={() => { if (validate()) onNext(); }} disabled={loading}
        className="mt-8 w-full flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-700
          active:scale-[0.98] text-white font-semibold py-3.5 rounded-2xl transition-all
          shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
        {loading
          ? <><Loader2 size={17} className="anim-spin" /> Creating product…</>
          : <>Continue to Variants <ArrowRight size={16} /></>}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STEP 2 — VARIANTS
═══════════════════════════════════════════ */
const emptyVariant = () => ({
  color_name: "", size_name: "",
  final_price: "", offer_price: "", stock: "",
  imageFile: null, imagePreview: null,
});

function Step2({ productId, colors, sizes, onDone, onBack }) {
  const [variants,   setVariants]   = useState([emptyVariant()]);
  const [vErrors,    setVErrors]    = useState([{}]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadDone, setUploadDone] = useState(0);
  const [error,      setError]      = useState("");
  const [successPopup, setSuccessPopup] = useState(null);

  const updateVariant = useCallback((idx, key, val) => {
    setVariants((v) => v.map((vr, i) => i === idx ? { ...vr, [key]: val } : vr));
    setVErrors((e) => e.map((er, i) => i === idx ? { ...er, [key]: "" } : er));
  }, []);

  const addVariant    = () => { setVariants((v) => [...v, emptyVariant()]); setVErrors((e) => [...e, {}]); };
  const removeVariant = (idx) => {
    if (variants.length === 1) return;
    setVariants((v) => v.filter((_, i) => i !== idx));
    setVErrors((e)  => e.filter((_, i) => i !== idx));
  };

  const validateAll = () => {
    const all = variants.map((v) => {
      const e = {};
      if (!v.color_name)  e.color_name  = "Required";
      if (!v.size_name)   e.size_name   = "Required";
      if (!v.final_price) e.final_price = "Required";
      if (!v.stock)       e.stock       = "Required";
      if (!v.imageFile)   e.imageFile   = "Please select an image";
      return e;
    });
    setVErrors(all);
    return all.every((e) => !Object.keys(e).length);
  };

  const submit = async () => {
    if (!validateAll()) return;
    setSubmitting(true); setError(""); setUploadDone(0);
    try {
      for (let i = 0; i < variants.length; i++) {
        const v  = variants[i];
        const fd = new FormData();
        fd.append("product", productId);
        fd.append("colors",  Number(v.color_name));
        fd.append("sizes",   Number(v.size_name));
        fd.append("price",   Number(v.final_price));
        fd.append("offer",   v.offer_price ? Number(v.offer_price) : 0);
        fd.append("stock",   Number(v.stock));
        fd.append("images",  v.imageFile, v.imageFile.name);
        // NOTE: no "variants" key → backend uses serializer path → image works
        await axios.post(`${API}/variant/`, fd, { headers: authHeaders() });
        setUploadDone(i + 1);
      }
      setSuccessPopup({
        message:  "All Variants Live!",
        subtitle: `${variants.length} variant${variants.length > 1 ? "s" : ""} published`,
      });
      setTimeout(onDone, 3600);
    } catch (err) {
      const d = err?.response?.data;
      setError(d ? (typeof d === "string" ? d : Object.values(d).flat().join(" · ")) : "Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {successPopup && (
        <SuccessPopup message={successPopup.message} subtitle={successPopup.subtitle}
          onClose={() => setSuccessPopup(null)} />
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Product Variants</h2>
        <p className="text-slate-400 text-sm mt-1">Add colour, size, price and image for each option</p>
      </div>

      {error && <ErrorBanner message={error} onClose={() => setError("")} />}

      <div className="space-y-4 max-h-[56vh] overflow-y-auto pr-1 scroll-thin">
        {variants.map((v, i) => (
          <VariantCard key={i} index={i} variant={v}
            colors={colors} sizes={sizes}
            onChange={updateVariant} onRemove={removeVariant}
            errors={vErrors[i]} />
        ))}
      </div>

      <button onClick={addVariant}
        className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200
          hover:border-indigo-400 text-slate-400 hover:text-indigo-600 py-3.5 rounded-2xl
          transition-all text-sm font-semibold group">
        <Plus size={16} className="group-hover:scale-110 transition-transform" /> Add Another Variant
      </button>

      {submitting && <UploadProgress done={uploadDone} total={variants.length} />}

      <div className="flex gap-3 mt-5">
        <button onClick={onBack} disabled={submitting}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200
            text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-all disabled:opacity-40">
          <ChevronLeft size={15} /> Back
        </button>
        <button onClick={submit} disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700
            active:scale-[0.98] text-white font-semibold py-3 rounded-2xl transition-all
            shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
          {submitting
            ? <><Loader2 size={16} className="anim-spin" /> Uploading {uploadDone}/{variants.length}…</>
            : <><CheckCircle size={15} /> Publish All Variants</>}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STEP 3 — DONE
═══════════════════════════════════════════ */
function Step3({ onAddAnother }) {
  return (
    <div className="text-center py-8 anim-slide-up">
      <div className="relative w-24 h-24 mx-auto mb-7">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-200">
          <Sparkles size={44} className="text-white" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md">
          <CheckCircle size={20} className="text-emerald-500" strokeWidth={2.5} />
        </div>
      </div>
      <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Live on Store! 🎉</h2>
      <p className="text-slate-400 text-sm mb-8 max-w-[260px] mx-auto leading-relaxed">
        Your product and all variants are now visible to shoppers.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={onAddAnother}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700
            text-white px-6 py-3 rounded-2xl font-semibold text-sm transition-all shadow-lg shadow-indigo-200">
          <Plus size={15} /> Add Another Product
        </button>
        <a href="/dashboard"
          className="flex items-center justify-center gap-2 border border-slate-200
            text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-2xl font-semibold text-sm transition-all">
          Go to Dashboard <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════ */
function MetaSkeleton() {
  return (
    <div className="space-y-5 anim-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i}>
          <div className="shimmer-bg h-3 w-24 rounded-full mb-2" />
          <div className="shimmer-bg h-11 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   ACCESS DENIED
═══════════════════════════════════════════ */
function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center border border-slate-100 anim-slide-up">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-5">
          <ShieldX size={38} className="text-rose-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-slate-400 text-sm mb-7 leading-relaxed">
          Only <span className="font-semibold text-slate-700">Seller</span> accounts can list products.
        </p>
        <a href="/login"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700
            text-white px-6 py-3 rounded-2xl font-semibold text-sm transition-all shadow-lg shadow-indigo-200 w-full">
          Sign In <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROOT COMPONENT
═══════════════════════════════════════════ */
export default function AddProduct() {
  const [step,       setStep]       = useState(1);
  const [productId,  setProductId]  = useState(null);
  const [productData, setProductData] = useState({
    name: "", brand: "", category: "", description: "",
    imageFile: null, imagePreview: null,   // ← new
  });
  const [step1Loading,  setStep1Loading]  = useState(false);
  const [step1Error,    setStep1Error]    = useState("");
  const [step1Success,  setStep1Success]  = useState(false);

  const [colors,     setColors]     = useState([]);
  const [sizes,      setSizes]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError,   setMetaError]   = useState("");

  // Role guard
  const token = getToken();
  const role  = getUserRole();
  if (!token)                                  return <AccessDenied />;
  if (role && role.toLowerCase() !== "seller") return <AccessDenied />;

  // Fetch dropdowns
  useEffect(() => {
    (async () => {
      setMetaLoading(true); setMetaError("");
      try {
        const [colRes, sizeRes, catRes] = await Promise.all([
          axios.get(`${API}/VariantColorView/`, { headers: authHeaders() }),
          axios.get(`${API}/VariantSizeView/`,  { headers: authHeaders() }),
          axios.get(`${API}/Categoriesdata/`,   { headers: authHeaders() }),
        ]);
        setColors(colRes.data?.results ?? colRes.data ?? []);
        setSizes(sizeRes.data?.results ?? sizeRes.data ?? []);
        setCategories(catRes.data?.results ?? catRes.data ?? []);
      } catch {
        setMetaError("Could not load options — please refresh the page.");
      } finally {
        setMetaLoading(false);
      }
    })();
  }, []);

  const handleChange = (key, val) => setProductData((d) => ({ ...d, [key]: val }));

  const handleImageChange = (file, preview) =>
    setProductData((d) => ({ ...d, imageFile: file, imagePreview: preview }));

  /* ── PRODUCT CREATE — multipart so product_image is accepted ── */
  const submitProduct = async () => {
    setStep1Loading(true); setStep1Error("");
    try {
      const fd = new FormData();
      fd.append("name",          productData.name.trim());
      fd.append("brand",         productData.brand.trim());
      fd.append("category",      productData.category);
      fd.append("description",   productData.description.trim());
      // KEY FIX: append the actual image file under the serializer field name
      if (productData.imageFile) {
        fd.append("product_image", productData.imageFile, productData.imageFile.name);
      }

      const res = await axios.post(`${API}/product/`, fd, {
        headers: {
          ...authHeaders(),
          // DO NOT set Content-Type — axios sets multipart boundary automatically
        },
      });

      const id = res.data?.product_id ?? res.data?.id;
      setProductId(id);
      setStep1Success(true);
      setTimeout(() => { setStep1Success(false); setStep(2); }, 2200);
    } catch (err) {
      const d = err?.response?.data;
      setStep1Error(
        d
          ? typeof d === "string" ? d : Object.values(d).flat().join(" · ")
          : "Failed to create product."
      );
    } finally {
      setStep1Loading(false);
    }
  };

  const resetAll = () => {
    setStep(1); setProductId(null);
    setProductData({ name: "", brand: "", category: "", description: "", imageFile: null, imagePreview: null });
    setStep1Error("");
  };

  return (
    <>
      <style>{STYLES}</style>

      {step1Success && (
        <SuccessPopup
          message="Product Created!"
          subtitle={`"${productData.name}" ready — now add variants`}
          onClose={() => setStep1Success(false)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-100
        flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-xl">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full
              px-4 py-1.5 text-xs font-bold text-indigo-600 shadow-sm mb-4 tracking-wide">
              <Store size={12} /> Seller Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">New Listing</h1>
            <p className="text-slate-400 text-sm mt-2">Complete both steps to publish your product</p>
          </div>

          <StepIndicator current={step} />

          {metaError && <ErrorBanner message={metaError} onClose={() => setMetaError("")} />}

          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 anim-slide-up">
            {metaLoading && step === 2
              ? <MetaSkeleton />
              : step === 1
              ? <Step1
                  data={productData}
                  onChange={handleChange}
                  onImageChange={handleImageChange}
                  onNext={submitProduct}
                  loading={step1Loading}
                  error={step1Error}
                  onErrorClose={() => setStep1Error("")}
                  categories={categories}
                />
              : step === 2
              ? <Step2
                  productId={productId}
                  colors={colors} sizes={sizes}
                  onDone={() => setStep(3)}
                  onBack={() => setStep(1)}
                />
              : <Step3 onAddAnother={resetAll} />
            }
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            All listings are reviewed before going live · SpeedXS Seller Portal
          </p>
        </div>
      </div>
    </>
  );
}