"use client";

import { useState } from "react";
import {
  updateAboutPage,
  addFactoryImage,
  removeFactoryImage,
  addCertificateImage,
  removeCertificateImage,
} from "@/app/actions/about";

interface AboutData {
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  heroImage: string;
  introTitle: string;
  introContent: string;
  factoryTitle: string;
  factoryImages: string[];
  certificates: string[];
  videoTitle: string;
  videoUrl: string;
  videoPoster: string;
}

export default function AboutManager({ initialData }: { initialData: AboutData }) {
  const [saving, setSaving] = useState(false);
  const [heroImagePreview, setHeroImagePreview] = useState(initialData.heroImage);
  const [factoryImages, setFactoryImages] = useState<string[]>(initialData.factoryImages);
  const [certificates, setCertificates] = useState(initialData.certificates);
  const [videoPosterPreview, setVideoPosterPreview] = useState(initialData.videoPoster);
  const [uploadingFactory, setUploadingFactory] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [isDraggingFactory, setIsDraggingFactory] = useState(false);
  const [isDraggingCert, setIsDraggingCert] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set("factoryImages", JSON.stringify(factoryImages));
      formData.set("certificates", JSON.stringify(certificates));

      await updateAboutPage(formData);
      alert("保存成功！");
    } catch (error) {
      console.error("Save failed:", error);
      alert("保存失败");
    } finally {
      setSaving(false);
    }
  }

  function handleHeroImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setHeroImagePreview(url);
    }
  }

  function handleVideoPosterChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoPosterPreview(url);
    }
  }

  // 批量上传工厂图片
  async function uploadFactoryFiles(files: FileList | File[]) {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) return;

    setUploadingFactory(true);
    try {
      const newUrls: string[] = [];
      for (const file of fileArray) {
        const formData = new FormData();
        formData.append("file", file);
        const result = await addFactoryImage(formData);
        if (result.success) {
          newUrls.push(result.url);
        }
      }
      setFactoryImages([...factoryImages, ...newUrls]);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("部分图片上传失败");
    } finally {
      setUploadingFactory(false);
    }
  }

  async function handleAddFactoryImage(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFactoryFiles(e.target.files);
      e.target.value = "";
    }
  }

  // 工厂图片拖拽处理
  function handleFactoryDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDraggingFactory(true);
  }

  function handleFactoryDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDraggingFactory(false);
  }

  async function handleFactoryDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDraggingFactory(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFactoryFiles(e.dataTransfer.files);
    }
  }

  async function handleRemoveFactoryImage(index: number) {
    const imgUrl = factoryImages[index];
    if (!confirm("确定要删除这张图片吗？")) return;

    try {
      await removeFactoryImage(imgUrl);
      setFactoryImages(factoryImages.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("删除失败");
    }
  }

  // 批量上传证书图片
  async function uploadCertificateFiles(files: FileList | File[]) {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) return;

    setUploadingCert(true);
    try {
      const newUrls: string[] = [];
      for (const file of fileArray) {
        const formData = new FormData();
        formData.append("file", file);
        const result = await addCertificateImage(formData);
        if (result.success) {
          newUrls.push(result.url);
        }
      }
      setCertificates([...certificates, ...newUrls]);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("部分图片上传失败");
    } finally {
      setUploadingCert(false);
    }
  }

  async function handleAddCertificateImage(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      await uploadCertificateFiles(e.target.files);
      e.target.value = "";
    }
  }

  // 证书图片拖拽处理
  function handleCertDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDraggingCert(true);
  }

  function handleCertDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDraggingCert(false);
  }

  async function handleCertDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDraggingCert(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadCertificateFiles(e.dataTransfer.files);
    }
  }

  async function handleRemoveCertificateImage(index: number) {
    const imgUrl = certificates[index];
    if (!confirm("确定要删除这张证书图片吗？")) return;

    try {
      await removeCertificateImage(imgUrl);
      setCertificates(certificates.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("删除失败");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      {/* ====== Hero Banner 部分 ====== */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">🎯 Hero Banner (顶部大图)</h2>
        <p className="admin-form-help">
          页面顶部的大图横幅区域
        </p>

        <div className="admin-form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
          <div>
            <div className="admin-form-group">
              <label className="admin-form-label">标题 (Hero Title)</label>
              <input
                type="text"
                name="heroTitle"
                defaultValue={initialData.heroTitle}
                className="admin-form-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">副标题 (Hero Subtitle)</label>
              <input
                type="text"
                name="heroSubtitle"
                defaultValue={initialData.heroSubtitle}
                className="admin-form-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">按钮文字 (Button Text)</label>
              <input
                type="text"
                name="heroButtonText"
                defaultValue={initialData.heroButtonText}
                className="admin-form-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">背景图片 (Hero Image)</label>
              <input
                type="file"
                name="heroImage"
                accept="image/*"
                onChange={handleHeroImageChange}
                className="admin-form-input"
                style={{ padding: "8px" }}
              />
              <p className="admin-form-help">不上传则保持原有图片</p>
            </div>
          </div>

          <div>
            <label className="admin-form-label">预览</label>
            <div
              style={{
                width: "100%",
                height: "250px",
                borderRadius: "8px",
                overflow: "hidden",
                position: "relative",
                background: "#f0f0f0",
              }}
            >
              {heroImagePreview && (
                <img
                  src={heroImagePreview}
                  alt="Hero preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}
              <div
                style={{
                  position: "absolute",
                  bottom: "0",
                  left: "0",
                  right: "0",
                  padding: "20px",
                  background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                  color: "white",
                }}
              >
                <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                  {initialData.heroTitle}
                </div>
                <div style={{ fontSize: "14px", opacity: "0.9" }}>
                  {initialData.heroSubtitle}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====== 公司简介部分 ====== */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">📝 Company Profile (公司简介)</h2>
        <p className="admin-form-help">
          左下角的公司简介文字区域
        </p>

        <div className="admin-form-group">
          <label className="admin-form-label">标题 (Intro Title)</label>
          <input
            type="text"
            name="introTitle"
            defaultValue={initialData.introTitle}
            className="admin-form-input"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">内容 (Intro Content)</label>
          <textarea
            name="introContent"
            defaultValue={initialData.introContent}
            className="admin-form-textarea"
            style={{ minHeight: "300px" }}
            placeholder="公司简介的详细内容..."
          />
        </div>
      </div>

      {/* ====== 工厂图片部分 ====== */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">🏭 Factory Images (工厂轮播图)</h2>
        <p className="admin-form-help">
          左上角的工厂图片轮播区域
        </p>

        <div className="admin-form-group">
          <label className="admin-form-label">标题 (Factory Title)</label>
          <input
            type="text"
            name="factoryTitle"
            defaultValue={initialData.factoryTitle}
            className="admin-form-input"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">
            工厂图片列表 ({factoryImages.length} 张)
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "15px",
              marginTop: "10px",
            }}
          >
            {factoryImages.map((img, index) => (
              <div
                key={index}
                style={{
                  position: "relative",
                  borderRadius: "8px",
                  overflow: "hidden",
                  aspectRatio: "4/3",
                  background: "#f0f0f0",
                }}
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
                <button
                  type="button"
                  onClick={() => handleRemoveFactoryImage(index)}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "rgba(230, 57, 70, 0.9)",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </button>
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    right: "0",
                    padding: "5px 10px",
                    background: "rgba(0,0,0,0.6)",
                    color: "white",
                    fontSize: "12px",
                  }}
                >
                  #{index + 1}
                </div>
              </div>
            ))}

            {/* 添加上传按钮 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                aspectRatio: "4/3",
                border: `2px dashed ${isDraggingFactory ? "#e63946" : "#ddd"}`,
                borderRadius: "8px",
                cursor: uploadingFactory ? "wait" : "pointer",
                background: isDraggingFactory ? "#fff0f1" : "#fafafa",
                transition: "all 0.3s",
                textAlign: "center",
                padding: "10px",
              }}
              onDragOver={handleFactoryDragOver}
              onDragLeave={handleFactoryDragLeave}
              onDrop={handleFactoryDrop}
              onClick={() => document.getElementById("factory-upload-input")?.click()}
            >
              <input
                id="factory-upload-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handleAddFactoryImage}
                style={{ display: "none" }}
                disabled={uploadingFactory}
              />
              <span style={{ fontSize: "32px", color: "#999" }}>+</span>
              <span style={{ fontSize: "13px", color: "#999", marginTop: "5px" }}>
                {uploadingFactory ? "上传中..." : "添加图片"}
              </span>
              <span style={{ fontSize: "11px", color: "#bbb", marginTop: "3px" }}>
                支持多选 / 拖拽上传
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ====== 证书部分 ====== */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">🏆 Certifications (证书展示)</h2>
        <p className="admin-form-help">
          中间竖栏的证书图片区域，上传证书图片
        </p>

        <div className="admin-form-group">
          <label className="admin-form-label">
            证书图片列表 ({certificates.length} 张)
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: "15px",
              marginTop: "10px",
            }}
          >
            {certificates.map((img, index) => (
              <div
                key={index}
                style={{
                  position: "relative",
                  borderRadius: "8px",
                  overflow: "hidden",
                  aspectRatio: "3/4",
                  background: "#f0f0f0",
                }}
              >
                <img
                  src={img}
                  alt={`Certificate ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    background: "#fff",
                    padding: "10px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCertificateImage(index)}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "rgba(230, 57, 70, 0.9)",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </button>
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    right: "0",
                    padding: "5px 10px",
                    background: "rgba(0,0,0,0.6)",
                    color: "white",
                    fontSize: "12px",
                    textAlign: "center",
                  }}
                >
                  #{index + 1}
                </div>
              </div>
            ))}

            {/* 添加上传按钮 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                aspectRatio: "3/4",
                border: `2px dashed ${isDraggingCert ? "#e63946" : "#ddd"}`,
                borderRadius: "8px",
                cursor: uploadingCert ? "wait" : "pointer",
                background: isDraggingCert ? "#fff0f1" : "#fafafa",
                transition: "all 0.3s",
                textAlign: "center",
                padding: "10px",
              }}
              onDragOver={handleCertDragOver}
              onDragLeave={handleCertDragLeave}
              onDrop={handleCertDrop}
              onClick={() => document.getElementById("cert-upload-input")?.click()}
            >
              <input
                id="cert-upload-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handleAddCertificateImage}
                style={{ display: "none" }}
                disabled={uploadingCert}
              />
              <span style={{ fontSize: "32px", color: "#999" }}>+</span>
              <span style={{ fontSize: "13px", color: "#999", marginTop: "5px" }}>
                {uploadingCert ? "上传中..." : "添加证书"}
              </span>
              <span style={{ fontSize: "11px", color: "#bbb", marginTop: "3px" }}>
                支持多选 / 拖拽上传
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ====== 视频部分 ====== */}
      <div className="admin-form-section">
        <h2 className="admin-form-section-title">🎬 Company Video (公司视频)</h2>
        <p className="admin-form-help">
          右侧竖栏的视频板块
        </p>

        <div className="admin-form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
          <div>
            <div className="admin-form-group" style={{ background: "#f0f9ff", padding: "15px", borderRadius: "8px", border: "2px solid #0ea5e9" }}>
              <label className="admin-form-label" style={{ color: "#0369a1", fontWeight: "700" }}>
                🎬 上传视频文件（主要用这个！）
              </label>
              <input
                type="file"
                name="videoFile"
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                className="admin-form-input"
                style={{ padding: "8px" }}
              />
              <p className="admin-form-help" style={{ color: "#0369a1" }}>
                ✅ 上传 mp4 视频文件，上传后自动播放
              </p>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">标题 (Video Title)</label>
              <input
                type="text"
                name="videoTitle"
                defaultValue={initialData.videoTitle}
                className="admin-form-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">视频地址 (Video URL)</label>
              <input
                type="text"
                name="videoUrl"
                defaultValue={initialData.videoUrl}
                className="admin-form-input"
                placeholder="视频文件路径或外部链接"
              />
              <p className="admin-form-help">一般不用填，上传视频后自动填充</p>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">🖼️ 视频封面图（图片，不是视频！）</label>
              <input
                type="file"
                name="videoPoster"
                accept="image/*"
                onChange={handleVideoPosterChange}
                className="admin-form-input"
                style={{ padding: "8px" }}
              />
              <p className="admin-form-help" style={{ color: "#dc2626" }}>
                ⚠️ 这里只能传图片！传视频会裂开！
              </p>
            </div>
          </div>

          <div>
            <label className="admin-form-label">预览</label>
            <div
              style={{
                width: "100%",
                height: "250px",
                borderRadius: "8px",
                overflow: "hidden",
                position: "relative",
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {videoPosterPreview ? (
                <img
                  src={videoPosterPreview}
                  alt="Video poster"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: "absolute",
                  }}
                />
              ) : null}
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "rgba(230, 57, 70, 0.9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  zIndex: 2,
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "13px",
                  marginTop: "15px",
                  zIndex: 2,
                }}
              >
                {initialData.videoTitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ====== 保存按钮 ====== */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "30px" }}>
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={saving}
          style={{ minWidth: "150px" }}
        >
          {saving ? "保存中..." : "💾 保存所有更改"}
        </button>
      </div>
    </form>
  );
}
