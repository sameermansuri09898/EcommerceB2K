import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function HeroBanner() {

  const [banners, setBanners] = useState([]);

  const [loading, setLoading] = useState(true);

  const [current, setCurrent] = useState(0);

  // fetch banners
  useEffect(() => {

    const fetchBanners = async () => {

      try {

        const response = await fetch(
          "http://127.0.0.1:8000/api/bannerlist/"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch banners");
        }

        const data = await response.json();

        setBanners(data);

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);
      }
    };

    fetchBanners();

  }, []);

  // auto slide
  useEffect(() => {

    if (banners.length === 0) return;

    const interval = setInterval(() => {

      setCurrent((prev) =>
        prev === banners.length - 1 ? 0 : prev + 1
      );

    }, 4000);

    return () => clearInterval(interval);

  }, [banners]);

  // next
  const nextSlide = () => {

    setCurrent((prev) =>
      prev === banners.length - 1 ? 0 : prev + 1
    );
  };

  // prev
  const prevSlide = () => {

    setCurrent((prev) =>
      prev === 0 ? banners.length - 1 : prev - 1
    );
  };

  // loading
  if (loading) {

    return (

      <div className="w-full px-3 md:px-6 mt-4">

        <div className="h-[250px] md:h-[450px] rounded-3xl bg-gray-200 animate-pulse" />

      </div>
    );
  }

  return (

    <div className="w-full px-3 md:px-6 mt-4">

      <div className="relative overflow-hidden rounded-3xl h-[250px] sm:h-[320px] md:h-[450px] shadow-2xl">

        {banners.map((banner, index) => (

          <div
            key={banner.id}
            className={`
              absolute inset-0 transition-all duration-700
              ${index === current
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105 pointer-events-none"
              }
            `}
          >

            {/* background */}

            <div className="absolute inset-0 bg-black" />

            {/* image */}

            <img
              src={banner.image}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* overlay */}

            <div className="absolute inset-0 bg-black/40" />

            {/* content */}

            <div className="relative z-10 h-full flex items-center">

              <div className="px-6 md:px-14 max-w-xl text-white">

                <p className="uppercase tracking-[4px] text-xs md:text-sm mb-3 font-medium text-white/80">
                  Trending Products
                </p>

                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight">
                  {banner.title}
                </h1>

                <p className="mt-4 text-sm sm:text-lg text-white/90">
                  {banner.subtitle}
                </p>

                <button className="mt-6 bg-white text-black px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-all duration-300 shadow-lg">
                  Shop Now
                </button>

              </div>

            </div>

          </div>

        ))}

        {/* left arrow */}

        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md hover:bg-white/40 transition p-2 rounded-full text-white"
        >
          <ChevronLeft size={24} />
        </button>

        {/* right arrow */}

        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md hover:bg-white/40 transition p-2 rounded-full text-white"
        >
          <ChevronRight size={24} />
        </button>

        {/* dots */}

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">

          {banners.map((_, index) => (

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