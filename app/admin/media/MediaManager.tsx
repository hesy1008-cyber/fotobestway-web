"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createBanner,
  deleteBanner,
  deleteGalleryItem,
  updateBanner,
  toggleBannerActive,
  updateCategoryBanner,
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

type Category = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  bannerImage: string | null;
  bannerTitle: string | null;
  bannerDescription: string | null;
  productCount: number;
  subCategoryCount: number;
};

export default function MediaManager({
  initialBanners,
  initialGallery,
  initialCategories,
}: {
  initialBanners: Banner[];
  initialGallery: GalleryItem[];
  initialCategories: Category[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(initialGallery);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [activeTab, setActiveTab] = useState<"banner" | "gallery" | "categories">(
    tabParam === "gallery" ? "gallery" : tabParam === "categories" ? "categories" : "banner"
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    subtitle: "",
    buttonText: "",
    buttonLink: "",
    sortOrder: 0,
  });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryEditForm, setCategoryEditForm] = useState({
    bannerTitle: "",
    bannerDescription: "",
    sortOrder: 0,
  });

  function switchTab(tab: "banner" | "gallery" | "categories") {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    router.replace(`?${params.toString()}`);
  }

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

  async function handleDeleteBanner(id: string) {
    if (!confirm("确定要删除这张轮播图吗？")) return;
    try {
      await deleteBanner(id);
      window.location.reload();
    } catch (error: any) {
      alert("删除失败");
    }
  }

  function startEdit(banner: Banner) {
    setEditingId(banner.id);
    setEditForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      buttonText: banner.buttonText || "",
      buttonLink: banner.buttonLink || "",
      sortOrder: banner.sortOrder,
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: string) {
    try {
      await updateBanner(id, {
        title: editForm.title,
        subtitle: editForm.subtitle,
        buttonText: editForm.buttonText,
        buttonLink: editForm.buttonLink,
        sortOrder: editForm.sortOrder,
      });
      setEditingId(null);
      window.location.reload();
    } catch (error: any) {
      alert("保存失败：" + (error.message || "未知错误"));
    }
  }

  async function handleToggleActive(id: string) {
    try {
      await toggleBannerActive(id);
      window.location.reload();
    } catch (error: any) {
      alert("操作失败");
    }
  }

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

  async function handleDeleteGallery(id: string) {
    if (!confirm("确定要删除这张图片吗？")) return;
    try {
      await deleteGalleryItem(id);
      window.location.reload();
    } catch (error: any) {
      alert("删除失败");
    }
  }

  // 类目编辑相关函数
  function startEditCategory(category: Category) {
    setEditingCategoryId(category.id);
    setCategoryEditForm({
      bannerTitle: category.bannerTitle || "",
      bannerDescription: category.bannerDescription || "",
      sortOrder: category.sortOrder,
    });
  }

  function cancelEditCategory() {
    setEditingCategoryId(null);
  }

  async function handleCategorySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      await updateCategoryBanner(formData);
      setEditingCategoryId(null);
      window.location.reload();
    } catch (error: any) {
      alert("保存失败：" + (error.message || "未知错误"));
    }
  }

  return (
    <div>
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
        <button
          className={`admin-tab ${activeTab === "categories" ? "active" : ""}`}
          onClick={() => switchTab("categories")}
        >
          📂 类目横幅 ({categories.length})
        </button>
      </div>

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

          {banners.length > 0 && (
            <div style={{ marginTop: "30px" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>
                当前轮播图 ({banners.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {banners.map((banner, index) => (
                  <div
                    key={banner.id}
                    style={{
                      border: "1px solid #e5e5e5",
                      borderRadius: "8px",
                      padding: "12px",
                      background: "#fafafa",
                    }}
                  >
                    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                      <img
                        src={banner.image}
                        alt={banner.title || "Banner"}
                        style={{
                          width: "200px",
                          height: "84px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                          #{index + 1} {banner.isActive ? "✅ 启用" : "⏸️ 禁用"}
                        </div>
                        {banner.title && (
                          <div style={{ color: "#333", marginBottom: "2px" }}>
                            <strong>标题：</strong>{banner.title}
                          </div>
                        )}
                        {banner.subtitle && (
                          <div style={{ color: "#666", marginBottom: "2px", fontSize: "13px" }}>
                            <strong>副标题：</strong>{banner.subtitle}
                          </div>
                        )}
                        {banner.buttonText && (
                          <div style={{ color: "#666", marginBottom: "2px", fontSize: "13px" }}>
                            <strong>按钮：</strong>{banner.buttonText} → {banner.buttonLink}
                          </div>
                        )}
                        <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            onClick={() => startEdit(banner)}
                            className="admin-btn admin-btn-secondary"
                            style={{ fontSize: "12px", padding: "4px 12px" }}
                          >
                            ✏️ 编辑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(banner.id)}
                            className="admin-btn admin-btn-secondary"
                            style={{ fontSize: "12px", padding: "4px 12px" }}
                          >
                            {banner.isActive ? "⏸️ 禁用" : "✅ 启用"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="admin-btn"
                            style={{
                              fontSize: "12px",
                              padding: "4px 12px",
                              background: "#e53e3e",
                              color: "#fff",
                            }}
                          >
                            🗑️ 删除
                          </button>
                        </div>
                      </div>
                    </div>

                    {editingId === banner.id && (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "16px",
                          background: "#fff",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                        }}
                      >
                        <h4 style={{ marginBottom: "12px" }}>编辑轮播图</h4>
                        <div className="admin-form-row">
                          <div className="admin-form-group">
                            <label className="admin-form-label">标题</label>
                            <input
                              className="admin-form-input"
                              value={editForm.title}
                              onChange={(e) =>
                                setEditForm({ ...editForm, title: e.target.value })
                              }
                              placeholder="主标题"
                            />
                          </div>
                          <div className="admin-form-group">
                            <label className="admin-form-label">副标题</label>
                            <input
                              className="admin-form-input"
                              value={editForm.subtitle}
                              onChange={(e) =>
                                setEditForm({ ...editForm, subtitle: e.target.value })
                              }
                              placeholder="副标题"
                            />
                          </div>
                        </div>
                        <div className="admin-form-row">
                          <div className="admin-form-group">
                            <label className="admin-form-label">按钮文字</label>
                            <input
                              className="admin-form-input"
                              value={editForm.buttonText}
                              onChange={(e) =>
                                setEditForm({ ...editForm, buttonText: e.target.value })
                              }
                              placeholder="如：了解更多"
                            />
                          </div>
                          <div className="admin-form-group">
                            <label className="admin-form-label">按钮链接</label>
                            <input
                              className="admin-form-input"
                              value={editForm.buttonLink}
                              onChange={(e) =>
                                setEditForm({ ...editForm, buttonLink: e.target.value })
                              }
                              placeholder="如：/products"
                            />
                          </div>
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">排序（数字越小越靠前）</label>
                          <input
                            type="number"
                            className="admin-form-input"
                            value={editForm.sortOrder}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                sortOrder: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                          <button
                            type="button"
                            onClick={() => saveEdit(banner.id)}
                            className="admin-btn admin-btn-primary"
                          >
                            💾 保存
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="admin-btn admin-btn-secondary"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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

      {activeTab === "categories" && (
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">类目横幅管理</h2>
          <p className="admin-form-help">
            为每个产品分类设置横幅大图、标题和描述，建议尺寸：1920 × 400 px
          </p>

          {categories.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  style={{
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    padding: "16px",
                    background: "#fafafa",
                  }}
                >
                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                    <div style={{ width: "200px", flexShrink: 0 }}>
                      {category.bannerImage ? (
                        <img
                          src={category.bannerImage}
                          alt={category.name}
                          style={{
                            width: "200px",
                            height: "84px",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "200px",
                            height: "84px",
                            background: "#eee",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#999",
                            fontSize: "12px",
                          }}
                        >
                          暂无横幅图
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: "4px", fontSize: "16px" }}>
                        #{index + 1} {category.name}
                        <span style={{ color: "#999", fontSize: "13px", marginLeft: "8px" }}>
                          /{category.slug}
                        </span>
                      </div>
                      <div style={{ color: "#666", marginBottom: "4px", fontSize: "13px" }}>
                        📦 {category.productCount} 个产品 | 📂 {category.subCategoryCount} 个二级分类
                      </div>
                      {category.bannerTitle && (
                        <div style={{ color: "#333", marginBottom: "2px", fontSize: "13px" }}>
                          <strong>横幅标题：</strong>{category.bannerTitle}
                        </div>
                      )}
                      {category.bannerDescription && (
                        <div style={{ color: "#666", marginBottom: "2px", fontSize: "13px" }}>
                          <strong>横幅描述：</strong>{category.bannerDescription}
                        </div>
                      )}
                      <div style={{ marginTop: "8px" }}>
                        <button
                          type="button"
                          onClick={() => startEditCategory(category)}
                          className="admin-btn admin-btn-primary"
                          style={{ fontSize: "13px", padding: "6px 16px" }}
                        >
                          ✏️ 编辑类目横幅
                        </button>
                      </div>
                    </div>
                  </div>

                  {editingCategoryId === category.id && (
                    <form
                      onSubmit={handleCategorySubmit}
                      style={{
                        marginTop: "16px",
                        padding: "16px",
                        background: "#fff",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                      }}
                    >
                      <h4 style={{ marginBottom: "12px" }}>编辑类目横幅 - {category.name}</h4>

                      <input type="hidden" name="id" value={category.id} />

                      <div className="admin-form-group">
                        <label className="admin-form-label">横幅大图（不上传则保留原图）</label>
                        <input
                          name="bannerImage"
                          type="file"
                          accept="image/*"
                          className="admin-form-input admin-form-file"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-form-label">横幅标题（可选）</label>
                        <input
                          name="bannerTitle"
                          className="admin-form-input"
                          value={categoryEditForm.bannerTitle}
                          onChange={(e) =>
                            setCategoryEditForm({ ...categoryEditForm, bannerTitle: e.target.value })
                          }
                          placeholder="如：专业摄影灯架系列"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-form-label">横幅描述（可选）</label>
                        <textarea
                          name="bannerDescription"
                          className="admin-form-input"
                          rows={2}
                          value={categoryEditForm.bannerDescription}
                          onChange={(e) =>
                            setCategoryEditForm({ ...categoryEditForm, bannerDescription: e.target.value })
                          }
                          placeholder="如：稳固耐用的专业灯架，满足各种布光需求"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-form-label">排序（数字越小越靠前）</label>
                        <input
                          name="sortOrder"
                          type="number"
                          className="admin-form-input"
                          value={categoryEditForm.sortOrder}
                          onChange={(e) =>
                            setCategoryEditForm({
                              ...categoryEditForm,
                              sortOrder: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>

                      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                        <button type="submit" className="admin-btn admin-btn-primary">
                          💾 保存
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditCategory}
                          className="admin-btn admin-btn-secondary"
                        >
                          取消
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e5e5",
                borderRadius: "6px",
                padding: "40px",
                textAlign: "center",
                color: "#999",
              }}
            >
              暂无类目，请先在分类管理中创建类目
            </div>
          )}
        </div>
      )}
    </div>
  );
}
