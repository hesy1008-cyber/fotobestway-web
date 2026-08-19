"use client";

import { useState, useEffect, useCallback } from "react";

type GalleryItem = {
  id: string;
  image: string;
  title: string | null;
  photographer: string | null;
};

export default function GalleryLightbox({
  items,
}: {
  items: GalleryItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const open = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const close = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "";
  }, []);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  // 键盘事件
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close, prev, next]);

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <div className="lightbox-overlay" onClick={close}>
      {/* 关闭按钮 */}
      <button className="lightbox-close" onClick={close} title="关闭">
        ×
      </button>

      {/* 上一张 */}
      {items.length > 1 && (
        <button
          className="lightbox-nav lightbox-prev"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          title="上一张"
        >
          ‹
        </button>
      )}

      {/* 下一张 */}
      {items.length > 1 && (
        <button
          className="lightbox-nav lightbox-next"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          title="下一张"
        >
          ›
        </button>
      )}

      {/* 图片容器 */}
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
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
          {items.length > 1 && (
            <div className="lightbox-counter">
              {currentIndex + 1} / {items.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 导出 open 函数的方式：通过 ref 或者直接在组件内部处理点击
// 这里我们用另一种方式：把点击事件绑定到外部
