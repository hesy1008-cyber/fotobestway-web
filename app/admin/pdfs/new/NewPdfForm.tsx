"use client";

import { useState } from "react";
import Link from "next/link";
import { createPdf } from "../actions";

interface CategoryOption {
  id: string;
  name: string;
  subtitle: string;
}

export default function NewPdfForm({
  categories,
  defaultCategoryId,
}: {
  categories: CategoryOption[];
  defaultCategoryId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setFileUrl(data.url);
      setFileName(data.fileName);
      setFileSize(data.fileSize);
    } catch (error) {
      console.error("Upload error:", error);
      alert("PDF 上传失败");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await createPdf(formData);
    } catch (error: any) {
      if (error?.message?.includes("NEXT_REDIRECT")) {
        return;
      }
      console.error("Create PDF failed:", error);
      alert("创建失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <input type="hidden" name="fileName" value={fileName} />
      <input type="hidden" name="fileSize" value={fileSize.toString()} />
      <input type="hidden" name="fileUrl" value={fileUrl} />

      <div className="admin-form-section">
        <h3 className="admin-form-section-title">基本信息</h3>

        <div className="admin-form-group">
          <label className="admin-form-label">文件标题 *</label>
          <input
            type="text"
            name="title"
            className="admin-form-input"
            placeholder="例如：PL-400B LED Light User Manual"
            required
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">分类 *</label>
          <select
            name="categoryId"
            className="admin-form-input"
            required
            defaultValue={defaultCategoryId || ""}
          >
            <option value="" disabled>
              请选择分类
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
                {cat.subtitle ? ` (${cat.subtitle})` : ""}
              </option>
            ))}
          </select>
          <p className="admin-form-help">
            没有想要的分类？
            <Link
              href="/admin/pdf-categories/new"
              style={{ color: "#e60012", textDecoration: "none", marginLeft: "4px" }}
            >
              去创建 →
            </Link>
          </p>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">上传 PDF 文件 *</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="admin-form-file"
            disabled={uploading}
          />
          {uploading && (
            <p style={{ fontSize: "13px", color: "#666", marginTop: "8px" }}>
              上传中...
            </p>
          )}
          {fileUrl && (
            <div style={{ marginTop: "12px", padding: "12px", background: "#f5f5f5", borderRadius: "4px" }}>
              <p style={{ fontSize: "13px", color: "#333", margin: "0 0 8px" }}>
                ✅ 上传成功：{fileName}
              </p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "13px", color: "#e60012", textDecoration: "none" }}
              >
                点击预览 →
              </a>
            </div>
          )}
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">排序</label>
          <input
            type="number"
            name="sortOrder"
            defaultValue="0"
            className="admin-form-input"
            style={{ width: "120px" }}
          />
          <p className="admin-form-help">数字越小越靠前，默认为 0</p>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-checkbox-label">
            <input type="checkbox" name="isActive" defaultChecked />
            <span>启用（在前台页面显示）</span>
          </label>
        </div>
      </div>

      <div className="admin-form-actions">
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={loading || !fileUrl}
        >
          {loading ? "保存中..." : "创建 PDF"}
        </button>
        <Link href="/admin/pdfs" className="admin-btn admin-btn-secondary">
          取消
        </Link>
      </div>
    </form>
  );
}
