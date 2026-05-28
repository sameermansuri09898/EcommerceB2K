import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useEffect, useState } from "react";

import "swiper/css";
import "swiper/css/navigation";

export default function Categories() {
  const [categories, setData] = useState([]);
  const [loading, setLoad] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchCategories = async () => {
      try {
        setLoad(true);
        setError("");

        const response = await fetch(
          "http://127.0.0.1:8000/api/Categoriesdata/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }
        );

        // Check response
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();

        console.log("API DATA:", data);

        setData(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong");
        }
      } finally {
        setLoad(false);
      }
    };

    fetchCategories();

    // cleanup
    return () => {
      controller.abort();
    };
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="p-4 text-center">
        Loading Data...
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <Swiper
        modules={[Navigation]}
       
        spaceBetween={12}
        slidesPerView={2}
        breakpoints={{
          320:{
            slidesPerView:6,
          },
          640: {
            slidesPerView: 8,
          },
          768: {
            slidesPerView: 8,
          },
          1024: {
            slidesPerView: 11,
          },
        }}
      >
        {categories.map((item) => (
          <SwiperSlide key={item.id}>
            <div
              className="
                bg-gray-100
                hover:bg-indigo-100
                transition
                rounded-xl
                p-0.5
                text-center
                cursor-pointer
                shadow-sm
              "
            >
              <h3 className="font-semibold text-sm">
                {item.categorie}
              </h3>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}