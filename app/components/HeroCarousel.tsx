"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";

export interface HeroSlide {
  image: string;
  title: string;
  desc: string;
  buttonText?: string;
  buttonLink?: string;
}

// 默认兜底数据（当数据库没有 Banner 时使用），按语言区分
const defaultSlides: Record<string, HeroSlide[]> = {
  en: [
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
  ],
  zh: [
    {
      image: "/studio.jpg",
      title: "专业摄影器材",
      desc: "为创作者和专业人士提供影棚灯光解决方案",
    },
    {
      image: "/studio2.jpg",
      title: "完整灯光解决方案",
      desc: "为工作室和制作团队提供专业设备",
    },
    {
      image: "/studio3.jpg",
      title: "OEM 制造合作伙伴",
      desc: "为全球品牌提供可靠的工厂支持",
    },
  ],
  ar: [
    {
      image: "/studio.jpg",
      title: "معدات التصوير الاحترافية",
      desc: "حلول إضاءة الاستوديو للمبدعين والمحترفين",
    },
    {
      image: "/studio2.jpg",
      title: "حلول إضاءة متكاملة",
      desc: "معدات احترافية للاستوديوهات وفرق الإنتاج",
    },
    {
      image: "/studio3.jpg",
      title: "شريك التصنيع OEM",
      desc: "دعم مصنعي موثوق للعلامات التجارية العالمية",
    },
  ],
};

// 数据库轮播图标题的翻译映射（后台填英文，前端按语言显示；未命中保持原文）
const slideTranslations: Record<string, { zh: string; ar: string }> = {
  "Professional Photography Equipment": {
    zh: "专业摄影器材",
    ar: "معدات التصوير الاحترافية",
  },
  "Studio lighting solutions for creators and professionals": {
    zh: "为创作者和专业人士提供影棚灯光解决方案",
    ar: "حلول إضاءة الاستوديو للمبدعين والمحترفين",
  },
  "Complete Lighting Solutions": {
    zh: "完整灯光解决方案",
    ar: "حلول إضاءة متكاملة",
  },
  "Professional equipment for studios and production teams": {
    zh: "为工作室和制作团队提供专业设备",
    ar: "معدات احترافية للاستوديوهات وفرق الإنتاج",
  },
  "OEM Manufacturing Partner": {
    zh: "OEM 制造合作伙伴",
    ar: "شريك التصنيع OEM",
  },
  "Reliable factory support for global brands": {
    zh: "为全球品牌提供可靠的工厂支持",
    ar: "دعم مصنعي موثوق للعلامات التجارية العالمية",
  },
  "Explore Products": {
    zh: "探索产品",
    ar: "استكشف المنتجات",
  },
};

function localize(text: string, locale: string): string {
  if (locale === "en" || !text) return text;
  const map = slideTranslations[text];
  if (map && map[locale as keyof typeof map]) return map[locale as keyof typeof map];
  return text;
}

export default function HeroCarousel({
  slides,
  locale = "en",
}: {
  slides?: HeroSlide[];
  locale?: string;
}) {
  const data =
    slides && slides.length > 0
      ? slides
      : (defaultSlides[locale] || defaultSlides.en);

  // 当前轮播序号（realIndex，loop 模式下与实际数据对齐）
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<any>(null);

  // 圆环倒计时时长 = 自动播放间隔，两者保持同步
  const AUTOPLAY_MS = 5000;

  return (
    <section className="hero">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        autoplay={{
          delay: AUTOPLAY_MS,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop
        className="heroSwiper"
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
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
              <h1>{localize(slide.title, locale)}</h1>
              {slide.desc && <p>{localize(slide.desc, locale)}</p>}

              <Link href={slide.buttonLink || "/products"}>
                <button>{localize(slide.buttonText || "Explore Products", locale)}</button>
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 数字指示器：激活数字外圈为倒计时圆环，走完一圈自动切换 */}
      <div className="heroIndicators" role="tablist" aria-label="Slides">
        {data.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={index}
              className={`heroIndicator${isActive ? " active" : ""}`}
              onClick={() => swiperRef.current?.slideToLoop(index)}
              aria-label={`Slide ${index + 1}: ${slide.title}`}
              aria-current={isActive}
            >
              <svg className="heroRing" viewBox="0 0 36 36" aria-hidden="true">
                <circle className="heroRingBg" cx="18" cy="18" r="15" fill="none" strokeWidth="2" />
                <circle
                  key={isActive ? `active-${activeIndex}` : `idle-${index}`}
                  className="heroRingFg"
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="heroIndicatorNum">{index + 1}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
