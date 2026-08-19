"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createBanner,
  deleteBanner,
  deleteGalleryItem,
} from "@/app/actions/media";

type Banner = {
  id: string;
  image: string;
  title: string | null;
  subtitle: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  sortOrder: number;
  isActive: boolean;
};

type GalleryItem = {
  id: string;
  image: string;
  title: string | null;
  photographer: string | null;
  sortOrder: number;
  isActive: boolean;
};

export default function MediaManager({
  initialBanners,
  initialGallery,
}: {
  initialBanners: Banner[];
  initialGallery: GalleryItem[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(initialGallery);
  const [activeTab, setActiveTab] = useState<"banner" | "gallery">(
    tabParam === "gallery" ? "gallery" : "banner"
  );

  // 切换选项卡时更新 URL
  function switchTab(tab: "banner" | "gallery") {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    router.replace(`?${params.toString()}`);
  }

  // 上传轮播图
  async function handleBannerUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      await createBanner(formData);
      form.reset();
      window.location.reload();
    } catch (error: any) {
      alert("上传失败：" + (error.message || "未知错误"));
    }
  }

  // 删除轮播图
  async function handleDeleteBanner(id: string) {
    if (!confirm("确定要删除这张轮播图吗？")) return;
    try {
      await deleteBanner(id);
      window.location.reload();
    } catch (error: any) {
      alert("删除失败");
    }
  }

  // 上传佳作欣赏
  async function handleGalleryUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "上传失败");
      }

      const data = await res.json();

      // 添加到列表开头
      const newItem: GalleryItem = {
        id: data.id || Date.now().toString(),
        image: data.image || "",
        title: data.title || null,
        photographer: data.photographer || null,
        sortOrder: galleryItems.length,
        isActive: true,
      };

      setGalleryItems([...galleryItems, newItem]);
      form.reset();
      alert("上传成功！");
    } catch (error: any) {
      alert("上传失败：" + (error.message || "未知错误"));
    }
  }

  // 删除佳作欣赏
  async function handleDeleteGallery(id: string) {
    if (!confirm("确定要删除这张图片吗？")) return;
    try {
      await deleteGalleryItem(id);
      window.location.reload();
    } catch (error: any) {
      alert("删除失败");
    }
  }

  return (
    <div>
      {/* Tab 切换 */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "banner" ? "active" : ""}`}
          onClick={() => switchTab("banner")}
        >
          🎬 轮播大图 ({banners.length})
        </button>
        <button
          className={`admin-tab ${activeTab === "gallery" ? "active" : ""}`}
          onClick={() => switchTab("gallery")}
        >
          🖼️ 佳作欣赏 ({galleryItems.length})
        </button>
      </div>

      {/* 轮播图管理 */}
      {activeTab === "banner" && (
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">上传轮播图</h2>
          <p className="admin-form-help">
            建议尺寸：1920 × 800 px，支持 JPG/PNG/WebP
          </p>

          <form onSubmit={handleBannerUpload}>
            <div className="admin-form-group">
              <input
                name="image"
                type="file"
                accept="image/*"
                required
                className="admin-form-input admin-form-file"
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">标题（可选）</label>
                <input
                  name="title"
                  className="admin-form-input"
                  placeholder="主标题"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">副标题（可选）</label>
                <input
                  name="subtitle"
                  className="admin-form-input"
                  placeholder="副标题"
                />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">按钮文字（可选）</label>
                <input
                  name="buttonText"
                  className="admin-form-input"
                  placeholder="如：了解更多"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">按钮链接（可选）</label>
                <input
                  name="buttonLink"
                  className="admin-form-input"
                  placeholder="如：/products"
                />
              </div>
            </div>

            <button type="submit" className="admin-btn admin-btn-primary">
              ⬆️ 上传轮播图
            </button>
          </form>

          {/* 已有轮播图列表 */}
          {banners.length > 0 && (
            <div style={{ marginTop: "30px" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>
                当前轮播图 ({banners.length})
              </h3>
              <div className="admin-image-grid">
                {banners.map((banner, index) => (
                  <div key={banner.id} className="admin-image-grid-item">
                    <img src={banner.image} alt={banner.title || "Banner"} />
                    <div style={{ padding: "8px", fontSize: "12px" }}>
                      <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                        #{index + 1} {banner.isActive ? "✅" : "⏸️"}
                      </div>
                      {banner.title && (
                        <div style={{ color: "#666", marginBottom: "4px" }}>
                          {banner.title}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="admin-image-grid-remove"
                      title="删除"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 佳作欣赏管理 */}
      {activeTab === "gallery" && (
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">上传佳作欣赏图片</h2>
          <p className="admin-form-help">
            建议尺寸：800 × 600 px，支持 JPG/PNG/WebP
          </p>

          <form onSubmit={handleGalleryUpload}>
            <div className="admin-form-group">
              <input
                name="image"
                type="file"
                accept="image/*"
                required
                className="admin-form-input admin-form-file"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">图片标题（可选）</label>
              <input
                name="title"
                className="admin-form-input"
                placeholder="图片标题/描述"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">摄影师（可选）</label>
              <input
                name="photographer"
                className="admin-form-input"
                placeholder="摄影师名字"
              />
            </div>

            <button type="submit" className="admin-btn admin-btn-primary">
              ⬆️ 上传图片
            </button>
          </form>

          {/* 已有图片列表 */}
          {galleryItems.length > 0 && (
            <div style={{ marginTop: "30px" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>
                当前图片 ({galleryItems.length})
              </h3>
              <div className="admin-image-grid">
                {galleryItems.map((item, index) => (
                  <div key={item.id} className="admin-image-grid-item">
                    <img src={item.image} alt={item.title || "Gallery"} />
                    <div style={{ padding: "8px", fontSize: "12px" }}>
                      <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                        #{index + 1} {item.isActive ? "✅" : "⏸️"}
                      </div>
                      {item.title && (
                        <div style={{ color: "#333", marginBottom: "2px" }}>{item.title}</div>
                      )}
                      {item.photographer && (
                        <div style={{ color: "#888", fontSize: "11px" }}>
                          📸 {item.photographer}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteGallery(item.id)}
                      className="admin-image-grid-remove"
                      title="删除"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
