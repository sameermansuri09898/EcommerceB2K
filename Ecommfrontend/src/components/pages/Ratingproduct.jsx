import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Star, CheckCircle, AlertCircle, Loader2, X, Edit2, Send } from "lucide-react";

const API = "http://127.0.0.1:8000/api";

/* ── auth ── */
function getToken() {
  const t = localStorage.getItem("access");
  if (!t) return null;
  try {
    const p = JSON.parse(atob(t.split(".")[1]));
    if (p.exp * 1000 < Date.now()) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      return null;
    }
    return t;
  } catch { return null; }
}
const authHeaders = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

/* ══════════════════════════════════════════
   STAR COMPONENT
══════════════════════════════════════════ */
function StarRow({ value, onChange, readonly = false, size = 28 }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange(n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          className={`transition-transform ${!readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"} focus:outline-none`}
          aria-label={`Rate ${n} star${n !== 1 ? "s" : ""}`}
        >
          <Star
            size={size}
            className={`transition-colors ${
              n <= display
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-gray-300 dark:text-gray-600"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   TOAST
══════════════════════════════════════════ */
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl
        shadow-2xl text-sm font-semibold text-white
        ${type === "success" ? "bg-emerald-600" : "bg-rose-600"}`}
    >
      {type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      {msg}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100">
        <X size={13} />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════
   SINGLE REVIEW CARD
══════════════════════════════════════════ */
function ReviewCard({ review, isOwn }) {
  const initials = (review.user_name ?? review.user ?? "U")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const colors = [
    "bg-indigo-100 text-indigo-700",
    "bg-teal-100 text-teal-700",
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
    "bg-violet-100 text-violet-700",
  ];
  const color = colors[(review.user ?? "").length % colors.length];

  return (
    <div
      className={`flex gap-4 p-5 rounded-2xl border transition-shadow
        ${isOwn
          ? "border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/30 dark:border-indigo-800"
          : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
        }`}
    >
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${color}`}
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {review.user_name ?? review.user ?? "Verified Buyer"}
              {isOwn && (
                <span className="ml-2 text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                  Your review
                </span>
              )}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRow value={review.rating} readonly size={14} />
              <span className="text-[11px] text-gray-400 font-medium">
                {review.rating}.0 / 5.0
              </span>
            </div>
          </div>
          {review.created_at && (
            <span className="text-[11px] text-gray-400 shrink-0">
              {new Date(review.created_at).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </span>
          )}
        </div>

        {review.review && (
          <p className="mt-2.5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {review.review}
          </p>
        )}

        {/* Variant tag */}
        {(review.variant_color || review.variant_size) && (
          <p className="mt-2 text-[11px] text-gray-400">
            Variant: {[review.variant_color, review.variant_size].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   RATING SUMMARY BAR
══════════════════════════════════════════ */
function RatingSummary({ reviews }) {
  if (!reviews.length) return null;
  const avg = reviews.reduce((s, r) => s + parseFloat(r.rating), 0) / reviews.length;
  const counts = [5, 4, 3, 2, 1].map((n) => ({
    star: n,
    count: reviews.filter((r) => Math.round(parseFloat(r.rating)) === n).length,
  }));

  return (
    <div className="flex flex-col sm:flex-row gap-6 p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl mb-6">
      {/* Big number */}
      <div className="flex flex-col items-center justify-center sm:border-r border-gray-100 dark:border-gray-800 sm:pr-6 shrink-0">
        <p className="text-5xl font-black text-gray-900 dark:text-white leading-none">
          {avg.toFixed(1)}
        </p>
        <StarRow value={Math.round(avg)} readonly size={18} />
        <p className="text-xs text-gray-400 mt-1.5">
          {reviews.length} review{reviews.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Bar breakdown */}
      <div className="flex-1 space-y-2">
        {counts.map(({ star, count }) => {
          const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
          return (
            <div key={star} className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500 w-4 shrink-0">{star}</span>
              <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" />
              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8 text-right shrink-0">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN RATING WIDGET
  Props:
    productId  — required
    variants   — array of { id, color_name, size_name } for dropdown
    existingRating — optional prefetch of user's own rating
    allReviews     — optional prefetch of all reviews
══════════════════════════════════════════ */
export default function ProductRating({
  productId,
  variants = [],
  existingRating = null,
  allReviews: initialReviews = [],
}) {
  /* ── state ── */
  const [rating,    setRating]    = useState(existingRating?.rating ?? 0);
  const [review,    setReview]    = useState(existingRating?.review ?? "");
  const [variantId, setVariantId] = useState(
    existingRating?.variants ?? variants[0]?.id ?? ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [toast,      setToast]      = useState(null);
  const [reviews,    setReviews]    = useState(initialReviews);
  const [myRating,   setMyRating]   = useState(existingRating);
  const [editing,    setEditing]    = useState(!existingRating);
  const [loadingReviews, setLoadingReviews] = useState(!initialReviews.length);

  const token    = getToken();
  const loggedIn = !!token;

  /* ── fetch reviews on mount ── */
  useEffect(() => {
    if (initialReviews.length) { setLoadingReviews(false); return; }
    (async () => {
      try {
        const res = await axios.get(`${API}/ratings/`, {
          params: { product: productId },
          headers: authHeaders(),
        });
        const data = res.data?.results ?? res.data ?? [];
        setReviews(data);

        /* pre-fill user's own rating if logged in */
        if (loggedIn) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const userId  = payload.user_id ?? payload.id;
          const own     = data.find((r) => r.user === userId || r.user_id === userId);
          if (own) {
            setMyRating(own);
            setRating(own.rating);
            setReview(own.review ?? "");
            setVariantId(own.variants ?? own.variant ?? variantId);
            setEditing(false);
          }
        }
      } catch (e) {
        console.error("Failed to load reviews", e);
      } finally {
        setLoadingReviews(false);
      }
    })();
  }, [productId]);

  /* ── submit ── */
  const handleSubmit = useCallback(async () => {
    if (!loggedIn) { setToast({ msg: "Please log in to rate this product.", type: "error" }); return; }
    if (!rating)   { setToast({ msg: "Please select a star rating.", type: "error" }); return; }
    if (!variantId){ setToast({ msg: "Please select a variant.", type: "error" }); return; }

    setSubmitting(true);
    try {
      const res = await axios.post(
        `${API}/ratings/`,
        { product: productId, variants: variantId, rating, review },
        { headers: { "Content-Type": "application/json", ...authHeaders() } }
      );
      const saved = res.data;
      setMyRating(saved);
      setEditing(false);
      setToast({ msg: myRating ? "Review updated!" : "Review submitted!", type: "success" });

      /* update local list */
      setReviews((prev) => {
        const exists = prev.find((r) => r.id === saved.id);
        return exists ? prev.map((r) => (r.id === saved.id ? saved : r)) : [saved, ...prev];
      });
    } catch (e) {
      const d = e.response?.data;
      setToast({
        msg: d ? (typeof d === "string" ? d : Object.values(d).flat().join(" · ")) : "Failed to submit.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }, [loggedIn, rating, review, variantId, productId, myRating]);

  const selectedVariant = variants.find((v) => v.id == variantId);
  const othersReviews   = reviews.filter((r) => r.id !== myRating?.id);

  /* ── label ── */
  const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 sm:px-0 font-sans">

      {/* ─ Rating Summary ─ */}
      {reviews.length > 0 && <RatingSummary reviews={reviews} />}

      {/* ─ Write / Edit Form ─ */}
      {loggedIn && (
        <div className={`mb-6 rounded-2xl border p-6 transition-all
          ${editing
            ? "border-indigo-200 bg-indigo-50/40 dark:bg-indigo-950/20 dark:border-indigo-800"
            : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
          }`}>

          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {myRating ? "Your review" : "Rate this product"}
            </h3>
            {myRating && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600
                  hover:text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                <Edit2 size={12} /> Edit review
              </button>
            )}
          </div>

          {!editing && myRating ? (
            /* ─ Readonly own review ─ */
            <ReviewCard review={myRating} isOwn />
          ) : (
            /* ─ Edit form ─ */
            <div className="space-y-5">

              {/* Star picker */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                  Your rating <span className="text-rose-400">*</span>
                </p>
                <div className="flex items-center gap-3">
                  <StarRow value={rating} onChange={setRating} size={32} />
                  {rating > 0 && (
                    <span className="text-sm font-bold text-amber-500">
                      {ratingLabels[rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Variant selector */}
              {variants.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                    Variant <span className="text-rose-400">*</span>
                  </p>
                  <select
                    value={variantId}
                    onChange={(e) => setVariantId(e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5
                      text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200
                      focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none"
                  >
                    <option value="">— Select variant —</option>
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {[v.color_name ?? v.color, v.size_name ?? v.size]
                          .filter(Boolean).join(" · ")}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Review text */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                  Written review <span className="text-gray-300">(optional)</span>
                </p>
                <textarea
                  rows={4}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  maxLength={1000}
                  placeholder="What did you like or dislike? How was the quality, fit, or delivery?"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3
                    text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200
                    placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400
                    resize-none leading-relaxed transition-all"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[11px] text-gray-300">Be honest and helpful for other buyers</span>
                  <span className={`text-[11px] font-medium ${review.length > 900 ? "text-rose-400" : "text-gray-400"}`}>
                    {review.length}/1000
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !rating}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700
                    disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold
                    py-3 rounded-xl text-sm transition-colors"
                >
                  {submitting
                    ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
                    : <><Send size={14} /> {myRating ? "Update review" : "Submit review"}</>}
                </button>
                {myRating && (
                  <button
                    onClick={() => { setEditing(false); setRating(myRating.rating); setReview(myRating.review ?? ""); }}
                    className="px-5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm
                      font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─ Not logged in nudge ─ */}
      {!loggedIn && (
        <div className="mb-6 border border-dashed border-gray-200 dark:border-gray-700
          rounded-2xl p-6 text-center">
          <Star size={28} className="fill-amber-300 text-amber-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Share your experience
          </p>
          <p className="text-xs text-gray-400 mb-4">Log in to rate and review this product</p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700
              text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Log in to review
          </a>
        </div>
      )}

      {/* ─ All Reviews ─ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Customer reviews
            {reviews.length > 0 && (
              <span className="ml-2 text-[11px] font-bold bg-gray-100 dark:bg-gray-800
                text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                {reviews.length}
              </span>
            )}
          </h3>
        </div>

        {loadingReviews ? (
          <div className="flex justify-center py-12">
            <Loader2 size={22} className="animate-spin text-gray-300" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-14 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
            <Star size={28} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-400 mb-1">No reviews yet</p>
            <p className="text-xs text-gray-300">Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Show own review at top if not in edit mode */}
            {myRating && !editing && (
              <ReviewCard key={myRating.id} review={myRating} isOwn />
            )}
            {othersReviews.map((r) => (
              <ReviewCard key={r.id} review={r} isOwn={false} />
            ))}
          </div>
        )}
      </div>

      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}