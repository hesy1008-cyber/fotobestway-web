"use client";

import { useState, useEffect, useCallback } from "react";

interface FactoryCarouselProps {
  images: string[];
  interval?: number;
}

export default function FactoryCarousel({ images, interval = 4000 }: FactoryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // 自动轮播
  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [nextSlide, interval, images.length]);

  if (images.length === 0) {
    return (
      <div className="factoryCarousel">
        <div
          style={{
            width: "100%",
            height: "320px",
            background: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#999",
            borderRadius: "8px",
          }}
        >
          工厂图片待添加...
        </div>
      </div>
    );
  }

  return (
    <div className="factoryCarousel">
      <div className="factoryCarouselTrack">
        {images.map((img, index) => (
          <div
            key={index}
            className="factorySlide"
            style={{ opacity: index === currentIndex ? 1 : 0 }}
          >
            <img
              src={img}
              alt={`Factory ${index + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        ))}
      </div>

      {/* 左右箭头 */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="factoryArrow factoryArrowLeft"
            aria-label="Previous slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="factoryArrow factoryArrowRight"
            aria-label="Next slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* 底部 dots */}
      {images.length > 1 && (
        <div className="factoryCarouselDots">
          {images.map((_, index) => (
            <span
              key={index}
              className={`factoryDot ${index === currentIndex ? "active" : ""}`}
              onClick={() => goToSlide(index)}
              style={{ cursor: "pointer" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
