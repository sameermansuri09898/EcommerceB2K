import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import {
  Package, Edit2, Trash2, Plus, X, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle, ShoppingBag, Search, RefreshCw,
  Layers, IndianRupee, Boxes, Percent, Hash, Palette, Tag,
  TrendingDown, Sparkles, Store, BarChart2, Eye, ImageOff,
  ArrowUpRight, Filter, ChevronRight, Star, Zap
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
   API CALLS
══════════════════════════════════════════════ */
const apiGetProducts = () =>
  http.get("user/productlist/").then(r => r.data?.results ?? r.data ?? []);

const apiGetColors = () =>
  http.get("/VariantColorView/").then(r => r.data?.results ?? r.data ?? []);

const apiGetSizes = () =>
  http.get("/VariantSizeView/").then(r => r.data?.results ?? r.data ?? []);

/*
  FIX: Do NOT send `variants` JSON key — that triggers the bulk-create path
  which ignores images. Instead send fields directly so the backend uses
  the single-variant serializer path that supports image files.
*/
const apiCreateVariant = async ({ productId, colors, sizes, price, offer, stock, image }) => {
  const fd = new FormData();
  fd.append("product_id", productId);   // backend also checks "product"
  fd.append("product", productId);
  fd.append("colors", colors);
  fd.append("sizes", sizes);
  fd.append("price", price);
  fd.append("offer", offer ?? 0);
  fd.append("stock", stock);
  if (image) fd.append("images", image);
  // NOTE: we deliberately do NOT append "variants" key — that would
  // route to the bulk JSON path which drops image files.
  return http.post("/variant/", fd).then(r => r.data);
};

const apiUpdateVariant = (id, { colors, sizes, price, offer, stock, image }) => {
  const fd = new FormData();
  fd.append("colors", colors);
  fd.append("sizes", sizes);
  fd.append("price", price);
  fd.append("offer", offer ?? 0);
  fd.append("stock", stock);
  if (image) fd.append("images", image);
  return http.patch(`/variant/${id}/`, fd);
};

const apiDeleteVariant = (id) => http.delete(`/variant/${id}/`);

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
const fmt = n => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
const getVariants = p => p.variant_set ?? p.variants ?? [];
const colorLabel = c => c?.color_name ?? c?.name ?? c?.color ?? "—";
const sizeLabel  = s => s?.size_name  ?? s?.name ?? s?.size  ?? "—";
const imgSrc = url =>
  !url ? null : url.startsWith("http") ? url : `http://127.0.0.1:8000${url}`;
const FALLBACK = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=60";

/* ══════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════ */
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3
      ${type === "success" ? "bg-slate-900" : "bg-rose-600"}
      text-white text-sm font-semibold px-5 py-3.5 rounded-2xl shadow-2xl animate-slide-up`}>
      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0
        ${type === "success" ? "bg-emerald-400" : "bg-rose-400"}`}>
        {type === "success" ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
      </span>
      {msg}
      <button onClick={onClose} className="ml-1 opacity-50 hover:opacity-100"><X size={13} /></button>
    </div>
  );
}

/* ══════════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════════ */
function StatCard({ icon: Icon, label, value, sub, accent, warn, trend }) {
  return (
    <div className={`relative rounded-2xl p-5 overflow-hidden transition-all hover:scale-[1.02]
      ${warn ? "bg-amber-50 border border-amber-200" : "bg-white border border-gray-100 shadow-sm hover:shadow-md"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon size={16} className="text-white" />
        </div>
        {warn && (
          <span className="flex items-center gap-1 text-[10px] font-black text-amber-600
            bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
            <Zap size={9} /> Alert
          </span>
        )}
        {trend && (
          <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
            <ArrowUpRight size={11} />{trend}
          </span>
        )}
      </div>
      <p className="text-[28px] font-black text-gray-900 leading-none tracking-tight">{value}</p>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">{label}</p>
      {sub && <p className="text-[11px] text-gray-300 mt-0.5">{sub}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════
   VARIANT MODAL — image fix applied
══════════════════════════════════════════════ */
function VariantModal({ mode, initial, productId, productName, onSave, onClose }) {
  const [colors, setColors] = useState([]);
  const [sizes, setSizes]   = useState([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [busy, setBusy]     = useState(false);
  const [err, setErr]       = useState(null);
  const [preview, setPreview] = useState(imgSrc(initial?.image_url ?? initial?.images) ?? null);
  const fileRef = useRef();

  const [form, setForm] = useState({
    colors: initial?.colors?.id ?? initial?.colors_id ?? initial?.colors ?? "",
    sizes:  initial?.sizes?.id  ?? initial?.sizes_id  ?? initial?.sizes  ?? "",
    price:  initial?.price ?? "",
    offer:  initial?.offer ?? "0",
    stock:  initial?.stock ?? "",
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
    ? Math.round(parseFloat(form.price) * (1 - parseFloat(form.offer) / 100)) : null;
  const savings = sellingPrice ? parseFloat(form.price) - sellingPrice : 0;

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    set("image", f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!form.colors || !form.sizes || !form.price || !form.stock) {
      setErr("Color, Size, Price and Stock are all required.");
      return;
    }
    setBusy(true); setErr(null);
    try {
      const payload = {
        colors: parseInt(form.colors),
        sizes:  parseInt(form.sizes),
        price:  parseFloat(form.price),
        offer:  parseFloat(form.offer || 0),
        stock:  parseInt(form.stock),
        image:  form.image,
      };
      if (mode === "add") {
        await apiCreateVariant({ productId, ...payload });
      } else {
        await apiUpdateVariant(initial.id, payload);
      }
      onSave();
    } catch (e) {
      const d = e.response?.data;
      const msg = d
        ? typeof d === "string" ? d
          : Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" · ")
        : "Something went wrong.";
      setErr(msg);
    } finally { setBusy(false); }
  };

  const inp = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent " +
    "bg-gray-50 focus:bg-white placeholder:text-gray-300 transition-all";

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[95vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-base font-black text-gray-900">
              {mode === "add" ? "Add Variant" : "Edit Variant"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[260px]">
              {mode === "add" ? `→ ${productName}` : `Variant #${initial?.id}`}
            </p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-400">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {err && (
            <div className="flex gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{err}</span>
            </div>
          )}

          {/* Image uploader */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
              Variant Image
            </label>
            <div onClick={() => fileRef.current?.click()}
              className="relative border-2 border-dashed border-gray-200 rounded-2xl h-36 cursor-pointer
                hover:border-orange-400 hover:bg-orange-50/20 transition-all flex items-center justify-center group overflow-hidden">
              {preview ? (
                <>
                  <img src={preview} alt="" className="h-28 object-contain rounded-xl" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity
                    flex items-center justify-center rounded-2xl">
                    <p className="text-white text-xs font-bold">Click to replace</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-300 group-hover:text-orange-400 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                    <Package size={20} />
                  </div>
                  <p className="text-xs font-bold">Upload variant image</p>
                  <p className="text-[11px] text-gray-300">PNG, JPG up to 5MB</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
            </div>
          </div>

          {/* Color + Size row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                Color <span className="text-rose-400">*</span>
              </label>
              {metaLoading ? (
                <div className={inp + " animate-pulse text-gray-300 h-10"} />
              ) : (
                <div className="relative">
                  <select value={form.colors} onChange={e => set("colors", e.target.value)}
                    className={inp + " appearance-none pr-8 " + (!form.colors ? "text-gray-300" : "text-gray-800")}>
                    <option value="" disabled>Color</option>
                    {colors.map((c, i) => <option key={c.id ?? i} value={c.id}>{colorLabel(c)}</option>)}
                  </select>
                  <Palette size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              )}
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                Size / Edition <span className="text-rose-400">*</span>
              </label>
              {metaLoading ? (
                <div className={inp + " animate-pulse text-gray-300 h-10"} />
              ) : (
                <div className="relative">
                  <select value={form.sizes} onChange={e => set("sizes", e.target.value)}
                    className={inp + " appearance-none pr-8 " + (!form.sizes ? "text-gray-300" : "text-gray-800")}>
                    <option value="" disabled>Size</option>
                    {sizes.map((s, i) => <option key={s.id ?? i} value={s.id}>{sizeLabel(s)}</option>)}
                  </select>
                  <Tag size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          {/* Price / Offer / Stock */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "MRP Price", key: "price", icon: IndianRupee, placeholder: "999", required: true },
              { label: "Offer %",   key: "offer", icon: Percent,     placeholder: "0"   },
              { label: "Stock",     key: "stock", icon: Hash,        placeholder: "50", required: true },
            ].map(({ label, key, icon: Icon, placeholder, required }) => (
              <div key={key}>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                  {label} {required && <span className="text-rose-400">*</span>}
                </label>
                <div className="relative">
                  <Icon size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="number" min="0" max={key === "offer" ? 100 : undefined}
                    value={form[key]} onChange={e => set(key, e.target.value)}
                    placeholder={placeholder} className={"pl-7 " + inp} />
                </div>
              </div>
            ))}
          </div>

          {/* Selling price preview */}
          {sellingPrice && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100
              rounded-2xl px-4 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-orange-400 font-black uppercase tracking-widest">Selling Price</p>
                <p className="text-2xl font-black text-gray-900 mt-0.5">₹{fmt(sellingPrice)}</p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-green-100 text-green-700 text-xs font-black px-2.5 py-1 rounded-full">
                  {form.offer}% OFF
                </span>
                <p className="text-[11px] text-gray-400 mt-1.5">Save ₹{fmt(savings)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-5 border-t border-gray-100 shrink-0">
          <button onClick={handleSubmit} disabled={busy}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white
              font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            {busy
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
              : <><CheckCircle size={14} /> {mode === "add" ? "Add Variant" : "Save Changes"}</>}
          </button>
          <button onClick={onClose}
            className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-sm transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   VARIANT CARD
══════════════════════════════════════════════ */
function VariantCard({ variant, onEdit, onDelete }) {
  const offer     = parseFloat(variant.offer ?? 0);
  const price     = parseFloat(variant.price ?? 0);
  const final     = variant.final_price ?? (offer > 0 ? price * (1 - offer / 100) : price);
  const noStock   = variant.stock === 0;
  const low       = !noStock && variant.stock <= 5;
  const colorName = variant.colors?.color_name ?? variant.color_name ?? (typeof variant.colors === "string" ? variant.colors : "—");
  const sizeName  = variant.sizes?.size_name   ?? variant.size_name  ?? (typeof variant.sizes  === "string" ? variant.sizes  : "—");
  const image     = imgSrc(variant.image_url ?? variant.images);

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden
      hover:border-orange-200 hover:shadow-lg transition-all duration-200">

      {/* Image */}
      <div className="relative h-36 bg-gray-50 overflow-hidden">
        {image ? (
          <img src={image} alt={colorName}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.currentTarget.src = FALLBACK; }} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-gray-200">
            <ImageOff size={22} />
            <p className="text-[11px] font-medium">No image</p>
          </div>
        )}

        {/* Stock badge */}
        <div className={`absolute top-2.5 left-2.5 text-[10px] font-black px-2 py-0.5 rounded-full
          ${noStock ? "bg-red-100 text-red-600" : low ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
          {noStock ? "Out of stock" : low ? `Only ${variant.stock} left` : `${variant.stock} in stock`}
        </div>

        {/* Hover actions */}
        <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(variant)}
            className="w-7 h-7 rounded-lg bg-white shadow-md flex items-center justify-center hover:bg-blue-50 transition-colors">
            <Edit2 size={11} className="text-blue-600" />
          </button>
          <button onClick={() => onDelete(variant.id)}
            className="w-7 h-7 rounded-lg bg-white shadow-md flex items-center justify-center hover:bg-rose-50 transition-colors">
            <Trash2 size={11} className="text-rose-500" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="px-3.5 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-black text-gray-900 truncate">{colorName}</p>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5 truncate">{sizeName}</p>
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-base font-black text-gray-900">₹{fmt(final)}</span>
          {offer > 0 && (
            <>
              <span className="text-[11px] text-gray-400 line-through">₹{fmt(price)}</span>
              <span className="text-[10px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">
                {offer}% off
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PRODUCT ROW
══════════════════════════════════════════════ */
function ProductRow({ product, onRefresh, onToast }) {
  const [open,   setOpen]   = useState(false);
  const [modal,  setModal]  = useState(null);
  const [deleting, setDeleting] = useState(null);

  const variants   = getVariants(product);
  const totalStock = variants.reduce((a, v) => a + (v.stock ?? 0), 0);
  const minPrice   = variants.length ? Math.min(...variants.map(v => parseFloat(v.final_price ?? v.price ?? 0))) : null;
  const outCount   = variants.filter(v => v.stock === 0).length;
  const lowCount   = variants.filter(v => v.stock <= 5 && v.stock > 0).length;

  const handleDelete = async id => {
    if (!window.confirm("Delete this variant permanently?")) return;
    setDeleting(id);
    try {
      await apiDeleteVariant(id);
      onToast("Variant deleted.", "success");
      onRefresh();
    } catch { onToast("Could not delete variant.", "error"); }
    finally  { setDeleting(null); }
  };

  const handleSave = () => {
    onToast(modal.mode === "add" ? "Variant added successfully!" : "Variant updated!", "success");
    setModal(null);
    onRefresh();
  };

  const thumb = imgSrc(product.product_image);

  return (
    <>
      <div className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200
        ${open ? "border-orange-200 shadow-md" : "border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md"}`}>

        {/* Header */}
        <div className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none"
          onClick={() => setOpen(o => !o)}>

          <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
            <img src={thumb ?? FALLBACK} alt={product.name}
              className="w-full h-full object-contain p-1"
              onError={e => { e.currentTarget.src = FALLBACK; }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[15px] font-black text-gray-900 truncate">{product.name}</span>
              {product.categorie_name && (
                <span className="hidden sm:inline text-[10px] font-bold bg-blue-50 text-blue-600
                  px-2.5 py-0.5 rounded-full uppercase tracking-wide shrink-0">
                  {product.categorie_name}
                </span>
              )}
            </div>

            {product.brand && (
              <p className="text-xs text-gray-400 font-medium mt-0.5">{product.brand}</p>
            )}

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <Pill color="gray"><Layers size={9} /> {variants.length} variant{variants.length !== 1 ? "s" : ""}</Pill>
              {minPrice !== null && (
                <Pill color="gray"><IndianRupee size={9} />from ₹{fmt(minPrice)}</Pill>
              )}
              <Pill color={totalStock === 0 ? "red" : totalStock <= 10 ? "amber" : "green"}>
                <Boxes size={9} /> {totalStock} in stock
              </Pill>
              {outCount > 0 && <Pill color="red"><TrendingDown size={9} /> {outCount} out of stock</Pill>}
              {lowCount > 0 && <Pill color="amber">⚡ {lowCount} low</Pill>}
            </div>
          </div>

          <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors
            ${open ? "bg-orange-100 text-orange-600 rotate-180" : "bg-gray-100 text-gray-400"}`}
            style={{ transition: "transform 0.2s, background 0.15s" }}>
            <ChevronDown size={15} />
          </div>
        </div>

        {/* Expanded */}
        {open && (
          <div className="border-t border-gray-100 p-5 bg-slate-50/50">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                {variants.length} Variant{variants.length !== 1 ? "s" : ""}
              </p>
              <button onClick={e => { e.stopPropagation(); setModal({ mode: "add" }); }}
                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600
                  text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors">
                <Plus size={12} /> Add Variant
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="text-center py-14 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Package size={22} className="text-gray-300" />
                </div>
                <p className="text-sm font-black text-gray-500 mb-1">No variants yet</p>
                <p className="text-xs text-gray-300 mb-4">Add color, size, price & stock details</p>
                <button onClick={() => setModal({ mode: "add" })}
                  className="text-xs font-black text-orange-500 hover:text-orange-600">
                  + Add first variant →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {variants.map(v => (
                  <VariantCard
                    key={v.id} variant={v}
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
          productName={product.name}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

/* small pill badge */
function Pill({ color, children }) {
  const map = {
    gray:  "text-gray-500 bg-gray-100",
    green: "text-green-700 bg-green-100",
    red:   "text-red-600 bg-red-100",
    amber: "text-amber-700 bg-amber-100",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${map[color] ?? map.gray}`}>
      {children}
    </span>
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
  const [filter,   setFilter]   = useState("all"); // all | low | out

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try   { setProducts(await apiGetProducts()); }
    catch (e) { console.error(e); setError("Could not load products. Check your connection."); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const notify = useCallback((msg, type = "success") => setToast({ msg, type }), []);

  const allVariants = products.flatMap(p => getVariants(p));
  const totalStock  = allVariants.reduce((a, v) => a + (v.stock ?? 0), 0);
  const lowCount    = allVariants.filter(v => v.stock <= 5 && v.stock > 0).length;
  const outCount    = allVariants.filter(v => v.stock === 0).length;

  const filtered = products
    .filter(p => [p.name, p.brand, p.categorie_name].some(f =>
      (f ?? "").toLowerCase().includes(search.toLowerCase())
    ))
    .filter(p => {
      if (filter === "low") return getVariants(p).some(v => v.stock <= 5 && v.stock > 0);
      if (filter === "out") return getVariants(p).some(v => v.stock === 0);
      return true;
    });

  return (
    <div className="min-h-screen bg-[#F4F5F7] font-sans">

      {/* ── Header ── */}
      <header className="bg-[#131921] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Store size={18} className="text-orange-400" />
            <span className="text-white font-black text-base tracking-tight">seller</span>
            <span className="text-orange-400 font-black text-base">hub</span>
          </div>

          {/* Search bar */}
          <div className="flex-1 relative max-w-xl mx-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-9 pr-8 py-2 bg-white border-0 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm"
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>

          <button onClick={load} disabled={loading}
            className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-gray-300
              hover:text-white transition-colors disabled:opacity-40">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">{loading ? "Loading…" : "Refresh"}</span>
          </button>
        </div>
      </header>

      {/* ── Orange accent bar ── */}
      <div className="h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={ShoppingBag} label="Products"     value={products.length}    sub="in your catalog"       accent="bg-blue-500" />
          <StatCard icon={Layers}      label="Variants"     value={allVariants.length} sub="across all products"   accent="bg-violet-500" />
          <StatCard icon={Boxes}       label="Total Stock"  value={fmt(totalStock)}    sub="units available"       accent="bg-emerald-500" />
          <StatCard icon={AlertCircle} label="Stock Alerts" value={outCount + lowCount}
            sub={`${outCount} out · ${lowCount} low`}
            accent={lowCount + outCount > 0 ? "bg-orange-500" : "bg-gray-400"}
            warn={lowCount + outCount > 0} />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: "all", label: "All Products", count: products.length },
            { key: "low", label: "Low Stock",    count: lowCount },
            { key: "out", label: "Out of Stock", count: outCount },
          ].map(({ key, label, count }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full transition-all
                ${filter === key
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-orange-300"}`}>
              {label}
              <span className={`text-[10px] font-black px-1.5 rounded-full
                ${filter === key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Product list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 rounded-full border-[3px] border-gray-200 border-t-orange-500 animate-spin" />
            <p className="text-sm font-bold text-gray-400">Loading your products…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-28 bg-white
            rounded-2xl border border-gray-100 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
              <AlertCircle size={24} className="text-rose-400" />
            </div>
            <p className="text-base font-black text-gray-800 mb-1">Failed to load products</p>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">{error}</p>
            <button onClick={load}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors">
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 bg-white
            rounded-2xl border border-gray-100 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Package size={22} className="text-gray-400" />
            </div>
            <p className="text-base font-black text-gray-700 mb-1">
              {search ? "No products match your search" : "No products found"}
            </p>
            <p className="text-sm text-gray-400">
              {search ? "Try a different keyword" : "Add products from the admin panel"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
              Showing {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              {search ? ` matching "${search}"` : ""}
              {filter !== "all" ? ` · ${filter} stock` : ""}
            </p>
            {filtered.map(p => (
              <ProductRow key={p.id} product={p} onRefresh={load} onToast={notify} />
            ))}
          </div>
        )}
      </main>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.25s ease; }
      `}</style>
    </div>
  );
}