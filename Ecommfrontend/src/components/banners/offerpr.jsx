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

    <div className="px-3 md:px-6 mt-10">

      {/* heading */}

      <div className="flex items-center justify-between mb-5">

        <div>

          <h1 className="text-2xl md:text-4xl font-black">
            🔥 Mega Deals
          </h1>

          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Products with 50% or more OFF On T-Shirt
          </p>

        </div>

      </div>

      {/* swiper */}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-500 via-pink-500 to-orange-400 shadow-2xl">

        {products.map((product, index) => {

          const bestVariant =
            product.variant_set.reduce((max, variant) =>
              variant.offer > max.offer
                ? variant
                : max
            );

          return (

            <div
              key={product.id}
              className={`
                transition-all duration-700
                ${index === current
                  ? "opacity-100 relative"
                  : "opacity-0 absolute inset-0 pointer-events-none"
                }
              `}
            >

              <div className="grid md:grid-cols-2 items-center min-h-[280px] md:min-h-[420px]">

                {/* left content */}

                <div className="p-6 md:p-14 text-white">

                  <p className="uppercase tracking-[4px] text-xs md:text-sm mb-3 font-semibold">
                    Limited Time Offer
                  </p>

                  <h1 className="text-3xl md:text-6xl font-black leading-tight">
                    {product.name}
                  </h1>

                  <p className="mt-3 text-white/90 text-sm md:text-lg">
                    {product.brand}
                  </p>

                  <div className="mt-6 flex items-center gap-4 flex-wrap">

                    <span className="text-3xl md:text-5xl font-black">
                      ₹{bestVariant.final_price}
                    </span>

                    <span className="line-through text-lg md:text-2xl text-white/70">
                      ₹{bestVariant.price}
                    </span>

                  </div>

                  <div className="mt-3 inline-block bg-white text-red-600 px-4 py-2 rounded-2xl font-black text-lg shadow-lg">
                    {bestVariant.offer}% OFF
                  </div>
<button
  onClick={() => navigate("/OfferProducts")}
  className="mt-7 bg-black text-white px-7 py-3 rounded-2xl font-bold hover:scale-105 transition duration-300"
>
  Shop Now
</button>

                </div>

                {/* right image */}

                <div className="flex items-center justify-center p-6">

                  <img
                    src={bestVariant.image_url}
                    alt={product.name}
                    className="h-[220px] md:h-[380px] object-contain drop-shadow-2xl hover:scale-105 transition duration-300"
                  />

                </div>

              </div>

            </div>

          );
        })}

        {/* arrows */}

        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/40 p-2 rounded-full text-white z-20"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/40 p-2 rounded-full text-white z-20"
        >
          <ChevronRight size={24} />
        </button>

        {/* dots */}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">

          {products.map((_, index) => (

            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`
                h-2 rounded-full transition-all duration-300
                ${current === index
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50"
                }
              `}
            />

          ))}

        </div>

      </div>

    </div>
  );
}