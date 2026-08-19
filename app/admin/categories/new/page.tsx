"use client"

import { useState } from "react"
import { createCategory } from "./actions"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewCategoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
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
    setMessage("")

    try {
      const formData = new FormData(e.currentTarget)
      const result = await createCategory(formData)

      if (result.success) {
        router.push("/admin/categories")
      } else {
        setMessage(result.message)
        setLoading(false)
      }
    } catch (error) {
      console.error("Create category failed:", error)
      setMessage("创建失败")
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">新增分类</h1>
          <p className="admin-page-subtitle">
            创建新的产品分类
          </p>
        </div>
        <Link href="/admin/categories" className="admin-btn admin-btn-secondary">
          ← 返回分类列表
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <input type="hidden" name="bannerImage" value={bannerPreview || ""} />

        <div className="admin-form-section">
          <h3 className="admin-form-section-title">基本信息</h3>

          <div className="admin-form-group">
            <label className="admin-form-label">分类名称</label>
            <input
              type="text"
              name="name"
              className="admin-form-input"
              placeholder="例如：Studio Lighting"
              required
            />
            <p className="admin-form-help">分类别名（URL）会自动根据名称生成</p>
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
              <label className="admin-form-label">封面图预览</label>
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
              className="admin-form-input"
              placeholder="留空则显示分类名称"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">封面描述（可选）</label>
            <textarea
              name="bannerDescription"
              className="admin-form-textarea"
              rows={3}
              placeholder="留空则显示默认文字"
            />
          </div>
        </div>

        {message && (
          <div style={{ color: "#e60012", fontSize: "14px", marginBottom: "20px" }}>
            {message}
          </div>
        )}

        <div className="admin-form-actions">
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={loading}
          >
            {loading ? "创建中..." : "创建分类"}
          </button>
          <Link href="/admin/categories" className="admin-btn admin-btn-secondary">
            取消
          </Link>
        </div>
      </form>
    </div>
  )
}
