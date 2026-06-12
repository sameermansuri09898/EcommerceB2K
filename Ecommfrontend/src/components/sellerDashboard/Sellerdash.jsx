import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import {
  Package, Edit2, Trash2, Plus, X, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle, ShoppingBag, Search, RefreshCw,
  Layers, IndianRupee, Boxes, Percent, Hash, Palette, Tag,
  TrendingDown, BarChart3, Sparkles
} from "lucide-react";

/* ══════════════════════════════════════════════
   CONFIG
══════════════════════════════════════════════ */
const BASE = import.meta.env?.VITE_API_URL ?? "http://127.0.0.1:8000/api";

const http = axios.create({ baseURL: BASE });
http.interceptors.request.use(cfg => {
  const token = localStorage.getItem("access");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

/* ══════════════════════════════════════════════
   API CALLS  — matched exactly to your Django views
══════════════════════════════════════════════ */

// GET /api/seller/products/  → returns product list with variant_set
const apiGetProducts = () =>
  http.get("user/productlist/").then(r => r.data?.results ?? r.data ?? []);

// GET /api/VariantColorView/  → [{id, color_name}, ...]
const apiGetColors = () =>
  http.get("/VariantColorView/").then(r => r.data?.results ?? r.data ?? []);

// GET /api/VariantSizeView/   → [{id, size_name}, ...]
const apiGetSizes = () =>
  http.get("/VariantSizeView/").then(r => r.data?.results ?? r.data ?? []);

/*
  CREATE — your view expects:
    product_id: <int>
    variants: JSON array of objects  { colors, sizes, price, offer, stock, images? }
  
  Since we have one variant at a time from the modal, we wrap it:
    POST /api/variant/
    Content-Type: multipart/form-data
    product_id=710
    variants=[{"colors":3,"sizes":2,"price":12,"offer":2,"stock":22}]
    image_0=<file>   ← we handle images separately via a second PATCH after creation
    
  Actually — your view does bulk_create from JSON variants array.
  Image inside JSON can't be a file object. So: create without image first,
  then PATCH the new variant with the image if provided.
  We'll send variants as JSON string in FormData.
*/
const apiCreateVariant = async ({ productId, colors, sizes, price, offer, stock, image }) => {
  const variantPayload = [{ colors, sizes, price, offer, stock }];

  const fd = new FormData();
  fd.append("product_id", productId);
  fd.append("variants", JSON.stringify(variantPayload));

  const createRes = await http.post("/variant/", fd);

  // If image provided and we got back a variant id, PATCH it
  if (image && createRes.data?.variant_id) {
    const imgFd = new FormData();
    imgFd.append("images", image);
    await http.patch(`/variant/${createRes.data.variant_id}/`, imgFd);
  }

  return createRes.data;
};

/*
  UPDATE — your partial_update uses serializer, accepts multipart
  PATCH /api/variant/<pk>/
*/
const apiUpdateVariant = (id, { colors, sizes, price, offer, stock, image }) => {
  const fd = new FormData();
  fd.append("colors", colors);
  fd.append("sizes", sizes);
  fd.append("price", price);
  fd.append("offer", offer);
  fd.append("stock", stock);
  if (image) fd.append("images", image);
  return http.patch(`/variant/${id}/`, fd);
};

// DELETE /api/variant/<pk>/
const apiDeleteVariant = (id) => http.delete(`/variant/${id}/`);

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
const fmt = n => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const getVariants = p => p.variant_set ?? p.variants ?? [];

const colorLabel = c => c?.color_name ?? c?.name ?? c?.color ?? "—";
const sizeLabel  = s => s?.size_name  ?? s?.name ?? s?.size  ?? "—";

/* ══════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════ */
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3
      ${type === "success" ? "bg-emerald-600" : "bg-rose-600"}
      text-white text-sm font-semibold px-5 py-3.5 rounded-2xl shadow-2xl`}>
      {type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {msg}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════════ */
function StatCard({ icon: Icon, label, value, sub, color, warn }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 shadow-sm border
      ${warn ? "bg-amber-50 border-amber-200" : "bg-white border-gray-100"}`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
        {warn && <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Alert</span>}
      </div>
      <p className="text-2xl font-black text-gray-900 mt-3 leading-none">{value}</p>
      <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">{label}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════
   VARIANT MODAL
  
  Key fix: sends colors/sizes as FK IDs (integers),
  wraps create payload as { product_id, variants: [...] }
══════════════════════════════════════════════ */
function VariantModal({ mode, initial, productId, onSave, onClose }) {
  const [colors,      setColors]      = useState([]);
  const [sizes,       setSizes]       = useState([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [busy,        setBusy]        = useState(false);
  const [err,         setErr]         = useState(null);
  const [preview,     setPreview]     = useState(initial?.image_url ?? null);
  const fileRef = useRef();

  // form holds FK IDs for colors/sizes
  const [form, setForm] = useState({
    colors: initial?.colors ?? initial?.colors_id ?? "",
    sizes:  initial?.sizes  ?? initial?.sizes_id  ?? "",
    price:  initial?.price  ?? "",
    offer:  initial?.offer  ?? "0",
    stock:  initial?.stock  ?? "",
    image:  null,
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    Promise.all([apiGetColors(), apiGetSizes()])
      .then(([c, s]) => { setColors(c); setSizes(s); })
      .catch(() => {})
      .finally(() => setMetaLoading(false));
  }, []);

  const sellingPrice = form.price && parseFloat(form.offer) > 0
    ? Math.round(parseFloat(form.price) * (1 - parseFloat(form.offer) / 100))
    : null;

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    set("image", f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!form.colors || !form.sizes || !form.price || !form.stock) {
      setErr("Color, Size/Edition, Price and Stock are required.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      if (mode === "add") {
        await apiCreateVariant({
          productId,
          colors: parseInt(form.colors),
          sizes:  parseInt(form.sizes),
          price:  parseFloat(form.price),
          offer:  parseFloat(form.offer || 0),
          stock:  parseInt(form.stock),
          image:  form.image,
        });
      } else {
        await apiUpdateVariant(initial.id, {
          colors: parseInt(form.colors),
          sizes:  parseInt(form.sizes),
          price:  parseFloat(form.price),
          offer:  parseFloat(form.offer || 0),
          stock:  parseInt(form.stock),
          image:  form.image,
        });
      }
      onSave();
    } catch (e) {
      const d = e.response?.data;
      const msg = d
        ? typeof d === "string"
          ? d
          : Object.entries(d).map(([k, v]) =>
              `${k}: ${Array.isArray(v) ? v.join(", ") : v}`
            ).join(" · ")
        : "Something went wrong.";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  const base = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent " +
    "transition-all bg-gray-50 focus:bg-white placeholder:text-gray-300";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[94vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                {mode === "add" ? <Plus size={14} className="text-white" /> : <Edit2 size={13} className="text-white" />}
              </div>
              <h3 className="text-base font-black text-gray-900">
                {mode === "add" ? "Add Variant" : "Edit Variant"}
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-1 ml-9">
              {mode === "add"
                ? `Adding to product #${productId}`
                : `Editing variant #${initial?.id}`}
            </p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {err && (
            <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
              <AlertCircle size={15} className="shrink-0 mt-0.5" /> {err}
            </div>
          )}

          {/* Image */}
          <div>
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
              Variant Image
            </label>
            <div onClick={() => fileRef.current?.click()}
              className="relative border-2 border-dashed border-gray-200 rounded-2xl h-32 cursor-pointer
                hover:border-indigo-400 hover:bg-indigo-50/30 transition-all flex items-center justify-center group">
              {preview ? (
                <div className="flex flex-col items-center gap-1.5">
                  <img src={preview} alt="" className="h-20 object-contain rounded-xl" />
                  <p className="text-[11px] text-indigo-500 font-semibold">Click to replace</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-300 group-hover:text-indigo-400 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                    <Package size={18} />
                  </div>
                  <p className="text-xs font-semibold">Click to upload image</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
            </div>
          </div>

          {/* Color — sends FK id */}
          <div>
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
              Color <span className="text-rose-400">*</span>
            </label>
            {metaLoading ? (
              <div className={base + " animate-pulse text-gray-300"}>Loading colors…</div>
            ) : (
              <div className="relative">
                <select
                  value={form.colors}
                  onChange={e => set("colors", e.target.value)}
                  className={base + " appearance-none pr-10 " + (!form.colors ? "text-gray-300" : "text-gray-800")}
                >
                  <option value="" disabled>— Choose a color —</option>
                  {colors.map((c, i) => (
                    <option key={c.id ?? i} value={c.id}>{colorLabel(c)}</option>
                  ))}
                </select>
                <Palette size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Size — sends FK id */}
          <div>
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
              Edition / Size <span className="text-rose-400">*</span>
            </label>
            {metaLoading ? (
              <div className={base + " animate-pulse text-gray-300"}>Loading sizes…</div>
            ) : (
              <div className="relative">
                <select
                  value={form.sizes}
                  onChange={e => set("sizes", e.target.value)}
                  className={base + " appearance-none pr-10 " + (!form.sizes ? "text-gray-300" : "text-gray-800")}
                >
                  <option value="" disabled>— Choose size / edition —</option>
                  {sizes.map((s, i) => (
                    <option key={s.id ?? i} value={s.id}>{sizeLabel(s)}</option>
                  ))}
                </select>
                <Tag size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Price / Offer / Stock */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                Price <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <IndianRupee size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" min="0" value={form.price}
                  onChange={e => set("price", e.target.value)}
                  placeholder="999" className={"pl-7 " + base} />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Offer %</label>
              <div className="relative">
                <Percent size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" min="0" max="100" value={form.offer}
                  onChange={e => set("offer", e.target.value)}
                  placeholder="0" className={"pl-7 " + base} />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                Stock <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Hash size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" min="0" value={form.stock}
                  onChange={e => set("stock", e.target.value)}
                  placeholder="50" className={"pl-7 " + base} />
              </div>
            </div>
          </div>

          {/* Selling price preview */}
          {sellingPrice && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Selling price</p>
                <p className="text-xl font-black text-indigo-700 mt-0.5">₹{fmt(sellingPrice)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-medium">Savings</p>
                <p className="text-sm font-black text-emerald-600">
                  ₹{fmt(parseFloat(form.price) - sellingPrice)} · {form.offer}% off
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-5 border-t border-gray-100 shrink-0">
          <button onClick={handleSubmit} disabled={busy}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white
              font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            {busy
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
              : <><CheckCircle size={15} /> {mode === "add" ? "Add Variant" : "Save Changes"}</>}
          </button>
          <button onClick={onClose}
            className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-sm transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   VARIANT CHIP
══════════════════════════════════════════════ */
function VariantChip({ variant, onEdit, onDelete }) {
  const offer   = parseFloat(variant.offer ?? 0);
  const price   = parseFloat(variant.price ?? 0);
  const final   = variant.final_price ?? (offer > 0 ? price * (1 - offer / 100) : price);
  const noStock = variant.stock === 0;
  const low     = !noStock && variant.stock <= 5;

  // color label: try nested object first, then plain string fields
  const colorName = variant.colors?.color_name ?? variant.color_name ?? variant.colors ?? "—";
  const sizeName  = variant.sizes?.size_name   ?? variant.size_name  ?? variant.sizes  ?? "—";

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl p-4
      hover:border-indigo-200 hover:shadow-md transition-all relative">

      {/* Actions — appear on hover */}
      <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={() => onEdit(variant)}
          className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100
            flex items-center justify-center hover:bg-indigo-100 transition-colors">
          <Edit2 size={11} className="text-indigo-600" />
        </button>
        <button onClick={() => onDelete(variant.id)}
          className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100
            flex items-center justify-center hover:bg-rose-100 transition-colors">
          <Trash2 size={11} className="text-rose-500" />
        </button>
      </div>

      <div className="flex gap-3">
        {/* Image */}
        <div className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50
          flex items-center justify-center overflow-hidden shrink-0">
          {variant.image_url ?? variant.images
            ? <img src={variant.image_url ?? variant.images} alt={colorName}
                className="w-full h-full object-contain p-0.5" />
            : <Package size={18} className="text-gray-300" />}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 pr-12">
          <p className="text-sm font-black text-gray-900 truncate">{colorName}</p>
          <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">{sizeName}</p>

          <div className="mt-2.5 flex items-end justify-between flex-wrap gap-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-black text-gray-900">₹{fmt(final)}</span>
              {offer > 0 && (
                <>
                  <span className="text-[11px] text-gray-400 line-through">₹{fmt(price)}</span>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    {offer}% off
                  </span>
                </>
              )}
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg
              ${noStock ? "bg-red-50 text-red-500" : low ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"}`}>
              {noStock ? "Out of stock" : low ? `Only ${variant.stock} left` : `${variant.stock} units`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PRODUCT ROW
══════════════════════════════════════════════ */
function ProductRow({ product, onRefresh, onToast }) {
  const [open,     setOpen]     = useState(false);
  const [modal,    setModal]    = useState(null);   // { mode: "add"|"edit", variant?: obj }
  const [deleting, setDeleting] = useState(null);

  const variants   = getVariants(product);
  const totalStock = variants.reduce((a, v) => a + (v.stock ?? 0), 0);
  const minPrice   = variants.length
    ? Math.min(...variants.map(v => parseFloat(v.final_price ?? v.price ?? 0)))
    : null;
  const lowCount   = variants.filter(v => v.stock <= 5 && v.stock > 0).length;
  const outCount   = variants.filter(v => v.stock === 0).length;

  const handleDelete = async id => {
    if (!window.confirm("Delete this variant permanently?")) return;
    setDeleting(id);
    try {
      await apiDeleteVariant(id);
      onToast("Variant deleted.", "success");
      onRefresh();
    } catch {
      onToast("Could not delete variant.", "error");
    } finally { setDeleting(null); }
  };

  const handleSave = () => {
    onToast(modal.mode === "add" ? "Variant added!" : "Variant updated!", "success");
    setModal(null);
    onRefresh();
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
        hover:shadow-md hover:border-indigo-100 transition-all">

        {/* ── Collapsed header ── */}
        <div className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none"
          onClick={() => setOpen(o => !o)}>
<div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
  <img
    src={
      product.product_image
        ? product.product_image.startsWith("http")
          ? product.product_image
          : `http://127.0.0.1:8000${product.product_image}`
        : "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300&auto=format&fit=crop&q=60"
    }
    alt={product.name}
    className="w-full h-full object-contain p-0.5"
    onError={(e) => {
      e.currentTarget.src =
        "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300&auto=format&fit=crop&q=60";
    }}
  />
</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[15px] font-black text-gray-900 truncate">{product.name}</span>
              {product.categorie_name && (
                <span className="text-[10px] font-black bg-indigo-50 text-indigo-600
                  px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  {product.categorie_name}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{product.brand}</p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                <Layers size={10} /> {variants.length} variant{variants.length !== 1 ? "s" : ""}
              </span>
              {minPrice !== null && (
                <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                  <IndianRupee size={10} /> from ₹{fmt(minPrice)}
                </span>
              )}
              <span className={`text-[11px] font-black flex items-center gap-1
                ${totalStock === 0 ? "text-red-500" : totalStock <= 10 ? "text-amber-500" : "text-emerald-600"}`}>
                <Boxes size={10} /> {totalStock} in stock
              </span>
              {outCount > 0 && (
                <span className="text-[11px] font-black text-red-400 flex items-center gap-1">
                  <TrendingDown size={10} /> {outCount} out of stock
                </span>
              )}
              {lowCount > 0 && (
                <span className="text-[11px] font-black text-amber-500">
                  {lowCount} low
                </span>
              )}
            </div>
          </div>

          <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors
            ${open ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"}`}>
            {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
        </div>

        {/* ── Expanded variants ── */}
        {open && (
          <div className="border-t border-gray-100 p-5 bg-slate-50/60">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                {variants.length} Variant{variants.length !== 1 ? "s" : ""}
              </span>
              <button
                onClick={e => { e.stopPropagation(); setModal({ mode: "add" }); }}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700
                  text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors">
                <Plus size={12} /> Add Variant
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                <Sparkles size={28} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-black text-gray-400 mb-1">No variants yet</p>
                <p className="text-xs text-gray-300 mb-4">Variants hold color, size, price & stock info</p>
                <button onClick={() => setModal({ mode: "add" })}
                  className="text-xs font-black text-indigo-600 hover:underline">
                  + Add first variant
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {variants.map(v => (
                  <VariantChip
                    key={v.id}
                    variant={v}
                    onEdit={variant => setModal({ mode: "edit", variant })}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {modal && (
        <VariantModal
          mode={modal.mode}
          initial={modal.mode === "edit" ? modal.variant : null}
          productId={product.id}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

/* ══════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════ */
export default function SellerDashboard() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState("");
  const [toast,    setToast]    = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try   { setProducts(await apiGetProducts()); }
    catch (e) {
      console.error(e);
      setError("Could not load products. Check your connection.");
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const notify = useCallback((msg, type = "success") => setToast({ msg, type }), []);

  const filtered = products.filter(p =>
    [p.name, p.brand, p.categorie_name].some(f =>
      (f ?? "").toLowerCase().includes(search.toLowerCase())
    )
  );

  const allVariants = products.flatMap(p => getVariants(p));
  const totalStock  = allVariants.reduce((a, v) => a + (v.stock ?? 0), 0);
  const lowCount    = allVariants.filter(v => v.stock <= 5 && v.stock > 0).length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Sticky header ── */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600
              shadow-lg shadow-indigo-200 flex items-center justify-center">
              <ShoppingBag size={17} className="text-white" />
            </div>
            <div>
              <p className="text-base font-black text-gray-900 leading-none">Seller Hub</p>
              <p className="text-[11px] text-gray-400 leading-none mt-0.5">Product Management</p>
            </div>
          </div>
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500
              hover:text-indigo-600 transition-colors disabled:opacity-40">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={ShoppingBag} label="Products"       value={products.length} sub="in your store"      color="bg-indigo-500" />
          <StatCard icon={Layers}      label="Total Variants" value={allVariants.length} sub="across all products" color="bg-violet-500" />
          <StatCard icon={Boxes}       label="Total Stock"    value={totalStock}      sub="units available"    color="bg-emerald-500" />
          <StatCard icon={AlertCircle} label="Low Stock"      value={lowCount}        sub="variants ≤ 5 units"
            color={lowCount > 0 ? "bg-amber-500" : "bg-gray-400"} warn={lowCount > 0} />
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products by name, brand or category…"
            className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2
                w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
              <X size={12} className="text-gray-500" />
            </button>
          )}
        </div>

        {/* ── Product list ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-11 h-11 rounded-full border-[3px] border-gray-200 border-t-indigo-500 animate-spin" />
            <p className="text-sm font-bold text-gray-400">Loading your products…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-28 bg-white
            rounded-2xl border border-gray-100 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
              <AlertCircle size={26} className="text-rose-400" />
            </div>
            <p className="text-base font-black text-gray-800 mb-1">Failed to load</p>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">{error}</p>
            <button onClick={load}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold
                text-sm px-6 py-2.5 rounded-xl transition-colors">
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 bg-white
            rounded-2xl border border-gray-100 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Package size={24} className="text-gray-400" />
            </div>
            <p className="text-base font-black text-gray-700 mb-1">
              {search ? "No products match" : "No products yet"}
            </p>
            <p className="text-sm text-gray-400">
              {search ? "Try a different keyword or clear the search" : "Add products from the admin panel first"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              {search ? " · filtered" : ""}
            </p>
            {filtered.map(p => (
              <ProductRow key={p.id} product={p} onRefresh={load} onToast={notify} />
            ))}
          </div>
        )}
      </main>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}