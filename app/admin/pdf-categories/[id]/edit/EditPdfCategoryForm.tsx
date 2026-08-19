"use client";

import { useState } from "react";
import Link from "next/link";
import { updatePdfCategory } from "../../actions";

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function EditPdfCategoryForm({
  category,
}: {
  category: CategoryData;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await updatePdfCategory(formData);
    } catch (error: any) {
      if (error?.message?.includes("NEXT_REDIRECT")) {
        return;
      }
      console.error("Update category failed:", error);
      alert("保存失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={category.id} />
      <input type="hidden" name="slug" value={category.slug} />

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
          defaultValue={category.name}
          className="admin-form-input"
          style={{ width: "100%" }}
        />
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
          defaultValue={category.subtitle || ""}
          placeholder="例如：USER GUIDES & QUICK START"
          className="admin-form-input"
          style={{ width: "100%" }}
        />
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
          defaultValue={category.description || ""}
          placeholder="分类的简短描述"
          className="admin-form-input"
          style={{ width: "100%", resize: "vertical" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>
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
            defaultValue={category.icon || ""}
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
            defaultValue={category.sortOrder}
            className="admin-form-input"
            style={{ width: "100%" }}
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
            状态
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={category.isActive}
              style={{ width: "16px", height: "16px" }}
            />
            <span style={{ fontSize: "14px", color: "#333" }}>启用</span>
          </label>
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
          {loading ? "保存中..." : "保存修改"}
        </button>
      </div>
    </form>
  );
}
