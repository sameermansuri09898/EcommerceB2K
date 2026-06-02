import { useState, useEffect, Fragment } from "react";
import CategorySlide from "../categories/slidecat";

export default function ProductCards() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleVariantChange = (productId, variant) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variant,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <h1 className="text-red-500 text-xl font-semibold">
          {error}
        </h1>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Products</h1>

          <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
            Filter
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

          {users.map((user, index) => {

            const selectedVariant =
              selectedVariants[user.id];

            return (
              <Fragment key={user.id}>

                {/* PRODUCT CARD */}
                <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition overflow-hidden group w-full">

                  {/* IMAGE */}
                  <div className="relative w-full aspect-[4/3] bg-white flex items-center justify-center p-3 overflow-hidden">
                  <img src={selectedVariant?.image_url ||"https://via.placeholder.com/300"}
                  alt={user.name} className="w-full h-full object-contain
                  transition-transform
                  duration-300
                  group-hover:scale-105"/>
</div>

                  {/* CONTENT */}
                  <div className="p-4">

                    <h2 className="font-bold text-lg line-clamp-1">
                      {user.name}
                    </h2>

                    <p className="text-sm text-gray-500">
                      {user.brand}
                    </p>

                    <p className="text-xs text-gray-400">
                      {user.categorie_name}
                    </p>

                    {/* PRICE */}
                    <div className="mt-3">
                      <span className="text-xl font-bold text-green-600">
                        ₹{selectedVariant?.final_price}
                      </span>

                      <span className="line-through text-gray-400 ml-2 text-sm">
                        ₹{selectedVariant?.price}
                      </span>
                    </div>

                    {/* VARIANTS */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {user.variant_set.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() =>
                            handleVariantChange(
                              user.id,
                              variant
                            )
                          }
                          className={`px-2 py-1 text-xs rounded border transition ${
                            selectedVariant?.id === variant.id
                              ? "bg-black text-white"
                              : "border-gray-300"
                          }`}
                        >
                          {variant.color_name}
                        </button>
                      ))}
                    </div>

                    {/* BUTTONS */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button className="bg-yellow-400 hover:bg-yellow-500 py-2 rounded-lg text-sm font-semibold">
                        Cart
                      </button>

                      <button className="bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg text-sm font-semibold">
                        Wishlist
                      </button>
                    </div>

                  </div>
                </div>

                {/* CATEGORY SLIDER INJECTION (AMAZON STYLE) */}
                {index === 7 && (
                  <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 w-full my-8">
                    <CategorySlide />
                  </div>
                )}

                {index === 15 && (
                  <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 w-full my-8">
                    <CategorySlide />
                  </div>
                )}

              </Fragment>
            );
          })}

        </div>
      </div>
    </div>
  );
}