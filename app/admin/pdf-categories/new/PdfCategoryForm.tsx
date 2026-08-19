"use client";

import { useState } from "react";
import Link from "next/link";
import { createPdfCategory } from "../actions";

export default function PdfCategoryForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await createPdfCategory(formData);
    } catch (error: any) {
      if (error?.message?.includes("NEXT_REDIRECT")) {
        return;
      }
      console.error("Create category failed:", error);
      alert("创建失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "13px",
            fontWeight: "600",
            color: "#333",
            marginBottom: "8px",
          }}
        >
          分类名称 <span style={{ color: "#e53935" }}>*</span>
        </label>
        <input
          type="text"
          name="name"
          required
          placeholder="例如：Product Manuals"
          className="admin-form-input"
          style={{ width: "100%" }}
        />
        <p style={{ fontSize: "12px", color: "#999", marginTop: "6px", margin: "6px 0 0 0" }}>
          显示在前台的分类标题
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "13px",
            fontWeight: "600",
            color: "#333",
            marginBottom: "8px",
          }}
        >
          标识 (slug) <span style={{ color: "#e53935" }}>*</span>
        </label>
        <input
          type="text"
          name="slug"
          required
          placeholder="例如：manuals"
          className="admin-form-input"
          style={{ width: "100%", fontFamily: "monospace" }}
        />
        <p style={{ fontSize: "12px", color: "#999", marginTop: "6px", margin: "6px 0 0 0" }}>
          英文小写，用连字符分隔，唯一标识，创建后尽量不要修改
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "13px",
            fontWeight: "600",
            color: "#333",
            marginBottom: "8px",
          }}
        >
          副标题
        </label>
        <input
          type="text"
          name="subtitle"
          placeholder="例如：USER GUIDES & QUICK START"
          className="admin-form-input"
          style={{ width: "100%" }}
        />
        <p style={{ fontSize: "12px", color: "#999", marginTop: "6px", margin: "6px 0 0 0" }}>
          显示在标题上方的小字，全大写更佳
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "13px",
            fontWeight: "600",
            color: "#333",
            marginBottom: "8px",
          }}
        >
          描述
        </label>
        <textarea
          name="description"
          rows={2}
          placeholder="分类的简短描述"
          className="admin-form-input"
          style={{ width: "100%", resize: "vertical" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#333",
              marginBottom: "8px",
            }}
          >
            图标 (emoji)
          </label>
          <input
            type="text"
            name="icon"
            placeholder="📘"
            className="admin-form-input"
            style={{ width: "100%", fontSize: "18px" }}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#333",
              marginBottom: "8px",
            }}
          >
            排序
          </label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={0}
            className="admin-form-input"
            style={{ width: "100%" }}
          />
          <p style={{ fontSize: "12px", color: "#999", marginTop: "6px", margin: "6px 0 0 0" }}>
            数字越小越靠前
          </p>
        </div>
      </div>

      {/* 提交按钮 */}
      <div style={{ display: "flex", gap: "12px", marginTop: "30px" }}>
        <Link
          href="/admin/pdf-categories"
          className="admin-btn admin-btn-secondary"
        >
          取消
        </Link>
        <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
          {loading ? "创建中..." : "创建分类"}
        </button>
      </div>
    </form>
  );
}
