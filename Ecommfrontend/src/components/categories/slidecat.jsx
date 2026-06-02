import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const products = [
  {
    id: 1,
    title: "Laptop",
    price: "₹49,999",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600",
  },
  {
    id: 2,
    title: "Headphones",
    price: "₹2,999",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
  },
  {
    id: 3,
    title: "Smart Watch",
    price: "₹4,999",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
  },
  {
    id: 4,
    title: "Camera",
    price: "₹34,999",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600",
  },
  {
    id: 5,
    title: "Mobile",
    price: "₹19,999",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600",
  },
  {
    id: 6,
    title: "Keyboard",
    price: "₹1,499",
    image:
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600",
  },
];

export default function categorieslide() {
  return (
    <section className="bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white p-5 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-5">
            Best Sellers
          </h2>

          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={16}
            breakpoints={{
              320: {
                slidesPerView: 1,
              },
              640: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 3,
              },
              1024: {
                slidesPerView: 4,
              },
              1280: {
                slidesPerView: 5,
              },
            }}
          >
            {products.map((product) => (
              <SwiperSlide key={product.id}>
                <div className="group bg-white border rounded-lg overflow-hidden hover:shadow-xl transition duration-300">
                  <div className="h-56 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {product.title}
                    </h3>

                    <p className="text-xl font-bold text-red-600 mt-2">
                      {product.price}
                    </p>

                    <button className="w-full mt-4 bg-yellow-400 hover:bg-yellow-500 py-2 rounded-full font-medium">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}