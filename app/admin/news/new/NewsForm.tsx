"use client";

import { useState } from "react";
import Link from "next/link";
import { createNews } from "../actions";

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

export default function NewsForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await createNews(formData);
    } catch (error: any) {
      if (error?.message?.includes("NEXT_REDIRECT")) return;
      console.error("Create news failed:", error);
      alert("创建失败：" + (error?.message || "未知错误"));
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
          placeholder="例如：Fotobestway 发布全新 LED 摄影灯系列"
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
          placeholder="例如：new-led-light-series"
          className="admin-form-input"
          style={{ ...inputStyle, fontFamily: "monospace" }}
        />
        <p style={{ fontSize: "12px", color: "#999", marginTop: "6px", margin: 0 }}>
          英文小写，用连字符分隔，唯一标识，URL 中显示
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <div>
          <label style={labelStyle}>新闻分类</label>
          <select name="category" className="admin-form-input" style={inputStyle}>
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
            defaultValue={0}
            className="admin-form-input"
            style={inputStyle}
          />
          <p style={{ fontSize: "12px", color: "#999", marginTop: "6px", margin: 0 }}>
            数字越小越靠前
          </p>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>封面图 URL</label>
        <input
          type="text"
          name="coverImage"
          placeholder="/uploads/news-cover.jpg 或 https://..."
          className="admin-form-input"
          style={inputStyle}
        />
        <p style={{ fontSize: "12px", color: "#999", marginTop: "6px", margin: 0 }}>
          建议尺寸 1200x675px，显示在新闻列表和详情页顶部
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>摘要（简短描述）</label>
        <textarea
          name="summary"
          rows={2}
          placeholder="一句话概括这篇新闻的核心内容，显示在列表页"
          className="admin-form-input"
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>正文内容（支持 HTML）</label>
        <textarea
          name="content"
          rows={12}
          placeholder="<p>新闻正文内容...</p>"
          className="admin-form-input"
          style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: "13px" }}
        />
        <p style={{ fontSize: "12px", color: "#999", marginTop: "6px", margin: 0 }}>
          可以直接写 HTML 标签，如 &lt;p&gt;、&lt;h2&gt;、&lt;img&gt; 等
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "8px" }}>
          <input type="checkbox" name="isActive" defaultChecked />
          <span>立即发布（不勾选则保存为草稿）</span>
        </label>
      </div>

      {/* SEO 字段 */}
      <div
        style={{
          marginTop: "30px",
          paddingTop: "20px",
          borderTop: "1px solid #eee",
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#333", marginBottom: "20px" }}>
          SEO 设置（可选）
        </h3>

        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>SEO 标题</label>
          <input
            type="text"
            name="seoTitle"
            placeholder="搜索引擎显示的标题，留空则使用新闻标题"
            className="admin-form-input"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Meta 描述</label>
          <textarea
            name="metaDescription"
            rows={2}
            placeholder="搜索引擎结果中显示的描述"
            className="admin-form-input"
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>关键词</label>
          <input
            type="text"
            name="focusKeywords"
            placeholder="用逗号分隔，例如：photography, LED light, studio"
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
          {loading ? "创建中..." : "创建新闻"}
        </button>
      </div>
    </form>
  );
}
