"use client";

import { useState, useEffect, useCallback } from "react";

interface CertificateLightboxProps {
  images: string[];
}

export default function CertificateLightbox({ images }: CertificateLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "";
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  // 键盘导航
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeLightbox, goToPrev, goToNext]);

  if (!isOpen || images.length === 0) {
    return (
      <>
        <div className="certList">
          {images.map((img, index) => (
            <div
              key={index}
              className="certItem"
              onClick={() => openLightbox(index)}
            >
              <img
                src={img}
                alt={`Certificate ${index + 1}`}
                className="certImage"
              />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="certList">
        {images.map((img, index) => (
          <div
            key={index}
            className="certItem"
            onClick={() => openLightbox(index)}
          >
            <img
              src={img}
              alt={`Certificate ${index + 1}`}
              className="certImage"
            />
          </div>
        ))}
      </div>

      {/* Lightbox 遮罩 */}
      <div className="certLightboxOverlay" onClick={closeLightbox}>
        {/* 关闭按钮 */}
        <button
          className="certLightboxClose"
          onClick={closeLightbox}
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* 上一张 */}
        {images.length > 1 && (
          <button
            className="certLightboxArrow certLightboxPrev"
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            aria-label="Previous"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* 图片 */}
        <div className="certLightboxContent" onClick={(e) => e.stopPropagation()}>
          <img
            src={images[currentIndex]}
            alt={`Certificate ${currentIndex + 1}`}
            className="certLightboxImage"
          />
        </div>

        {/* 下一张 */}
        {images.length > 1 && (
          <button
            className="certLightboxArrow certLightboxNext"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            aria-label="Next"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

        {/* 图片计数 */}
        {images.length > 1 && (
          <div className="certLightboxCounter">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </>
  );
}
