"use client";

import { useState } from "react";

export default function NewProductForm({
  categories,
  subCategories = [],
}: {
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
  subCategories?: {
    id: string;
    name: string;
    slug: string;
    categoryId: string;
  }[];
}) {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [galleryPreview, setGalleryPreview] = useState<string[]>([]);
  const [detailPreview, setDetailPreview] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoUploading, setVideoUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const res = await fetch("/api/products/create", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        window.location.href = "/admin/products";
      } else {
        alert("创建失败");
      }
    } catch (error) {
      console.error("Create product failed:", error);
      alert("创建失败");
    } finally {
      setLoading(false);
    }
  }

  function previewImage(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) {
    const files = e.target.files;
    if (!files) return;
    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    setter(urls);
  }

  // 视频上传
  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();
      setVideoUrl(data.url);
    } catch (error: any) {
      console.error("Video upload failed:", error);
      alert("视频上传失败：" + (error.message || "未知错误"));
    } finally {
      setVideoUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form" encType="multipart/form-data">
      {/* ====== 基本信息 ====== */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">📋 Basic Information</h2>

        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">Product Title *</label>
            <input
              name="title"
              className="admin-form-input"
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Slug (URL) *</label>
            <input
              name="slug"
              className="admin-form-input"
              required
            />
            <p className="admin-form-help">e.g., pl-600b-led-light</p>
          </div>
        </div>

        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">Category *</label>
            <select
              name="categoryId"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="admin-form-select"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Sub-Category</label>
            <select
              name="subCategoryId"
              className="admin-form-select"
              disabled={!selectedCategory}
            >
              <option value="">Select Sub-Category</option>
              {subCategories
                .filter((sc) => sc.categoryId === selectedCategory)
                .map((subCategory) => (
                  <option key={subCategory.id} value={subCategory.id}>
                    {subCategory.name}
                  </option>
                ))}
            </select>
            <p className="admin-form-help">
              {!selectedCategory ? "请先选择一级分类" : "可选，选择产品所属的二级分类"}
            </p>
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">
            Short Description (标题下面的小字)
          </label>
          <textarea
            name="shortDescription"
            className="admin-form-textarea"
            style={{ minHeight: "80px" }}
            placeholder="简短描述，显示在产品标题下方，建议 1-2 句话"
          />
        </div>
      </div>

      {/* ====== 产品特性 ====== */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">⭐ Key Features (产品特性)</h2>
        <p className="admin-form-help">
          产品核心特性，每行一个。会显示在产品列表页和详情页的 FEATURES 部分
        </p>

        <div className="admin-form-group">
          <textarea
            name="features"
            className="admin-form-textarea"
            style={{ minHeight: "180px" }}
            placeholder={"High CRI 96+\n600W Power Output\nFan Cooling System\n..."}
          />
        </div>
      </div>

      {/* ====== 主图 ====== */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">🖼️ Main Image (主图)</h2>
        <p className="admin-form-help">
          产品主图，默认第一张显示。建议尺寸：<strong>1500 × 1500 px</strong>，纯白背景
        </p>

        <div className="admin-form-group">
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setMainPreview(URL.createObjectURL(file));
              }
            }}
            className="admin-form-input admin-form-file"
          />
        </div>

        {mainPreview && (
          <div className="admin-main-image-preview">
            <img src={mainPreview} alt="Main preview" />
            <div className="admin-main-image-label">
              <span>Preview</span>
            </div>
          </div>
        )}
      </div>

      {/* ====== 轮播图 ====== */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">📸 Gallery Images (轮播图)</h2>
        <p className="admin-form-help">
          产品轮播图，显示在主图后面，可以点击切换。
          建议尺寸：<strong>1500 × 1500 px</strong>
        </p>

        <div className="admin-form-group">
          <input
            name="gallery"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => previewImage(e, setGalleryPreview)}
            className="admin-form-input admin-form-file"
          />
        </div>

        {galleryPreview.length > 0 && (
          <div className="admin-new-images">
            <p className="admin-new-images-title">
              Preview ({galleryPreview.length})
            </p>
            {galleryPreview.map((img) => (
              <div key={img} className="admin-new-images-item">
                <img src={img} alt="Gallery preview" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ====== 详情图 ====== */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">📐 Detail Images (详情图)</h2>
        <p className="admin-form-help">
          产品详情大图，用于详情页展示。
          建议宽度：<strong>1500 px</strong>
        </p>

        <div className="admin-form-group">
          <input
            name="detailImages"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => previewImage(e, setDetailPreview)}
            className="admin-form-input admin-form-file"
          />
        </div>

        {detailPreview.length > 0 && (
          <div className="admin-new-images">
            <p className="admin-new-images-title">
              Preview ({detailPreview.length})
            </p>
            {detailPreview.map((img) => (
              <div key={img} className="admin-new-images-item">
                <img src={img} alt="Detail preview" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ====== 视频 ====== */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">🎬 Product Video (产品视频)</h2>
        <p className="admin-form-help">
          产品视频，支持 MP4、WebM 等格式。可以上传视频文件，也可以手动输入视频 URL（如 YouTube/Vimeo 链接）
        </p>

        <div className="admin-form-group">
          <input
            name="videoFile"
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setVideoUrl(URL.createObjectURL(file));
              }
            }}
            className="admin-form-input admin-form-file"
          />
        </div>

        <p className="admin-form-help" style={{ marginTop: "8px", marginBottom: "8px" }}>
          或者手动输入视频 URL：
        </p>

        <div className="admin-form-group">
          <input
            name="video"
            value={videoUrl.startsWith("blob:") ? "" : videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="admin-form-input"
            placeholder="https://..."
          />
        </div>

        {videoUrl && (
          <div className="admin-video-preview">
            <div className="admin-video-label">
              <span>视频预览</span>
            </div>
            <video
              src={videoUrl}
              controls
              style={{ width: "100%", maxHeight: "300px", background: "#000", borderRadius: "8px" }}
            />
          </div>
        )}
      </div>

      {/* ====== 产品详情 ====== */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">📝 Product Details (产品详情)</h2>

        <div className="admin-form-group">
          <label className="admin-form-label">Overview</label>
          <textarea
            name="overview"
            className="admin-form-textarea"
            style={{ minHeight: "150px" }}
            placeholder="产品概述，详细介绍产品的整体情况"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">
            Specifications (格式：Label: Value)
          </label>
          <textarea
            name="specs"
            className="admin-form-textarea"
            style={{ minHeight: "200px", fontFamily: "monospace", fontSize: "13px" }}
            placeholder={"Power: 600W\nVoltage: 110-240V\n..."}
          />
          <p className="admin-form-help">
            每行一个规格，格式为 "名称: 值"，例如：Power: 600W
          </p>
        </div>
      </div>

      {/* ====== 提交按钮 ====== */}
      <div className="admin-form-actions">
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={loading}
        >
          {loading ? "⏳ Creating..." : "➕ Create Product"}
        </button>
        <a
          href="/admin/products"
          className="admin-btn admin-btn-secondary"
          style={{ textDecoration: "none" }}
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
