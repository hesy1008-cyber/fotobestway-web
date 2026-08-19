import { prisma } from "@/app/lib/prisma"
import EditCategoryForm from "./EditCategoryForm"
import Link from "next/link"

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{
    id: string
  }>
}) {
  const { id } = await params

  const category = await prisma.category.findUnique({
    where: {
      id
    }
  })

  if (!category) {
    return (
      <div>
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">分类不存在</h1>
          </div>
          <Link href="/admin/categories" className="admin-btn admin-btn-secondary">
            ← 返回分类列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">编辑分类</h1>
          <p className="admin-page-subtitle">
            修改分类信息和首页封面图
          </p>
        </div>
        <Link href="/admin/categories" className="admin-btn admin-btn-secondary">
          ← 返回分类列表
        </Link>
      </div>

      <EditCategoryForm
        category={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          bannerImage: category.bannerImage,
          bannerTitle: category.bannerTitle,
          bannerDescription: category.bannerDescription,
        }}
      />
    </div>
  )
}
