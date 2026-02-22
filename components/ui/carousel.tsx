"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface CarouselProps {
  scroll: () => void;
}

export default function Carousel({ scroll }: CarouselProps) {
  const slides = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBYCgWXyadinN6al8OG-uAlhKM7j_O5oWeUWY-s__jTww5gARpyWflNcfROR_84cy5H-o8nuZdZdvwqC-KXLlal1ozpW-42Vn5HRrjpQU1z6gvd9aJ_5eV88s-gBwdbJp1xtP0Xfdsx_GOXmBFTY7SvOYvqI121V4IIa-h0pAZ__NUZTJJxZmY84gfR5gbTbz9tjGNrIW6UWGbTMaCpvC9BhYUIaCNtlpqW-T4VKuEsI46MuEQWudX5K7YYbqvrxOj48ElqmkQ5goo",
    "https://img.freepik.com/premium-photo/green-abstract-background-with-network-grid-particle-connections-technology-polygonal-data_1059988-672.jpg",
  ];

  return (
    <div className="relative w-full h-[500px] rounded-3xl overflow-hidden border border-white/10">
      <Swiper
        style={
          {
            "--swiper-pagination-color": "#FFFFFF",
            "--swiper-pagination-bullet-inactive-color": "#999999",
            "--swiper-pagination-bullet-inactive-opacity": "1",
            "--swiper-pagination-bullet-size": "8px",
            "--swiper-pagination-bullet-horizontal-gap": "3px",
          } as any
        }
        modules={[Pagination, Autoplay]}
        pagination={{
          clickable: true,
          type: "bullets",
        }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop
        className="w-full h-full"
      >
        {slides.map((url, i) => (
          <SwiperSlide key={i}>
            <div
              className="relative w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${url})`,
              }}
            >
              {/* Overlay content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                  Premium Datasets
                </h2>
                <p className="text-sm sm:text-base mb-6">
                  Access satellite imagery, research data, and exclusive
                  content.
                </p>
                <button
                  onClick={scroll}
                  className="glossy-pill px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-black text-[#0a0f0d] rounded-full flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">
                    explore
                  </span>
                  Explore
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
