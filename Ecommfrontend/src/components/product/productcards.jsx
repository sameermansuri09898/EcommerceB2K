import { useState, useEffect } from "react";

export default function ProductCards() {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // per product selected variant
  const [selectedVariants, setSelectedVariants] = useState({});

  useEffect(() => {

    const controller = new AbortController();

    const fetchProducts = async () => {

      setLoading(true);
      setError(null);

      try {

        const response = await fetch(
          "http://127.0.0.1:8000/api/productlist/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        setUsers(data);

        // default variant set
        const defaults = {};

        data.forEach((product) => {
          defaults[product.id] = product.variant_set[0];
        });

        setSelectedVariants(defaults);

      } catch (error) {

        if (error.name !== "AbortError") {
          setError(error.message);
        }

      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    return () => controller.abort();

  }, []);

  // variant change
  const handleVariantChange = (productId, variant) => {

    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variant,
    }));
  };

  if (loading) {
    return (
      <div className="text-center mt-20 text-2xl font-bold">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20 text-red-500 text-xl">
        Error: {error}
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-4xl font-bold mb-8">
        Products
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {users.map((user) => {

          const selectedVariant =
            selectedVariants[user.id];

          return (

            <div
              key={user.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden"
            >

              {/* IMAGE */}

              <img
                src={
                  selectedVariant?.image_url ||
                  "https://via.placeholder.com/300"
                }
                alt={user.name}
                className="w-full h-64 object-cover"
              />

              {/* CONTENT */}

              <div className="p-4">

                <h2 className="text-xl font-bold">
                  {user.name}
                </h2>

                <p className="text-gray-500">
                  {user.brand}
                </p>

                <p className="text-sm text-gray-400">
                  {user.category}
                </p>

                {/* PRICE */}

                <div className="mt-4">

                  <div className="flex items-center gap-3">

                    <span className="text-2xl font-bold text-green-600">
                      ₹{selectedVariant?.final_price}
                    </span>

                    <span className="line-through text-gray-400">
                      ₹{selectedVariant?.price}
                    </span>

                  </div>

                  <p className="text-red-500 text-sm font-medium">
                    {selectedVariant?.offer}% OFF
                  </p>

                </div>

                {/* COLORS */}

                <div className="mt-5">

                  <h3 className="font-semibold mb-2">
                    Colors
                  </h3>

                  <div className="flex gap-2 flex-wrap">

                    {user.variant_set.map((variant) => (

                      <button
                        key={variant.id}
                        onClick={() =>
                          handleVariantChange(
                            user.id,
                            variant
                          )
                        }
                        className={`
                          px-3 py-2 rounded-lg border transition
                          ${selectedVariant?.id === variant.id
                            ? "bg-black text-white border-black"
                            : "border-gray-300 hover:border-black"
                          }
                        `}
                      >
                        {variant.color_name}
                      </button>

                    ))}

                  </div>

                </div>

                {/* SIZE */}

                <div className="mt-4">

                  <p className="text-sm text-gray-500">
                    Size:
                    <span className="font-bold ml-2">
                      {selectedVariant?.size_name}
                    </span>
                  </p>

                </div>

                {/* STOCK */}

                <div className="mt-2">

                  {selectedVariant?.stock > 0 ? (
                    <p className="text-green-600 text-sm">
                      In Stock
                    </p>
                  ) : (
                    <p className="text-red-500 text-sm">
                      Out of Stock
                    </p>
                  )}

                </div>

                {/* BUTTONS */}

                <div className="flex gap-3 mt-5">

                  <button className="flex-1 bg-yellow-400 hover:bg-yellow-500 py-3 rounded-xl font-semibold transition">
                    Add to Cart
                  </button>

                  <button className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-semibold transition">
                    Wishlist
                  </button>

                </div>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}