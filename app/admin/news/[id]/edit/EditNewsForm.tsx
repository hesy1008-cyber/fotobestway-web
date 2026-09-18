"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { updateNews } from "../../actions";
import NewsContentEditor from "@/app/components/NewsContentEditor";

const labelStyle = {
  display: "block" as const,
  fontSize: "13px",
  fontWeight: 600,
  color: "#333",
  marginBottom: "8px",
};

const inputStyle = {
  width: "100%",
};

type NewsItem = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  coverImage: string | null;
  category: string;
  sortOrder: number;
  isActive: boolean;
  seoTitle: string | null;
  metaDescription: string | null;
  focusKeywords: string | null;
};

export default function EditNewsForm({ news }: { news: NewsItem }) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(news.content || "");
  const [coverImage, setCoverImage] = useState(news.coverImage || "");
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  async function uploadCoverFile(file: File) {
    setCoverUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/news", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setCoverImage(data.url);
      else alert("上传失败：" + (data.error || "未知错误"));
    } catch (err) {
      alert("上传失败：" + (err instanceof Error ? err.message : "未知错误"));
    } finally {
      setCoverUploading(false);
    }
  }
  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) await uploadCoverFile(file);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("content", content);
      formData.set("coverImage", coverImage);
      await updateNews(news.id, formData);
    } catch (error: any) {
      if (error?.message?.includes("NEXT_REDIRECT")) return;
      console.error("Update news failed:", error);
      alert("保存失败：" + (error?.message || "未知错误"));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>
          新闻标题 <span style={{ color: "#e53935" }}>*</span>
        </label>
        <input
          type="text"
          name="title"
          required
          defaultValue={news.title}
          className="admin-form-input"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>
          标识 (slug) <span style={{ color: "#e53935" }}>*</span>
        </label>
        <input
          type="text"
          name="slug"
          required
          defaultValue={news.slug}
          className="admin-form-input"
          style={{ ...inputStyle, fontFamily: "monospace" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <div>
          <label style={labelStyle}>新闻分类</label>
          <select name="category" defaultValue={news.category} className="admin-form-input" style={inputStyle}>
            <option value="Company News">Company News（公司新闻）</option>
            <option value="Product Launch">Product Launch（产品发布）</option>
            <option value="Industry Insights">Industry Insights（行业资讯）</option>
            <option value="Event">Event（活动展会）</option>
            <option value="Award">Award（荣誉奖项）</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>排序</label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={news.sortOrder}
            className="admin-form-input"
            style={inputStyle}
          />
        </div>
      </div>

      <div
        style={{ marginBottom: "20px" }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => {
          e.preventDefault(); e.stopPropagation();
          const file = e.dataTransfer.files?.[0];
          if (file && file.type.startsWith("image/")) void uploadCoverFile(file);
        }}
      >
        <label style={labelStyle}>封面图（可点击或拖拽上传）</label>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverUpload}
          style={{ display: "none" }}
        />
        {coverImage ? (
          <div style={{ position: "relative", display: "inline-block" }}>
            <img src={coverImage} alt="cover" style={{ maxWidth: "400px", borderRadius: "8px", display: "block" }} />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              style={{ position: "absolute", top: "8px", right: "8px", padding: "6px 12px", fontSize: "12px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              更换
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={coverUploading}
            style={{ padding: "40px 20px", width: "100%", maxWidth: "400px", border: "2px dashed #ccc", borderRadius: "8px", background: "#fff", fontSize: "14px", color: "#888", cursor: "pointer" }}
          >
            {coverUploading ? "上传中..." : "点击上传封面图"}
          </button>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>摘要（简短描述）</label>
        <textarea
          name="summary"
          rows={2}
          defaultValue={news.summary || ""}
          className="admin-form-input"
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>正文内容（图文混排）</label>
        <NewsContentEditor value={content} onChange={setContent} />
        <p style={{ fontSize: "12px", color: "#999", marginTop: "8px", margin: 0 }}>
          添加文字段落和图片块，拖拽上下箭头调整顺序，图片会自动上传
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "8px" }}>
          <input type="checkbox" name="isActive" defaultChecked={news.isActive} />
          <span>已发布（不勾选则为草稿）</span>
        </label>
      </div>

      <div style={{ marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #eee" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#333", marginBottom: "20px" }}>
          SEO 设置
        </h3>
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>SEO 标题</label>
          <input
            type="text"
            name="seoTitle"
            defaultValue={news.seoTitle || ""}
            className="admin-form-input"
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Meta 描述</label>
          <textarea
            name="metaDescription"
            rows={2}
            defaultValue={news.metaDescription || ""}
            className="admin-form-input"
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>关键词</label>
          <input
            type="text"
            name="focusKeywords"
            defaultValue={news.focusKeywords || ""}
            className="admin-form-input"
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "30px" }}>
        <Link href="/admin/news" className="admin-btn admin-btn-secondary">
          取消
        </Link>
        <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
          {loading ? "保存中..." : "保存修改"}
        </button>
      </div>
    </form>
  );
}
