import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import EditPdfCategoryForm from "./EditPdfCategoryForm";

export default async function EditPdfCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const category = await prisma.pdfCategory.findUnique({
    where: { id },
  });

  if (!category) {
    notFound();
  }

  return (
    <div>
      {/* 页面标题 */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">编辑 PDF 分类</h1>
          <p className="admin-page-subtitle">修改分类名称、排序等信息</p>
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
        <EditPdfCategoryForm
          category={{
            id: category.id,
            name: category.name,
            slug: category.slug,
            subtitle: category.subtitle,
            description: category.description,
            icon: category.icon,
            sortOrder: category.sortOrder,
            isActive: category.isActive,
          }}
        />
      </div>
    </div>
  );
}
