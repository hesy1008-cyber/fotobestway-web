"use client";

import { useState } from "react";
import SortableGallery from "@/app/components/SortableGallery";
import { filesToThumbnails } from "@/app/lib/thumbnail";

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
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryFileMap, setGalleryFileMap] = useState<Map<string, File>>(new Map());
  const [galleryPreview, setGalleryPreview] = useState<string[]>([]);
  const [detailPreview, setDetailPreview] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoUploading, setVideoUploading] = useState(false);
  const [title, setTitle] = useState<string>("");
  const [slug, setSlug] = useState<string>("");

  // 多型号规格参数
  type SpecModel = { model: string; specsText: string };
  const [specModels, setSpecModels] = useState<SpecModel[]>([]);

  const addSpecModel = () => {
    setSpecModels([...specModels, { model: "", specsText: "" }]);
  };

  const removeSpecModel = (index: number) => {
    setSpecModels(specModels.filter((_, i) => i !== index));
  };

  const updateSpecModel = (index: number, field: keyof SpecModel, value: string) => {
    const updated = [...specModels];
    updated[index] = { ...updated[index], [field]: value };
    setSpecModels(updated);
  };

  // 把多型号数据转换成 JSON 字符串
  const specsJson = JSON.stringify(
    specModels.map((m) => ({
      model: m.model.trim(),
      specs: m.specsText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
          const colonIndex = line.indexOf(":");
          if (colonIndex > 0) {
            return {
              label: line.substring(0, colonIndex).trim(),
              value: line.substring(colonIndex + 1).trim(),
            };
          }
          return { label: line, value: "" };
        }),
    }))
  );

  // 根据标题自动生成 slug
  function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTitle = e.target.value;
    setTitle(newTitle);
    // 只有当 slug 为空或者是之前自动生成的时候才自动更新
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      // 显式追加 specsJson，确保多型号规格参数被提交
      formData.set("specsJson", specsJson);

      // 合并后的产品图片：按拖拽排序后的顺序提交，第一张自动作为主图
      if (galleryFiles.length > 0) {
        formData.delete("gallery");
        galleryFiles.forEach((f) => formData.append("gallery", f));
        formData.set("image", galleryFiles[0]);
      }

      const res = await fetch("/api/products/create", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        window.location.href = "/admin/products";
      } else {
        let errorMsg = "创建失败（未知错误）";
        try {
          const data = await res.json();
          errorMsg = data?.error || "创建失败（服务端未返回错误信息）";
        } catch (e) {
          errorMsg = "创建失败（HTTP " + res.status + "）";
        }
        alert("创建失败：" + errorMsg);
      }
    } catch (error) {
      console.error("Create product failed:", error);
      alert("创建失败：" + (error instanceof Error ? error.message : "未知错误"));
    } finally {
      setLoading(false);
    }
  }

  async function previewImage(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) {
    const files = e.target.files;
    if (!files) return;
    const fileList = Array.from(files).filter((f) => f.size > 0);
    const urls = await filesToThumbnails(fileList);
    setter(urls);
  }

  // 核心：把文件列表加入预览（缩略图 + 原始文件映射），供拖拽排序
  async function addGalleryFiles(fileList: File[]) {
    if (fileList.length === 0) return;
    // 释放上一批预览占用的内存
    galleryPreview.forEach((url) => URL.revokeObjectURL(url));
    const thumbs = await filesToThumbnails(fileList);
    const fileMap = new Map<string, File>();
    fileList.forEach((file, i) => fileMap.set(thumbs[i], file));
    setGalleryFileMap(fileMap);
    setGalleryFiles(fileList);
    setGalleryPreview(thumbs);
  }

  // 选择文件：生成压缩缩略图预览（避免大图解码卡顿），保存原始文件列表
  function handleGallerySelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const fileList = Array.from(files).filter((f) => f.size > 0);
    e.target.value = ""; // 允许重复选择同一批文件
    void addGalleryFiles(fileList);
  }

  // 拖拽文件到页面直接上传
  function handleGalleryDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    const fileList = Array.from(files).filter((f) => f.size > 0);
    void addGalleryFiles(fileList);
  }

  // 拖拽排序后：同步重排文件列表（保证提交顺序与预览一致）
  function handleGalleryReorder(imgs: string[]) {
    setGalleryPreview(imgs);
    setGalleryFiles(
      imgs.map((url) => galleryFileMap.get(url)).filter((f): f is File => !!f)
    );
  }

  // 删除图片：同步从文件列表中移除，并释放缩略图内存
  function handleGalleryRemove(img: string) {
    URL.revokeObjectURL(img);
    const next = galleryPreview.filter((i) => i !== img);
    setGalleryPreview(next);
    setGalleryFiles(
      next.map((url) => galleryFileMap.get(url)).filter((f): f is File => !!f)
    );
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

        {/* Product Title */}
        <div className="admin-form-group">
          <label className="admin-form-label">Product Title *</label>
          <input
            name="title"
            value={title}
            onChange={handleTitleChange}
            className="admin-form-input"
            required
          />
        </div>

        {/* 隐藏的 slug，自动生成 */}
        <input type="hidden" name="slug" value={slug} />

        {/* Short Description */}
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

        {/* Category + Sub-Category */}
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">Category (一级类目) *</label>
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
            <label className="admin-form-label">Sub-Category (二级类目)</label>
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

        {/* Overview */}
        <div className="admin-form-group">
          <label className="admin-form-label">Overview (产品概述)</label>
          <textarea
            name="overview"
            className="admin-form-textarea"
            style={{ minHeight: "120px" }}
            placeholder="产品概述，详细介绍产品的整体情况"
          />
        </div>

        {/* Applications */}
        <div className="admin-form-group">
          <label className="admin-form-label">Applications (应用场景)</label>
          <textarea
            name="applications"
            className="admin-form-textarea"
            style={{ minHeight: "120px" }}
            placeholder={"Studio Photography\nVideo Production\nLive Streaming\n..."}
          />
          <p className="admin-form-help">
            产品应用场景，每行一个。会显示在产品详情页的 APPLICATIONS 部分
          </p>
        </div>

        {/* Specifications - 多型号 */}
        <div className="admin-form-group">
          <label className="admin-form-label">
            Specifications (规格参数，支持多个型号)
          </label>
          <input type="hidden" name="specsJson" value={specsJson} />
          {/* 保留旧字段兼容 */}
          <textarea name="specs" style={{ display: "none" }} defaultValue="" />

          {specModels.length === 0 && (
            <p style={{ color: "#888", fontSize: "13px", marginBottom: "10px" }}>
              暂无规格参数，点击下方按钮添加
            </p>
          )}

          {specModels.map((m, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #e0e0e0",
                borderRadius: "6px",
                padding: "15px",
                marginBottom: "15px",
                background: "#fafafa",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <span style={{ fontWeight: "bold", fontSize: "14px", color: "#333" }}>
                  型号 {index + 1}
                </span>
                <input
                  type="text"
                  placeholder="型号名称（如：FBW-600D，可选）"
                  value={m.model}
                  onChange={(e) => updateSpecModel(index, "model", e.target.value)}
                  className="admin-form-input"
                  style={{ flex: 1, maxWidth: "300px" }}
                />
                <button
                  type="button"
                  onClick={() => removeSpecModel(index)}
                  style={{
                    padding: "6px 12px",
                    background: "#e60012",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  删除型号
                </button>
              </div>
              <textarea
                placeholder={"Power: 600W\nVoltage: 110-240V\nColor Temperature: 5600K\n..."}
                value={m.specsText}
                onChange={(e) => updateSpecModel(index, "specsText", e.target.value)}
                className="admin-form-textarea"
                style={{ minHeight: "120px", fontFamily: "monospace", fontSize: "13px" }}
              />
              <p style={{ fontSize: "12px", color: "#888", marginTop: "5px" }}>
                每行一个规格，格式为 "名称: 值"
              </p>
            </div>
          ))}

          <button
            type="button"
            onClick={addSpecModel}
            style={{
              padding: "8px 16px",
              background: "#111",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            + 添加型号
          </button>
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

      {/* ====== 轮播图 ====== */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">🖼️ Product Images (产品图片)</h2>
        <p className="admin-form-help">
          上传产品图片（可多选），<strong>第一张自动作为主图</strong>，其余作为轮播图。
          建议尺寸：<strong>1500 × 1500 px</strong>
        </p>

        <div
          className="admin-form-group"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleGalleryDrop}
        >
          <input
            name="gallery"
            type="file"
            multiple
            accept="image/*"
            onChange={handleGallerySelect}
            className="admin-form-input admin-form-file"
          />
          <p className="admin-form-help" style={{ marginTop: "8px" }}>
            也可以直接把图片文件拖到本区域上传
          </p>

          {galleryPreview.length > 0 && (
          <div>
            <p className="admin-new-images-title" style={{ marginTop: "12px" }}>
              Preview ({galleryPreview.length}) - 拖拽调整顺序，<strong>第一张为主图</strong>
            </p>
            <SortableGallery
              images={galleryPreview}
              onChange={handleGalleryReorder}
              onRemove={handleGalleryRemove}
            />
          </div>
        )}
        </div>
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

      {/* ====== SEO 设置 ====== */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">🔍 SEO Settings (SEO 设置)</h2>

        <div className="admin-form-group">
          <label className="admin-form-label">SEO Title (页面标题)</label>
          <input
            name="seoTitle"
            type="text"
            className="admin-form-input"
            placeholder="显示在浏览器标签页的标题，留空则用产品名"
          />
          <p className="admin-form-help">建议 50-60 字符，包含核心关键词</p>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Meta Description (页面描述)</label>
          <textarea
            name="metaDescription"
            className="admin-form-textarea"
            style={{ minHeight: "80px" }}
            placeholder="搜索引擎结果页显示的描述文字"
          />
          <p className="admin-form-help">建议 150-160 字符，吸引用户点击</p>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Focus Keywords (核心关键词)</label>
          <input
            name="focusKeywords"
            type="text"
            className="admin-form-input"
            placeholder="关键词1, 关键词2, 关键词3"
          />
          <p className="admin-form-help">多个关键词用英文逗号分隔</p>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Main Image Alt Text (主图 Alt)</label>
          <input
            name="imageAlt"
            type="text"
            className="admin-form-input"
            placeholder="描述主图内容的文字，用于图片 SEO"
          />
          <p className="admin-form-help">描述图片内容，帮助搜索引擎理解图片</p>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Hidden SEO Text (隐藏 SEO 文案)</label>
          <textarea
            name="hiddenSeoText"
            className="admin-form-textarea"
            style={{ minHeight: "200px" }}
            placeholder="给搜索引擎看的长文案，用户看不到，爬虫可以抓取"
          />
          <p className="admin-form-help">
            合规视觉隐藏，非 display:none，谷歌可正常抓取，访客完全不可见
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
