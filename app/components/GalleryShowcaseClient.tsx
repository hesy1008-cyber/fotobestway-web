"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/app/i18n/TranslationContext";
import { locales, type Locale } from "@/app/i18n/config";

type GalleryItem = {
  id: string;
  image: string;
  title: string | null;
  photographer: string | null;
};

// 从 pathname 获取当前 locale
function getLocaleFromPathname(pathname: string | null): Locale {
  if (!pathname) return "en";
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return "en";
}

export default function GalleryShowcaseClient({
  row1Items,
  row2Items,
}: {
  row1Items: GalleryItem[];
  row2Items: GalleryItem[];
}) {
  const pathname = usePathname();
  const t = useTranslations();
  const locale = getLocaleFromPathname(pathname);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRow, setCurrentRow] = useState(1);
  const [isPaused1, setIsPaused1] = useState(false);
  const [isPaused2, setIsPaused2] = useState(false);

  // 所有图片，用于灯箱
  const allItems = [...row1Items, ...row2Items];

  // 复制一份图片，用于无缝滚动
  const doubledRow1 = [...row1Items, ...row1Items];
  const doubledRow2 = [...row2Items, ...row2Items];

  const openLightbox = (row: number, index: number) => {
    const items = row === 1 ? row1Items : row2Items;
    const realIndex = index % items.length;
    // 计算在 allItems 中的索引
    const globalIndex = row === 1 ? realIndex : row1Items.length + realIndex;
    setCurrentIndex(globalIndex);
    setCurrentRow(row);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  }, []);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
  }, [allItems.length]);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % allItems.length);
  }, [allItems.length]);

  // 键盘事件
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, closeLightbox, prevImage, nextImage]);

  if (allItems.length === 0) return null;

  const currentItem = allItems[currentIndex];

  return (
    <>
      <section className="gallery-showcase">
        <div className="gallery-showcase-inner">
          <h2 className="gallery-showcase-title">{t.home.galleryTitle}</h2>

          {/* 第一排 - 往左滚动 */}
          <div
            className={`gallery-showcase-scroll ${isPaused1 ? "paused" : ""}`}
            onMouseEnter={() => setIsPaused1(true)}
            onMouseLeave={() => setIsPaused1(false)}
          >
            <div className="gallery-showcase-track gallery-track-left">
              {doubledRow1.map((item, index) => (
                <div
                  key={`row1-${item.id}-${index}`}
                  className="gallery-showcase-item"
                  onClick={() => openLightbox(1, index)}
                >
                  <img
                    src={item.image}
                    alt={item.title || `Gallery ${index + 1}`}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 第二排 - 往右滚动 */}
          <div
            className={`gallery-showcase-scroll ${isPaused2 ? "paused" : ""}`}
            onMouseEnter={() => setIsPaused2(true)}
            onMouseLeave={() => setIsPaused2(false)}
          >
            <div className="gallery-showcase-track gallery-track-right">
              {doubledRow2.map((item, index) => (
                <div
                  key={`row2-${item.id}-${index}`}
                  className="gallery-showcase-item"
                  onClick={() => openLightbox(2, index)}
                >
                  <img
                    src={item.image}
                    alt={item.title || `Gallery ${index + 1}`}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="gallery-showcase-more">
            <a href={`/${locale}/products`} className="gallery-showcase-link">
              {t.home.learnMoreArrow}
            </a>
          </div>
        </div>
      </section>

      {/* 灯箱 */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          {/* 关闭按钮 */}
          <button
            className="lightbox-close"
            onClick={closeLightbox}
            title="Close"
          >
            ×
          </button>

          {/* 上一张 */}
          {allItems.length > 1 && (
            <button
              className="lightbox-nav lightbox-prev"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              title="Previous"
            >
              ‹
            </button>
          )}

          {/* 下一张 */}
          {allItems.length > 1 && (
            <button
              className="lightbox-nav lightbox-next"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              title="Next"
            >
              ›
            </button>
          )}

          {/* 图片容器 */}
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentItem.image}
              alt={currentItem.title || "Gallery"}
              className="lightbox-image"
            />

            {/* 底部信息 */}
            <div className="lightbox-info">
              <div className="lightbox-info-text">
                {currentItem.title && (
                  <h3 className="lightbox-title">{currentItem.title}</h3>
                )}
                {currentItem.photographer && (
                  <p className="lightbox-photographer">
                    Photo by {currentItem.photographer}
                  </p>
                )}
              </div>
              {allItems.length > 1 && (
                <div className="lightbox-counter">
                  {currentIndex + 1} / {allItems.length}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
