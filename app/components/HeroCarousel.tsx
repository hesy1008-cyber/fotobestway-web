"use client";

import Image from "next/image";
import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

export interface HeroSlide {
  image: string;
  title: string;
  desc: string;
  buttonText?: string;
  buttonLink?: string;
}

// 默认兜底数据（当数据库没有 Banner 时使用）
const defaultSlides: HeroSlide[] = [
  {
    image: "/studio.jpg",
    title: "Professional Photography Equipment",
    desc: "Studio lighting solutions for creators and professionals",
  },
  {
    image: "/studio2.jpg",
    title: "Complete Lighting Solutions",
    desc: "Professional equipment for studios and production teams",
  },
  {
    image: "/studio3.jpg",
    title: "OEM Manufacturing Partner",
    desc: "Reliable factory support for global brands",
  },
];

export default function HeroCarousel({ slides }: { slides?: HeroSlide[] }) {
  const data = slides && slides.length > 0 ? slides : defaultSlides;

  return (
    <section className="hero">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        loop
        className="heroSwiper"
      >
        {data.map((slide, index) => (
          <SwiperSlide key={index}>
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              sizes="100vw"
              className="heroImage"
            />

            <div className="heroOverlay"></div>

            <div className="heroContent">
              <h1>{slide.title}</h1>
              {slide.desc && <p>{slide.desc}</p>}

              <Link href={slide.buttonLink || "/products"}>
                <button>{slide.buttonText || "Explore Products"}</button>
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
