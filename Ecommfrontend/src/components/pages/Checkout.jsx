import { useEffect, useState } from "react";
import AddressCard from "../AddressCard";
import { getAddresses } from "../services/addressService";

export default function Checkout() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  // Dummy cart (replace with Redux / Context later)
  const [cart] = useState([
    { id: 1, name: "Product 1", price: 499, qty: 2 },
    { id: 2, name: "Product 2", price: 299, qty: 1 },
  ]);

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await getAddresses();
      setAddresses(data);

      // auto-select default address
      const defaultAddr = data.find(a => a.is_default);
      if (defaultAddr) setSelectedAddress(defaultAddr.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Cart total
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  // Place order
  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      alert("Please select an address");
      return;
    }

    const orderData = {
      address_id: selectedAddress,
      payment_method: paymentMethod,
      items: cart,
      total: totalAmount,
    };

    console.log("ORDER:", orderData);
    alert("Order Placed Successfully 🚀");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* LEFT: ADDRESS */}
      <div className="md:col-span-2 space-y-4">

        <h2 className="text-2xl font-bold mb-3">
          Select Delivery Address
        </h2>

        {loading ? (
          <p>Loading addresses...</p>
        ) : (
          addresses.map((address) => (
            <div
              key={address.id}
              onClick={() => setSelectedAddress(address.id)}
              className={`cursor-pointer border rounded-lg p-2 ${
                selectedAddress === address.id
                  ? "border-green-500"
                  : ""
              }`}
            >
              <AddressCard
                address={address}
                onEdit={() => {}}
                onDelete={() => {}}
                onDefault={() => {}}
              />
            </div>
          ))
        )}
      </div>

      {/* RIGHT: SUMMARY */}
      <div className="border rounded-xl p-5 h-fit shadow-sm">

        <h2 className="text-xl font-bold mb-4">
          Order Summary
        </h2>

        {/* CART ITEMS */}
        <div className="space-y-2">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between text-sm"
            >
              <span>
                {item.name} x {item.qty}
              </span>
              <span>₹{item.price * item.qty}</span>
            </div>
          ))}
        </div>

        <hr className="my-3" />

        {/* TOTAL */}
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>₹{totalAmount}</span>
        </div>

        {/* PAYMENT */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2">
            Payment Method
          </h3>

          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value)
            }
            className="w-full border p-2 rounded"
          >
            <option value="cod">Cash on Delivery</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
          </select>
        </div>

        {/* BUTTON */}
        <button
          onClick={handlePlaceOrder}
          className="w-full bg-black text-white py-2 mt-4 rounded-lg"
        >
          Place Order
        </button>
      </div>
    </div>
  );
}