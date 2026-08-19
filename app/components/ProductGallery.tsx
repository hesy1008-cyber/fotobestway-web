"use client";

import { useState, useRef, useEffect } from "react";

interface ProductGalleryProps {
  images: string[];
  video?: string;
  title: string;
  mainImageAlt?: string;
}

export default function ProductGallery({ images, video, title, mainImageAlt }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 计算总数量（图片 + 视频）
  const totalCount = images.length + (video ? 1 : 0);
  const isVideoCurrent = video && currentIndex === images.length;

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalCount - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === totalCount - 1 ? 0 : prev + 1));
  };

  const openLightbox = () => {
    setShowLightbox(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    document.body.style.overflow = "";
  };

  // ESC 键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showLightbox) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLightbox]);

  if (!images || images.length === 0) {
    return <div className="product-gallery-empty">No images available</div>;
  }

  // 缩略图列表（图片 + 视频缩略图）
  const thumbs = [
    ...images.map((img) => ({ type: "image" as const, src: img })),
    ...(video ? [{ type: "video" as const, src: video }] : []),
  ];

  return (
    <div className="product-gallery">
      {/* 左侧竖向缩略图 */}
      <div className="gallery-thumbs">
        {thumbs.map((item, index) => (
          <button
            key={index}
            className={`thumb-item ${index === currentIndex ? "active" : ""} ${item.type === "video" ? "thumb-video" : ""}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`View ${item.type} ${index + 1}`}
          >
            {item.type === "image" ? (
              <img src={item.src} alt={index === 0 && mainImageAlt ? mainImageAlt : `${title} - ${index + 1}`} loading="lazy" />
            ) : (
              <div className="thumb-video-wrapper">
                <img src={images[0]} alt="Video thumbnail" className="thumb-video-thumb" loading="lazy" />
                <div className="thumb-video-play">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* 中间主图区 */}
      <div className="gallery-main">
        <div className="main-image-wrapper">
          {isVideoCurrent ? (
            <video
              ref={videoRef}
              src={video}
              className="main-video"
              controls
              playsInline
              poster={images[0]}
            />
          ) : (
            <img
              src={images[currentIndex]}
              alt={currentIndex === 0 && mainImageAlt ? mainImageAlt : `${title} - ${currentIndex + 1}`}
              className="main-image"
            />
          )}

          {/* 左右箭头 */}
          <button className="gallery-arrow gallery-arrow-left" onClick={goToPrev} aria-label="Previous image">
            ‹
          </button>
          <button className="gallery-arrow gallery-arrow-right" onClick={goToNext} aria-label="Next image">
            ›
          </button>

          {/* 右下角放大图标（视频时不显示） */}
          {!isVideoCurrent && (
            <button className="gallery-fullscreen" onClick={openLightbox} aria-label="View larger image">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {/* 底部页码 */}
        <div className="gallery-pagination">
          <span className="current-page">{String(currentIndex + 1).padStart(2, "0")}</span>
          <span className="page-divider">/</span>
          <span className="total-pages">{String(totalCount).padStart(2, "0")}</span>
        </div>
      </div>

      {/* 半屏大图模态框 */}
      {showLightbox && !isVideoCurrent && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            {/* 关闭按钮 */}
            <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* 图片 */}
            <img
              src={images[currentIndex]}
              alt={currentIndex === 0 && mainImageAlt ? mainImageAlt : `${title} - ${currentIndex + 1}`}
              className="lightbox-image"
            />

            {/* 左右箭头 */}
            <button className="lightbox-arrow lightbox-arrow-left" onClick={goToPrev} aria-label="Previous image">
              ‹
            </button>
            <button className="lightbox-arrow lightbox-arrow-right" onClick={goToNext} aria-label="Next image">
              ›
            </button>

            {/* 底部页码 */}
            <div className="lightbox-pagination">
              <span>{String(currentIndex + 1).padStart(2, "0")} / {String(totalCount).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
