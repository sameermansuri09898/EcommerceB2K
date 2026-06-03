import { Plus, Minus, Trash2, Tag, ChevronRight, ShieldCheck, RotateCcw, Truck, X } from 'lucide-react'
import React, { useState, useEffect } from 'react'

const BASE_URL = 'http://127.0.0.1:8000'

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (val) =>
  Number(parseFloat(val)).toLocaleString('en-IN', { maximumFractionDigits: 2 })

// ── subcomponents ─────────────────────────────────────────────────────────────
function CartItem({ item, onQtyChange, onRemove }) {
  return (
    <div className="cart-item">
      <div className="item-image-wrap">
        <img
          src={item.image ? `${BASE_URL}${item.image}` : 'https://placehold.co/120x120?text=Product'}
          alt={item.product_name}
          className="item-image"
          onError={e => { e.target.src = 'https://placehold.co/120x120?text=Product' }}
        />
      </div>

      <div className="item-body">
        <div className="item-meta">
          <h3 className="item-name">{item.product_name}</h3>
          <div className="item-tags">
            <span className="tag">{item.varient_color}</span>
            <span className="tag">{item.varient_size}</span>
          </div>
          <div className="item-stock">
            <span className="stock-dot" />
            In Stock &nbsp;·&nbsp; Free Delivery
          </div>
        </div>

        <div className="item-pricing">
          <div className="price-row">
            <span className="price-current">₹{fmt(item.discounted_price)}</span>
            <span className="price-original">₹{fmt(item.total_price)}</span>
            <span className="price-save">Save ₹{fmt(item.amount_saved)}</span>
          </div>

          <div className="item-actions">
            <div className="qty-control">
              <button onClick={() => onQtyChange(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                <Minus size={13} />
              </button>
              <span>{item.quantity}</span>
              <button onClick={() => onQtyChange(item.id, item.quantity + 1)}>
                <Plus size={13} />
              </button>
            </div>

            <button className="btn-ghost danger" onClick={() => onRemove(item.id)}>
              <Trash2 size={14} /> Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CouponBox({ coupon, setCoupon, couponInput, setCouponInput, couponMsg, couponOk, onApply, onRemove, loading }) {
  return (
    <div className="coupon-box">
      <div className="coupon-header">
        <Tag size={15} />
        <span>Coupon / Promo Code</span>
      </div>

      {coupon ? (
        <div className="coupon-applied">
          <div className="coupon-applied-left">
            <span className="coupon-badge">{coupon}</span>
            <span className="coupon-msg-ok">{couponMsg}</span>
          </div>
          <button className="coupon-remove" onClick={onRemove}>
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="coupon-input-row">
          <input
            type="text"
            placeholder="Enter code…"
            value={couponInput}
            onChange={e => setCouponInput(e.target.value.toUpperCase())}
            className="coupon-input"
            onKeyDown={e => e.key === 'Enter' && onApply()}
          />
          <button className="btn-apply" onClick={onApply} disabled={loading || !couponInput.trim()}>
            {loading ? <span className="spinner-sm" /> : 'Apply'}
          </button>
        </div>
      )}

      {!coupon && couponMsg && (
        <p className={`coupon-feedback ${couponOk ? 'ok' : 'err'}`}>{couponMsg}</p>
      )}
    </div>
  )
}

// ── main component ─────────────────────────────────────────────────────────────
export default function Cart() {
  const [cartData, setCartData]       = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon]           = useState(null)   // applied code
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponMsg, setCouponMsg]     = useState('')
  const [couponOk, setCouponOk]       = useState(false)
  const [couponLoading, setCouponLoading] = useState(false)

  // ── fetch cart ──
  useEffect(() => {
    fetch(`${BASE_URL}/api/cart/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    })
      .then(r => r.json())
      .then(d => { setCartData(d); setLoading(false) })
      .catch(() => {
        // fallback mock
        setCartData({
          cart: [
            { id:1, product_item:558, product_varient:942, total_price:"12000.00", discounted_price:"1222.00", amount_saved:"2332.00", quantity:4, product_name:"Noise Air Buds", varient_color:"Blue Titanium", varient_size:"256GB", image:null },
            { id:2, product_item:670, product_varient:1134, total_price:"123888.00", discounted_price:"1223.00", amount_saved:"12233.00", quantity:5, product_name:"Samsung Smart TV", varient_color:"Hot Pink", varient_size:"75 Inch", image:null }
          ]
        })
        setLoading(false)
      })
  }, [])

  const items = cartData?.cart ?? []

  // ── derived totals ──
  const subtotal     = items.reduce((s, i) => s + parseFloat(i.discounted_price) * i.quantity, 0)
  const totalSaved   = items.reduce((s, i) => s + parseFloat(i.amount_saved) * i.quantity, 0)
  const shipping     = subtotal > 499 ? 0 : 49
  const tax          = +(subtotal * 0.02).toFixed(2)
  const grandTotal   = subtotal + shipping + tax - couponDiscount

  // ── qty change ──
  const handleQtyChange = (id, qty) => {
    if (qty < 1) return
    setCartData(prev => ({
      ...prev,
      cart: prev.cart.map(i => i.id === id ? { ...i, quantity: qty } : i)
    }))
  }

  // ── remove ──
  const handleRemove = (id) => {
    setCartData(prev => ({ ...prev, cart: prev.cart.filter(i => i.id !== id) }))
  }

  // ── coupon apply ──
  const handleCouponApply = async () => {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponMsg('')
    try {
      const res = await fetch(`${BASE_URL}/api/coupon_apply/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ code: couponInput, order_total: subtotal })
      })
      const data = await res.json()
      if (res.ok) {
        setCoupon(couponInput)
        setCouponDiscount(data.discount_amount ?? 0)
        setCouponMsg(data.message ?? `₹${fmt(data.discount_amount)} off applied!`)
        setCouponOk(true)
      } else {
        setCouponMsg(data.message ?? 'Invalid or expired coupon.')
        setCouponOk(false)
      }
    } catch {
      setCouponMsg('Could not apply coupon. Check connection.')
      setCouponOk(false)
    } finally {
      setCouponLoading(false)
    }
  }

  const handleCouponRemove = () => {
    setCoupon(null); setCouponDiscount(0); setCouponMsg(''); setCouponInput(''); setCouponOk(false)
  }

  // ── render ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="cart-loading">
      <div className="loader" />
      <p>Loading your cart…</p>
    </div>
  )

  return (
    <>
      <style>{styles}</style>

      <div className="cart-page">
        {/* ── breadcrumb ── */}
        <nav className="breadcrumb">
          <span>Home</span><ChevronRight size={13}/><span>Cart</span>
        </nav>

        <h1 className="page-title">
          Shopping Cart
          <span className="item-count">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
        </h1>

        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some items to get started.</p>
            <button className="btn-primary" onClick={() => window.history.back()}>Continue Shopping</button>
          </div>
        ) : (
          <div className="cart-grid">

            {/* ── LEFT: items ── */}
            <div className="cart-left">
              <div className="items-card">
                {items.map((item, i) => (
                  <React.Fragment key={item.id}>
                    <CartItem item={item} onQtyChange={handleQtyChange} onRemove={handleRemove} />
                    {i < items.length - 1 && <div className="divider" />}
                  </React.Fragment>
                ))}
              </div>

              {/* ── trust badges ── */}
              <div className="trust-row">
                <div className="trust-badge"><ShieldCheck size={16}/> Secure Payment</div>
                <div className="trust-badge"><RotateCcw size={16}/> Easy Returns</div>
                <div className="trust-badge"><Truck size={16}/> Fast Delivery</div>
              </div>
            </div>

            {/* ── RIGHT: summary ── */}
            <div className="summary-card">
              <h2 className="summary-title">Order Summary</h2>
              <div className="summary-divider" />

              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{fmt(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'free' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                <div className="summary-row">
                  <span>Tax (2%)</span>
                  <span>₹{fmt(tax)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="summary-row discount">
                    <span>Coupon ({coupon})</span>
                    <span>− ₹{fmt(couponDiscount)}</span>
                  </div>
                )}
              </div>

              <div className="summary-divider" />

              <div className="summary-total">
                <span>Total</span>
                <span>₹{fmt(grandTotal)}</span>
              </div>

              {/* savings pill */}
              <div className="savings-pill">
                🎉 You're saving ₹{fmt(totalSaved + couponDiscount)} on this order
              </div>

              {/* coupon */}
              <CouponBox
                coupon={coupon}
                setCoupon={setCoupon}
                couponInput={couponInput}
                setCouponInput={setCouponInput}
                couponMsg={couponMsg}
                couponOk={couponOk}
                onApply={handleCouponApply}
                onRemove={handleCouponRemove}
                loading={couponLoading}
              />

              <button className="btn-checkout">
                Proceed to Checkout <ChevronRight size={16}/>
              </button>

              <p className="secure-note">🔒 Safe &amp; secure payments. Easy returns.</p>
            </div>

          </div>
        )}
      </div>
    </>
  )
}

// ── styles ─────────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');

  :root {
    --bg: #f5f4f0;
    --surface: #ffffff;
    --border: #e8e5df;
    --text-primary: #1a1814;
    --text-secondary: #6b6760;
    --text-muted: #9e9b95;
    --accent: #c8a96e;
    --accent-dark: #a8843f;
    --green: #2d7a4f;
    --green-bg: #edf7f2;
    --red: #c0392b;
    --red-bg: #fdf2f1;
    --radius: 16px;
    --shadow: 0 2px 12px rgba(0,0,0,0.06);
    --shadow-lg: 0 8px 32px rgba(0,0,0,0.10);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .cart-page {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    padding: 28px 20px 60px;
    max-width: 1200px;
    margin: 0 auto;
  }

  /* breadcrumb */
  .breadcrumb {
    display: flex; align-items: center; gap: 4px;
    font-size: 13px; color: var(--text-muted); margin-bottom: 18px;
  }
  .breadcrumb span:last-child { color: var(--text-primary); font-weight: 500; }

  /* page title */
  .page-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(22px, 4vw, 32px);
    color: var(--text-primary);
    margin-bottom: 24px;
    display: flex; align-items: center; gap: 12px;
  }
  .item-count {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500;
    background: var(--accent); color: #fff;
    padding: 3px 10px; border-radius: 20px;
  }

  /* grid */
  .cart-grid {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 24px;
    align-items: start;
  }
  @media (max-width: 860px) {
    .cart-grid { grid-template-columns: 1fr; }
  }

  /* items card */
  .items-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 8px 20px;
    box-shadow: var(--shadow);
  }

  .cart-item {
    display: flex; gap: 16px;
    padding: 20px 0;
  }

  .item-image-wrap {
    flex-shrink: 0;
    width: 110px; height: 110px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border);
    background: #faf9f7;
  }
  .item-image {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform .3s ease;
  }
  .item-image:hover { transform: scale(1.04); }

  .item-body { flex: 1; min-width: 0; }

  .item-meta { margin-bottom: 10px; }
  .item-name {
    font-weight: 600; font-size: 15px;
    color: var(--text-primary); line-height: 1.4;
    margin-bottom: 6px;
  }
  .item-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 6px; }
  .tag {
    font-size: 11px; font-weight: 500;
    background: #f0ede8; color: var(--text-secondary);
    padding: 2px 8px; border-radius: 20px;
  }
  .item-stock {
    display: flex; align-items: center; gap: 5px;
    font-size: 12px; color: var(--green);
  }
  .stock-dot {
    width: 6px; height: 6px;
    background: var(--green); border-radius: 50%;
  }

  .item-pricing { display: flex; flex-direction: column; gap: 10px; }
  .price-row { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
  .price-current { font-size: 18px; font-weight: 700; color: var(--text-primary); }
  .price-original { font-size: 13px; color: var(--text-muted); text-decoration: line-through; }
  .price-save {
    font-size: 12px; font-weight: 600; color: var(--green);
    background: var(--green-bg); padding: 2px 8px; border-radius: 20px;
  }

  .item-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

  .qty-control {
    display: flex; align-items: center;
    border: 1.5px solid var(--border); border-radius: 8px;
    overflow: hidden; background: #faf9f7;
  }
  .qty-control button {
    background: none; border: none; cursor: pointer;
    padding: 7px 12px; color: var(--text-primary);
    display: flex; align-items: center; transition: background .2s;
  }
  .qty-control button:hover:not(:disabled) { background: #f0ede8; }
  .qty-control button:disabled { opacity: .35; cursor: not-allowed; }
  .qty-control span { font-size: 14px; font-weight: 600; padding: 0 14px; color: var(--text-primary); }

  .btn-ghost {
    background: none; border: none; cursor: pointer;
    font-size: 13px; font-weight: 500;
    display: flex; align-items: center; gap: 5px;
    padding: 6px 10px; border-radius: 8px;
    transition: background .2s, color .2s;
    color: var(--text-secondary);
  }
  .btn-ghost:hover { background: #f0ede8; }
  .btn-ghost.danger { color: var(--red); }
  .btn-ghost.danger:hover { background: var(--red-bg); }

  .divider { height: 1px; background: var(--border); }

  /* trust */
  .trust-row {
    display: flex; flex-wrap: wrap; gap: 12px;
    margin-top: 16px;
  }
  .trust-badge {
    display: flex; align-items: center; gap: 7px;
    font-size: 12px; font-weight: 500; color: var(--text-secondary);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px; padding: 8px 14px;
    box-shadow: var(--shadow);
  }

  /* summary card */
  .summary-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    box-shadow: var(--shadow-lg);
    position: sticky; top: 88px;
  }
  .summary-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px; color: var(--text-primary);
    margin-bottom: 16px;
  }
  .summary-divider { height: 1px; background: var(--border); margin: 16px 0; }

  .summary-rows { display: flex; flex-direction: column; gap: 12px; }
  .summary-row {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 14px; color: var(--text-secondary);
  }
  .summary-row .free { color: var(--green); font-weight: 600; }
  .summary-row.discount { color: var(--green); font-weight: 600; }

  .summary-total {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 18px; font-weight: 700; color: var(--text-primary);
    margin-bottom: 16px;
  }

  .savings-pill {
    background: linear-gradient(135deg, #edf7f2, #d4efe2);
    border: 1px solid #b9e2ce;
    border-radius: 10px; padding: 10px 14px;
    font-size: 13px; font-weight: 600; color: var(--green);
    text-align: center; margin-bottom: 16px;
  }

  /* coupon */
  .coupon-box {
    background: #faf9f7;
    border: 1.5px dashed var(--border);
    border-radius: 12px; padding: 14px;
    margin-bottom: 18px;
  }
  .coupon-header {
    display: flex; align-items: center; gap: 7px;
    font-size: 13px; font-weight: 600; color: var(--text-primary);
    margin-bottom: 10px;
  }
  .coupon-input-row { display: flex; gap: 8px; }
  .coupon-input {
    flex: 1; border: 1.5px solid var(--border); border-radius: 8px;
    padding: 9px 12px; font-size: 13px; font-weight: 600;
    letter-spacing: 1px; color: var(--text-primary);
    background: var(--surface); outline: none;
    transition: border-color .2s;
    font-family: 'DM Sans', sans-serif;
  }
  .coupon-input:focus { border-color: var(--accent); }
  .btn-apply {
    background: var(--text-primary); color: #fff;
    border: none; border-radius: 8px;
    padding: 9px 18px; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: background .2s;
    display: flex; align-items: center; gap: 6px;
    font-family: 'DM Sans', sans-serif;
  }
  .btn-apply:hover:not(:disabled) { background: var(--accent-dark); }
  .btn-apply:disabled { opacity: .5; cursor: not-allowed; }

  .coupon-applied {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--green-bg); border-radius: 8px; padding: 10px 12px;
  }
  .coupon-applied-left { display: flex; align-items: center; gap: 10px; }
  .coupon-badge {
    background: var(--green); color: #fff;
    font-size: 12px; font-weight: 700; letter-spacing: 1px;
    padding: 3px 10px; border-radius: 20px;
  }
  .coupon-msg-ok { font-size: 13px; color: var(--green); font-weight: 500; }
  .coupon-remove {
    background: none; border: none; cursor: pointer;
    color: var(--green); padding: 4px;
    display: flex; align-items: center;
  }
  .coupon-feedback {
    font-size: 12px; margin-top: 8px; font-weight: 500;
  }
  .coupon-feedback.ok { color: var(--green); }
  .coupon-feedback.err { color: var(--red); }

  /* checkout btn */
  .btn-checkout {
    width: 100%;
    background: linear-gradient(135deg, var(--accent), var(--accent-dark));
    color: #fff; border: none; border-radius: 12px;
    padding: 15px 20px; font-size: 15px; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: transform .15s, box-shadow .15s;
    font-family: 'DM Sans', sans-serif;
    box-shadow: 0 4px 18px rgba(200,169,110,.4);
  }
  .btn-checkout:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(200,169,110,.5); }
  .btn-checkout:active { transform: translateY(0); }

  .secure-note {
    text-align: center; font-size: 11.5px;
    color: var(--text-muted); margin-top: 12px;
  }

  /* empty */
  .empty-state {
    text-align: center; padding: 80px 20px;
  }
  .empty-icon { font-size: 56px; margin-bottom: 16px; }
  .empty-state h2 { font-size: 22px; color: var(--text-primary); margin-bottom: 8px; }
  .empty-state p { color: var(--text-secondary); margin-bottom: 24px; }
  .btn-primary {
    background: var(--accent); color: #fff; border: none;
    padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 600;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
  }

  /* loading */
  .cart-loading {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 60vh; gap: 16px; font-family: 'DM Sans', sans-serif;
    color: var(--text-secondary);
  }
  .loader {
    width: 36px; height: 36px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin .7s linear infinite;
  }
  .spinner-sm {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin .6s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`