import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OfferProducts() {

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  // fetch products
  useEffect(() => {

    const fetchProducts = async () => {

      try {

        const response = await fetch(
          "http://127.0.0.1:8000/api/productlist/"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        // only 50%+ OFF products
        const filteredProducts = data.filter((product) => {

          return product.variant_set?.some(
            (variant) => variant.offer >= 50
          );

        });

        setProducts(filteredProducts);

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }
    };

    fetchProducts();

  }, []);

  // auto slide
  useEffect(() => {

    if (products.length === 0) return;

    const interval = setInterval(() => {

      setCurrent((prev) =>
        prev === products.length - 1 ? 0 : prev + 1
      );

    }, 3500);

    return () => clearInterval(interval);

  }, [products]);

  // next
  const nextSlide = () => {

    setCurrent((prev) =>
      prev === products.length - 1 ? 0 : prev + 1
    );
  };

  // prev
  const prevSlide = () => {

    setCurrent((prev) =>
      prev === 0 ? products.length - 1 : prev - 1
    );
  };

  // loading
  if (loading) {

    return (

      <div className="px-3 md:px-6 mt-10">

        <div className="h-[250px] rounded-3xl bg-gray-200 animate-pulse" />

      </div>
    );
  }

  return (
  <div className="max-w-7xl mx-auto px-4 mt-10">

    {/* Header */}
    <div className="flex items-center justify-between mb-6">

      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Featured Deals
        </h2>

        <p className="text-gray-500 mt-1">
          Save up to 70% on selected products
        </p>
      </div>

    </div>

    {/* Slider */}
    <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-xl">

      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-70" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-70" />

      {products.map((product, index) => {

        const bestVariant = product.variant_set.reduce((max, variant) =>
          variant.offer > max.offer ? variant : max
        );

        return (
          <div
            key={product.id}
            className={`transition-all duration-700 ${
              current === index
                ? "opacity-100 relative"
                : "opacity-0 absolute inset-0 pointer-events-none"
            }`}
          >

            <div className="grid lg:grid-cols-2 items-center min-h-[550px]">

              {/* LEFT */}
              <div className="p-8 md:p-16 z-10">

                <span className="inline-flex items-center bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-semibold">
                  🔥 {bestVariant.offer}% OFF
                </span>

                <h1 className="mt-6 text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>

                <p className="mt-4 text-lg text-gray-500">
                  {product.brand}
                </p>

                <div className="flex items-center gap-4 mt-8">

                  <span className="text-4xl md:text-5xl font-bold text-gray-900">
                    ₹{bestVariant.final_price}
                  </span>

                  <span className="line-through text-2xl text-gray-400">
                    ₹{bestVariant.price}
                  </span>

                </div>

                <div className="mt-8 flex gap-4">

                  <button
                    onClick={() => navigate("/OfferProducts")}
                    className="bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition"
                  >
                    Shop Now
                  </button>

                  <button
                    className="border border-gray-300 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition"
                  >
                    View Details
                  </button>

                </div>

              </div>

              {/* RIGHT */}
              <div className="flex justify-center items-center p-10 z-10">

                <img
                  src={bestVariant.image_url}
                  alt={product.name}
                  className="
                    h-[320px]
                    md:h-[480px]
                    object-contain
                    drop-shadow-[0_30px_40px_rgba(0,0,0,0.15)]
                    hover:scale-105
                    transition-all
                    duration-500
                  "
                />

              </div>

            </div>

          </div>
        );
      })}

      {/* LEFT ARROW */}
      <button
        onClick={prevSlide}
        className="
          absolute
          left-5
          top-1/2
          -translate-y-1/2
          w-12
          h-12
          bg-white
          shadow-lg
          rounded-full
          flex
          items-center
          justify-center
          text-gray-700
          hover:bg-gray-100
          z-20
        "
      >
        <ChevronLeft size={22} />
      </button>

      {/* RIGHT ARROW */}
      <button
        onClick={nextSlide}
        className="
          absolute
          right-5
          top-1/2
          -translate-y-1/2
          w-12
          h-12
          bg-white
          shadow-lg
          rounded-full
          flex
          items-center
          justify-center
          text-gray-700
          hover:bg-gray-100
          z-20
        "
      >
        <ChevronRight size={22} />
      </button>

      {/* DOTS */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">

        {products.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`transition-all duration-300 rounded-full ${
              current === index
                ? "w-10 h-3 bg-black"
                : "w-3 h-3 bg-gray-300"
            }`}
          />
        ))}

      </div>

    </div>
  </div>
);
}