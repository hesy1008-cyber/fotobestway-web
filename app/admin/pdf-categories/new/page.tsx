import Link from "next/link";
import PdfCategoryForm from "./PdfCategoryForm";

export default function NewPdfCategoryPage() {
  return (
    <div>
      {/* 页面标题 */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">新增 PDF 分类</h1>
          <p className="admin-page-subtitle">创建新的下载中心分类模块</p>
        </div>
        <Link
          href="/admin/pdf-categories"
          className="admin-btn admin-btn-secondary"
        >
          ← 返回列表
        </Link>
      </div>

      {/* 表单 */}
      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 15px rgba(0,0,0,0.06)",
          padding: "30px",
          maxWidth: "600px",
        }}
      >
        <PdfCategoryForm />
      </div>
    </div>
  );
}
