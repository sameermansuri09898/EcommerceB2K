import { useState, useEffect } from "react";

export default function ProductCards() {

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  // selected variants
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

        // default variant
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

  // change variant
  const handleVariantChange = (productId, variant) => {

    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variant,
    }));
  };

  // loading
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <h1 className="text-xl md:text-3xl font-bold">
          Loading...
        </h1>
      </div>
    );
  }

  // error
  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <h1 className="text-red-500 text-lg md:text-2xl font-semibold">
          Error: {error}
        </h1>
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-100 p-3 md:p-6">

      {/* heading */}

      <div className="flex items-center justify-between mb-5 md:mb-8">

        <h1 className="text-2xl md:text-4xl font-bold">
          Products
        </h1>

        <button className="bg-black text-white px-4 py-2 rounded-xl text-sm md:text-base">
          Filter
        </button>

      </div>

      {/* grid */}

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">

        {users.map((user) => {

          const selectedVariant =
            selectedVariants[user.id];

          return (

            <div
              key={user.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >

              {/* image */}

              <div className="overflow-hidden">

                <img
                  src={
                    selectedVariant?.image_url ||
                    "https://via.placeholder.com/300"
                  }
                  alt={user.name}
                  className="w-full h-40 sm:h-52 md:h-56 object-cover group-hover:scale-105 transition duration-300"
                />

              </div>

              {/* content */}

              <div className="p-3 md:p-4">

                {/* name */}

                <h2 className="text-sm md:text-lg font-bold line-clamp-1">
                  {user.name}
                </h2>

                {/* brand */}

                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  {user.brand}
                </p>

                {/* category */}

                <p className="text-[11px] md:text-xs text-gray-400">
                  {user.category}
                </p>

                {/* price */}

                <div className="mt-3">

                  <div className="flex items-center gap-2 flex-wrap">

                    <span className="text-lg md:text-2xl font-bold text-green-600">
                      ₹{selectedVariant?.final_price}
                    </span>

                    <span className="line-through text-xs md:text-sm text-gray-400">
                      ₹{selectedVariant?.price}
                    </span>

                  </div>

                  <p className="text-red-500 text-xs font-semibold mt-1">
                    {selectedVariant?.offer}% OFF
                  </p>

                </div>

                {/* colors */}

                <div className="mt-4">

                  <h3 className="font-semibold text-xs md:text-sm mb-2">
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
                          px-2 py-1 text-xs rounded-lg border transition
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

                {/* size + stock */}

                <div className="flex items-center justify-between mt-4">

                  <p className="text-xs md:text-sm text-gray-500">
                    Size:
                    <span className="font-bold ml-1">
                      {selectedVariant?.size_name}
                    </span>
                  </p>

                  {selectedVariant?.stock > 0 ? (
                    <p className="text-green-600 text-xs font-medium">
                      In Stock
                    </p>
                  ) : (
                    <p className="text-red-500 text-xs font-medium">
                      Out
                    </p>
                  )}

                </div>

                {/* buttons */}

                <div className="grid grid-cols-2 gap-2 mt-4">

                  <button className="bg-yellow-400 hover:bg-yellow-500 py-2 rounded-xl font-semibold transition text-xs md:text-sm">
                    Cart
                  </button>

                  <button className="bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-xl font-semibold transition text-xs md:text-sm">
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