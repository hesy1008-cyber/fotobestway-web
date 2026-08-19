import { prisma } from "@/app/lib/prisma";
import NewPdfForm from "./NewPdfForm";

export default async function NewPdfPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: defaultCategoryId } = await searchParams;

  const categories = await prisma.pdfCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    where: { isActive: true },
  });

  return (
    <div>
      {/* 页面标题 */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">上传 PDF</h1>
          <p className="admin-page-subtitle">
            上传新的 PDF 文件到下载中心
          </p>
        </div>
        <Link href="/admin/pdfs" className="admin-btn admin-btn-secondary">
          ← 返回列表
        </Link>
      </div>

      <NewPdfForm
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          subtitle: c.subtitle || "",
        }))}
        defaultCategoryId={defaultCategoryId || ""}
      />
    </div>
  );
}

import Link from "next/link";
