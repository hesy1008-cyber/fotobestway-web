import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { createSubCategory } from "../../../sub-category-actions";

export default async function NewSubCategoryPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: {
      id: id,
    },
  });

  if (!category) {
    return (
      <div>
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">分类不存在</h1>
          </div>
          <Link
            href="/admin/categories"
            className="admin-btn admin-btn-secondary"
          >
            ← 返回分类列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 页面标题 */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">新增子分类</h1>
          <p className="admin-page-subtitle">
            为 {category.name} 添加新的子分类
          </p>
        </div>
        <Link
          href={`/admin/categories/${id}/sub-categories`}
          className="admin-btn admin-btn-secondary"
        >
          ← 返回子分类列表
        </Link>
      </div>

      <form action={createSubCategory} className="admin-form">
        <input type="hidden" name="categoryId" value={id} />

        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">子分类名称 *</label>
            <input
              name="name"
              className="admin-form-input"
              required
              placeholder="例如：LED Lights"
            />
            <p className="admin-form-help">分类别名（URL）会自动根据名称生成</p>
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">排序</label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={0}
            className="admin-form-input"
            style={{ maxWidth: "200px" }}
          />
          <p className="admin-form-help">数字越小越靠前</p>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary">
            创建子分类
          </button>
          <Link
            href={`/admin/categories/${id}/sub-categories`}
            className="admin-btn admin-btn-secondary"
            style={{ textDecoration: "none" }}
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}
