"use client";

import { useState } from "react";
import Link from "next/link";
import { updateNews } from "../../actions";

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
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

      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>封面图 URL</label>
        <input
          type="text"
          name="coverImage"
          defaultValue={news.coverImage || ""}
          className="admin-form-input"
          style={inputStyle}
        />
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
        <label style={labelStyle}>正文内容（支持 HTML）</label>
        <textarea
          name="content"
          rows={12}
          defaultValue={news.content || ""}
          className="admin-form-input"
          style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: "13px" }}
        />
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
