"use client"

import { useState } from "react"
import { updateCategory } from "./actions"

export default function EditCategoryForm({
  category
}: {
  category: {
    id: string
    name: string
    slug: string
    bannerImage?: string | null
    bannerTitle?: string | null
    bannerDescription?: string | null
  }
}) {
  const [loading, setLoading] = useState(false)
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    category.bannerImage || null
  )
  const [uploading, setUploading] = useState(false)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")

      const data = await res.json()
      setBannerPreview(data.url)
    } catch (error) {
      console.error("Upload error:", error)
      alert("图片上传失败")
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      await updateCategory(formData)
    } catch (error: any) {
      if (error?.message?.includes("NEXT_REDIRECT")) {
        return
      }
      console.error("Update category failed:", error)
      alert("保存失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <input type="hidden" name="id" value={category.id} />
      <input type="hidden" name="bannerImage" value={bannerPreview || ""} />

      <div className="admin-form-section">
        <h3 className="admin-form-section-title">基本信息</h3>

        <div className="admin-form-group">
          <label className="admin-form-label">分类名称</label>
          <input
            type="text"
            name="name"
            defaultValue={category.name}
            className="admin-form-input"
            required
          />
          <p className="admin-form-help">分类别名（URL）创建时自动生成，修改名称不会改变 URL</p>
        </div>
      </div>

      <div className="admin-form-section">
        <h3 className="admin-form-section-title">首页分类封面图</h3>
        <p style={{ fontSize: "13px", color: "#999", margin: "0 0 20px" }}>
          这张图会显示在首页六个板块的对应分类位置
        </p>

        <div className="admin-form-group">
          <label className="admin-form-label">上传封面图</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="admin-form-file"
            disabled={uploading}
          />
          {uploading && (
            <p style={{ fontSize: "13px", color: "#666", marginTop: "8px" }}>
              上传中...
            </p>
          )}
        </div>

        {bannerPreview && (
          <div className="admin-form-group">
            <label className="admin-form-label">当前封面图预览</label>
            <div className="admin-main-image-preview">
              <img src={bannerPreview} alt="分类封面图" />
              <div className="admin-main-image-label">封面图</div>
            </div>
          </div>
        )}

        <div className="admin-form-group">
          <label className="admin-form-label">封面标题（可选）</label>
          <input
            type="text"
            name="bannerTitle"
            defaultValue={category.bannerTitle || ""}
            className="admin-form-input"
            placeholder="留空则显示分类名称"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">封面描述（可选）</label>
          <textarea
            name="bannerDescription"
            defaultValue={category.bannerDescription || ""}
            className="admin-form-textarea"
            rows={3}
            placeholder="留空则显示默认文字"
          />
        </div>
      </div>

      <div className="admin-form-actions">
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={loading}
        >
          {loading ? "保存中..." : "保存修改"}
        </button>
        <a href="/admin/categories" className="admin-btn admin-btn-secondary">
          取消
        </a>
      </div>
    </form>
  )
}
